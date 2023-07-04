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
import {
  Conflict,
  ConflictSource,
  Definition,
  DefinitionsByModule,
  DefinitionsByName,
  LookupTable,
  builtinNames,
} from './base'
import { QuintError } from '../quintError'

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

  private collectDefinition(identifier: string, def: Definition, source?: bigint): void {
    if (identifier === '_') {
      // Don't collect underscores, as they are special identifiers that allow no usage
      return
    }

    if (builtinNames.includes(identifier)) {
      // Conflict with a built-in name
      this.recordConflict({
        identifier,
        sources: [{ kind: 'builtin' }, sourceFrom(source ?? def.reference)],
      })

      return
    }

    if (this.definitionsByName.has(identifier)) {
      // Conflict with a previous definition
      this.recordConflict({
        identifier,
        sources: [sourceFrom(this.definitionsByName.get(identifier)!.reference), sourceFrom(source ?? def.reference)],
      })

      return
    }

    this.definitionsByName.set(identifier, def)
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
      this.errors.push({
        code: 'QNT407',
        message: `Cannot instantiate ${def.protoName} inside ${def.protoName}`,
        reference: def.id,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Instantiating a non-existing module
      this.errors.push({
        code: 'QNT404',
        message: `Module '${def.protoName}' not found`,
        reference: def.id,
        data: {},
      })
      return
    }
    const instanceTable = new Map([...moduleTable.entries()])
    if (def.qualifiedName) {
      this.definitionsByModule.set(def.qualifiedName, instanceTable)
    }

    // For each override, check if the name exists in the instantiated module and is a constant.
    // If so, update the value definition to point to the expression being overriden
    def.overrides.forEach(([name, ex]) => {
      const constDef = instanceTable.get(name.name)

      if (!constDef) {
        this.errors.push({
          code: 'QNT406',
          message: `Instantiation error: '${name.name}' not found in '${def.protoName}'`,
          reference: def.id,
          data: {},
        })
        return
      }

      if (constDef.kind !== 'const') {
        this.errors.push({
          code: 'QNT406',
          message: `Instantiation error: '${name.name}' is not a constant`,
          reference: def.id,
          data: {},
        })
        return
      }
      instanceTable.set(name.name, { ...constDef, reference: ex.id })
    })

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newEntries = copyNames(instanceTable, def.qualifiedName, true)
    this.definitionsByName = this.mergeTables(this.definitionsByName, newEntries)

    // Resolve names for overrides
    def.overrides.forEach(([name, _]) => {
      const qualifiedName = def.qualifiedName ? `${def.qualifiedName}::${name.name}` : name.name
      this.resolveName(qualifiedName, name.id)
    })
  }

  enterImport(def: QuintImport): void {
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.errors.push({
        code: 'QNT407',
        message: `Cannot import ${def.protoName} inside ${def.protoName}`,
        reference: def.id,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Importing unexisting module
      this.errors.push({
        code: 'QNT404',
        message: `Module '${def.protoName}' not found`,
        reference: def.id,
        data: {},
      })
      return
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const importableDefinitions = copyNames(moduleTable, qualifier, true)
    if (!def.defName || def.defName === '*') {
      // Imports all definitions
      this.definitionsByName = this.mergeTables(this.definitionsByName, importableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      const newDef = importableDefinitions.get(def.defName)
      if (!newDef) {
        this.errors.push({
          code: 'QNT405',
          message: `Name '${def.protoName}::${def.defName}' not found`,
          reference: def.id,
          data: {},
        })
        return
      }

      this.collectDefinition(def.defName, newDef, def.id)
    }
  }

  // Imported names are copied with a scope since imports are not transitive by
  // default. Exporting needs to turn those names into unscoped ones so, when
  // the current module is imported, the names are accessible. Note that it is
  // also possible to export names that were not previously imported via `import`.
  enterExport(def: QuintExport) {
    if (def.protoName === this.currentModuleName) {
      // Exporting current module
      this.errors.push({
        code: 'QNT407',
        message: `Cannot export ${def.protoName} inside ${def.protoName}`,
        reference: def.id,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Exporting unexisting module
      this.errors.push({
        code: 'QNT404',
        message: `Module '${def.protoName}' not found`,
        reference: def.id,
        data: {},
      })
      return
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const exportableDefinitions = copyNames(moduleTable, qualifier)

    if (!def.defName || def.defName === '*') {
      // Export all definitions
      this.definitionsByName = this.mergeTables(this.definitionsByName, exportableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      const newDef = exportableDefinitions.get(def.defName)

      if (!newDef) {
        this.errors.push({
          code: 'QNT405',
          message: `Name '${def.protoName}::${def.defName}' not found`,
          reference: def.id,
          data: {},
        })
        return
      }

      this.collectDefinition(def.defName, newDef, def.id)
    }
  }

  // Check that there is a value definition for `name` under scope `id`
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

  private mergeTables(t1: DefinitionsByName, t2: DefinitionsByName): DefinitionsByName {
    t2.forEach((def, identifier) => {
      if (t1.has(identifier) && t1.get(identifier)!.reference !== def.reference) {
        this.recordConflict({
          identifier,
          sources: [sourceFrom(t1.get(identifier)!.reference), sourceFrom(def.reference)],
        })
      }
    })

    return new Map([...t1.entries(), ...t2.entries()])
  }

  private recordNameError(name: string, id: bigint) {
    this.errors.push({
      code: 'QNT404',
      message: `Name '${name}' not found`,
      reference: id,
      data: {},
    })
  }

  private recordConflict(conflict: Conflict): void {
    const message = conflict.sources.some(source => source.kind === 'builtin')
      ? `Built-in name '${conflict.identifier}' is redefined in module '${this.currentModuleName}'`
      : `Conflicting definitions found for name '${conflict.identifier}' in module '${this.currentModuleName}'`

    conflict.sources.forEach(source => {
      // The built-in source is not a real definition, so it should not be
      // reported as a conflict
      if (source.kind === 'builtin') {
        return
      }

      this.errors.push({ code: 'QNT101', message, reference: source.reference, data: {} })
    })
  }
}

function sourceFrom(reference: bigint): ConflictSource {
  return { kind: 'user', reference }
}

/**
 * Copy the names of a definitions table to a new one, ignoring scoped and default
 * definitions, and optionally adding a namespace.
 *
 * @param originTable the definitions table to copy from
 * @param namespace optional namespace to be added to copied names
 * @param scope whether to the copied definitions are scoped
 *
 * @returns a definitions table with the filtered and namespaced names
 */
export function copyNames(originTable: DefinitionsByName, namespace?: string, scoped?: boolean): DefinitionsByName {
  const table = new Map()

  originTable.forEach((def, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier
    if (!def.scoped) {
      table.set(name, { ...def, identifier: name, scoped })
    }
  })

  return table
}
