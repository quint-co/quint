import { Either, left, right } from '@sweet-monads/either'
import { IRVisitor, walkModule } from '../IRVisitor'
import {
  QuintApp,
  QuintAssume,
  QuintConst,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintLambda,
  QuintLet,
  QuintModule,
  QuintName,
  QuintOpDef,
  QuintTypeDef,
  QuintVar,
} from '../quintIr'
import { QuintConstType } from '../quintTypes'
import { Definition, DefinitionsByModule, DefinitionsByName, LookupTable, builtinNames, copyNames } from './base'
import { QuintError } from '../quintError'
import {
  moduleNotFoundError,
  nameNotFoundError,
  paramIsNotAConstantError,
  paramNotFoundError,
  selfReferenceError,
} from './importErrors'

export function resolveNames(quintModules: QuintModule[]): Either<QuintError[], LookupTable> {
  const visitor = new NameResolver()
  quintModules.forEach(module => {
    walkModule(visitor, module)
  })
  return visitor.errors.length > 0 ? left(visitor.errors) : right(visitor.table)
}

export class NameResolver implements IRVisitor {
  definitionsByName: DefinitionsByName = new Map()
  definitionsByModule: DefinitionsByModule = new Map()
  errors: QuintError[] = []
  table: LookupTable = new Map()
  private currentModuleName: string = ''

  enterModule(module: QuintModule): void {
    this.currentModuleName = module.name
  }

  exitModule(module: QuintModule): void {
    this.definitionsByModule.set(module.name, this.definitionsByName)
    this.definitionsByName = new Map()
  }

  enterVar(def: QuintVar): void {
    this.collectDefinition(def.name, { kind: def.kind, reference: def.id, typeAnnotation: def.typeAnnotation })
  }

  enterConst(def: QuintConst): void {
    this.collectDefinition(def.name, { kind: def.kind, reference: def.id, typeAnnotation: def.typeAnnotation })
  }

  enterOpDef(def: QuintOpDef): void {
    // FIXME: we used to collect type annotations only for top-level opdefs. If
    // we collect them for all defs, something breaks in the type checker. We
    // should fix that and then ensure that we collect type annotations here.
    this.collectDefinition(def.name, { kind: def.kind, reference: def.id })
  }

  exitLet(expr: QuintLet): void {
    this.definitionsByName.delete(expr.opdef.name)
  }

  enterTypeDef(def: QuintTypeDef): void {
    this.collectDefinition(def.name, { kind: 'type', reference: def.id, typeAnnotation: def.type })
  }

  enterAssume(def: QuintAssume): void {
    this.collectDefinition(def.name, { kind: 'assumption', reference: def.id })
  }

  enterLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.collectDefinition(p.name, { kind: 'param', reference: p.id })
    })
  }

  exitLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.definitionsByName.delete(p.name)
    })
  }

  enterName(nameExpr: QuintName): void {
    // This is a name expression, the name must be defined
    // either globally or under a scope that contains the expression
    // The list of scopes containing the expression is accumulated in param scopes
    this.resolveName(nameExpr.name, nameExpr.id)
  }

  enterApp(appExpr: QuintApp): void {
    // Application, check that the operator being applied is defined
    this.resolveName(appExpr.opcode, appExpr.id)
  }

  enterConstType(type: QuintConstType): void {
    // Type is a name, check that it is defined
    const def = this.definitionsByName.get(type.name)
    if (!def || def.kind !== 'type') {
      this.recordNameError(type.name, type.id!)
      return
    }

    this.table.set(type.id!, def)
  }

  enterInstance(def: QuintInstance): void {
    // Copy defs from the module being instantiated
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Instantiating a non-existing module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    const instanceTable = new Map([...moduleTable.entries()])
    if (def.qualifiedName) {
      this.definitionsByModule.set(def.qualifiedName, instanceTable)
    }

    // For each override, check if the name exists in the instantiated module and is a constant.
    // If so, update the value definition to point to the expression being overriden
    def.overrides.forEach(([param, ex]) => {
      const constDef = instanceTable.get(param.name)

      if (!constDef) {
        this.errors.push(paramNotFoundError(def, param))
        return
      }

      if (constDef.kind !== 'const') {
        this.errors.push(paramIsNotAConstantError(def, param))
        return
      }

      // Update the definition to point to the expression being overriden
      instanceTable.set(param.name, { ...constDef, reference: ex.id })
    })

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newDefs = copyNames(instanceTable, def.qualifiedName, true)
    this.collectDefinitions(newDefs)

    // Resolve param names in the current module
    def.overrides.forEach(([param, _]) => {
      const qualifiedName = def.qualifiedName ? `${def.qualifiedName}::${param.name}` : param.name
      this.resolveName(qualifiedName, param.id)
    })
  }

  enterImport(def: QuintImport): void {
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Importing unexisting module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const importableDefinitions = copyNames(moduleTable, qualifier, true)

    if (!def.defName || def.defName === '*') {
      // Imports all definitions
      this.collectDefinitions(importableDefinitions)
      return
    }

    // Tries to find a specific definition, reporting an error if not found
    const newDef = importableDefinitions.get(def.defName)
    if (!newDef) {
      this.errors.push(nameNotFoundError(def))
      return
    }

    this.collectDefinition(def.defName, newDef, def.id)
  }

  // Imported names are copied with a scope since imports are not transitive by
  // default. Exporting needs to turn those names into unscoped ones so, when
  // the current module is imported, the names are accessible. Note that it is
  // also possible to export names that were not previously imported via `import`.
  enterExport(def: QuintExport) {
    if (def.protoName === this.currentModuleName) {
      // Exporting current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Exporting unexisting module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const exportableDefinitions = copyNames(moduleTable, qualifier)

    if (!def.defName || def.defName === '*') {
      // Export all definitions
      this.collectDefinitions(exportableDefinitions)
      return
    }

    // Tries to find a specific definition, reporting an error if not found
    const newDef = exportableDefinitions.get(def.defName)

    if (!newDef) {
      this.errors.push(nameNotFoundError(def))
      return
    }

    this.collectDefinition(def.defName, newDef, def.id)
  }

  private collectDefinition(identifier: string, def: Definition, source?: bigint): void {
    if (identifier === '_') {
      // Don't collect underscores, as they are special identifiers that allow no usage
      return
    }

    if (builtinNames.includes(identifier)) {
      // Conflict with a built-in name
      this.recordConflict(identifier, undefined, source ?? def.reference)
      return
    }

    if (this.definitionsByName.has(identifier)) {
      // Conflict with a previous definition
      this.recordConflict(identifier, this.definitionsByName.get(identifier)!.reference, source ?? def.reference)
      return
    }

    this.definitionsByName.set(identifier, def)
  }

  private collectDefinitions(newDefs: DefinitionsByName): void {
    newDefs.forEach((def, identifier) => {
      const existingEntry = this.definitionsByName.get(identifier)
      if (existingEntry && existingEntry.reference !== def.reference) {
        this.recordConflict(identifier, existingEntry.reference, def.reference)
      }
    })

    this.definitionsByName = new Map([...this.definitionsByName.entries(), ...newDefs.entries()])
  }

  private resolveName(name: string, id: bigint) {
    if (builtinNames.includes(name)) {
      return
    }

    const def = this.definitionsByName.get(name)
    if (!def || def.kind === 'type') {
      this.recordNameError(name, id)
      return
    }

    this.table.set(id, { kind: def.kind, reference: def.reference, typeAnnotation: def.typeAnnotation })
  }

  private recordNameError(name: string, id: bigint) {
    this.errors.push({
      code: 'QNT404',
      message: `Name '${name}' not found`,
      reference: id,
      data: {},
    })
  }

  private recordConflict(identifier: string, exisitingSource: bigint | undefined, newSource: bigint): void {
    // exisitingSource is undefined when the conflict is with a built-in name
    const message = exisitingSource
      ? `Conflicting definitions found for name '${identifier}' in module '${this.currentModuleName}'`
      : `Built-in name '${identifier}' is redefined in module '${this.currentModuleName}'`

    if (exisitingSource) {
      this.errors.push({ code: 'QNT101', message, reference: exisitingSource, data: {} })
    }

    this.errors.push({ code: 'QNT101', message, reference: newSource, data: {} })
  }
}
