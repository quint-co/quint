import { Either, left, right } from '@sweet-monads/either'
import { IRVisitor, walkModule } from '../IRVisitor'
import {
  QuintApp,
  QuintAssume,
  QuintConst,
  QuintDef,
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
import { QuintConstType, QuintType } from '../quintTypes'
import { ValueDefinitionKind } from './definitionsByName'
import { LookupTable } from './lookupTable'
import { NameError } from './nameResolver'
import { defaultValueDefinitions } from './definitionsCollector'
import { QuintError } from '../quintError'

/**
 * A named operator definition. Can be scoped or module-wide (unscoped).
 */
export interface ValueDefinition {
  /* Same as QuintDef kinds */
  kind: ValueDefinitionKind
  /* The name given to the defined operator */
  identifier: string
  /* Expression or definition id from where the name was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the QuintIr node that introduces the name */
  scoped?: boolean
  /* Optional type annotation */
  typeAnnotation?: QuintType
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  kind: 'type'
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased (none for uninterpreted type) */
  type?: QuintType
  /* Expression or definition id from where the type was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the QuintIr node that introduces the name */
  scoped?: bigint
}
type DefinitionsByName = Map<string, ValueDefinition | TypeDefinition>
/**
 * Definitions tables for each module
 */
export type DefinitionsByModule = Map<string, DefinitionsByName>

/**
 * The source of a conflict occurrences
 */
export type ConflictSource =
  /* A user definition, referencing its IR node id */
  | { kind: 'user'; reference: bigint }
  /* A built-in definition, no reference */
  | { kind: 'builtin' }

/**
 * Error report for a found name conflict
 */
export interface Conflict {
  /* Either a 'type' or 'value' conflict */
  kind: string
  /* The name that has a conflict */
  identifier: string
  /* Sources of the occurrences of the conflicting name */
  sources: ConflictSource[]
}

/**
 * The result of name resolution for a Quint Module.
 */
export type NameResolutionResult = Either<[Conflict[], NameError[], QuintError[]], LookupTable>

export function resolveNames(quintModules: QuintModule[]): NameResolutionResult {
  const visitor = new NameResolver()
  quintModules.forEach(module => {
    walkModule(visitor, module)
  })
  const errors: [Conflict[], NameError[], QuintError[]] = [
    visitor.conflicts,
    visitor.errors,
    [...visitor.importErrors.values()],
  ]
  // FIXME: return flat QuintError[]
  return errors[0].length > 0 || errors[1].length > 0 || errors[2].length > 0 ? left(errors) : right(visitor.table)
}

export class NameResolver implements IRVisitor {
  definitionsByName: DefinitionsByName = new Map(defaultValueDefinitions().map(def => [def.identifier, def]))
  definitionsByModule: DefinitionsByModule = new Map()
  conflicts: Conflict[] = []
  errors: NameError[] = []
  importErrors: Map<bigint, QuintError> = new Map()
  table: LookupTable = new Map()
  private definitionDepth: number = 0

  enterVar(def: QuintVar): void {
    this.collectValueDefinition(def.kind, def.name, def.id, undefined, def.typeAnnotation)
  }

  enterConst(def: QuintConst): void {
    this.collectValueDefinition(def.kind, def.name, def.id, undefined, def.typeAnnotation)
  }

  enterOpDef(def: QuintOpDef): void {
    if (this.definitionDepth > 0) {
      // scoped
      this.collectValueDefinition(def.kind, def.name, def.id, true, def.typeAnnotation)
    } else {
      // unscoped
      this.collectValueDefinition(def.kind, def.name, def.id)
    }

    this.definitionDepth++
  }

  exitOpDef(_def: QuintOpDef): void {
    this.definitionDepth--
  }

  exitLet(expr: QuintLet): void {
    this.definitionsByName.delete(expr.opdef.name)
  }

  enterTypeDef(def: QuintTypeDef): void {
    this.collectTypeDefinition(def.name, def.type, def.id)
  }

  enterAssume(def: QuintAssume): void {
    this.collectValueDefinition('assumption', def.name, def.id)
  }

  enterLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.collectValueDefinition('param', p.name, p.id, true)
    })
  }

  exitLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.definitionsByName.delete(p.name)
    })
  }

  private collectValueDefinition(
    kind: ValueDefinitionKind,
    identifier: string,
    reference?: bigint,
    // FIXME: I think I won't need this
    scoped?: boolean,
    typeAnnotation?: QuintType
  ): void {
    if (identifier === '_') {
      // Don't collect underscores, as they are special identifiers that allow no usage
      return
    }

    const def: ValueDefinition = {
      kind,
      identifier,
      reference,
      scoped: scoped ?? false,
      typeAnnotation,
    }

    if (this.definitionsByName.has(identifier)) {
      this.conflicts.push({
        kind: 'value',
        identifier,
        sources: [sourceFrom(reference), sourceFrom(this.definitionsByName.get(identifier)!.reference)],
      })

      return
    }

    this.definitionsByName.set(identifier, def)
  }

  private collectTypeDefinition(identifier: string, type?: QuintType, reference?: bigint): void {
    const def: TypeDefinition = {
      kind: 'type',
      identifier,
      type,
      reference,
    }

    if (this.definitionsByName.has(identifier)) {
      this.conflicts.push({
        kind: 'type',
        identifier,
        sources: [sourceFrom(reference), sourceFrom(this.definitionsByName.get(identifier)!.reference)],
      })

      return
    }

    this.definitionsByName.set(identifier, def)
  }

  private lastDefName: string = ''

  private currentModuleName: string = ''

  enterModule(module: QuintModule): void {
    this.currentModuleName = module.name
  }

  exitModule(module: QuintModule): void {
    this.definitionsByModule.set(module.name, this.definitionsByName)
    this.definitionsByName = new Map(defaultValueDefinitions().map(def => [def.identifier, def]))
  }

  enterDef(def: QuintDef): void {
    // Keep the last visited definition name
    // so it can be showen in the reported error
    if (def.kind !== 'instance' && def.kind !== 'import' && def.kind !== 'export') {
      this.lastDefName = def.name
    }
  }

  enterName(nameExpr: QuintName): void {
    // This is a name expression, the name must be defined
    // either globally or under a scope that contains the expression
    // The list of scopes containing the expression is accumulated in param scopes
    this.checkScopedName(nameExpr.name, nameExpr.id)
  }

  enterApp(appExpr: QuintApp): void {
    // Application, check that the operator being applied is defined
    this.checkScopedName(appExpr.opcode, appExpr.id)
  }

  enterConstType(type: QuintConstType): void {
    // Type is a name, check that it is defined
    const def = this.definitionsByName.get(type.name)
    if (!def || def.kind !== 'type') {
      this.recordError('type', type.name, type.id)
      return
    }

    if (def.reference) {
      this.table.set(type.id!, { kind: 'type', reference: def.reference, typeAnnotation: def.type })
    }
  }

  enterInstance(def: QuintInstance): void {
    // Copy defs from the module being instantiated
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.importErrors.set(def.id, {
        code: 'QNT407',
        message: `Cannot instantiate ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Instantiating a non-existing module
      this.importErrors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
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
        this.importErrors.set(def.id, {
          code: 'QNT406',
          message: `Instantiation error: ${name.name} not found in ${def.protoName}`,
          data: {},
        })
        return
      }

      if (constDef.kind !== 'const') {
        this.importErrors.set(def.id, {
          code: 'QNT406',
          message: `Instantiation error: ${name.name} is not a constant`,
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
      this.checkScopedName(qualifiedName, name.id)
    })
  }

  enterImport(def: QuintImport): void {
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.importErrors.set(def.id, {
        code: 'QNT407',
        message: `Cannot import ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Importing unexisting module
      this.importErrors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
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
        this.importErrors.set(def.id, {
          code: 'QNT405',
          message: `Name ${def.protoName}::${def.defName} not found`,
          data: {},
        })
        return
      }
      if (this.definitionsByName.has(def.defName)) {
        this.conflicts.push({
          kind: 'importing',
          identifier: def.defName,
          sources: [sourceFrom(def.id), sourceFrom(this.definitionsByName.get(def.defName)!.reference)],
        })

        return
      }

      this.definitionsByName.set(def.defName, newDef)
    }
  }

  // Imported names are copied with a scope since imports are not transitive by
  // default. Exporting needs to turn those names into unscoped ones so, when
  // the current module is imported, the names are accessible. Note that it is
  // also possible to export names that were not previously imported via `import`.
  enterExport(def: QuintExport) {
    if (def.protoName === this.currentModuleName) {
      // Exporting current module
      this.importErrors.set(def.id, {
        code: 'QNT407',
        message: `Cannot export ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Exporting unexisting module
      this.importErrors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
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

      if (!newDef || newDef.scoped) {
        this.importErrors.set(def.id, {
          code: 'QNT405',
          message: `Name ${def.protoName}::${def.defName} not found`,
          data: {},
        })
        return
      }

      if (this.definitionsByName.has(def.defName)) {
        this.conflicts.push({
          kind: 'exporting',
          identifier: def.defName,
          sources: [sourceFrom(def.id), sourceFrom(this.definitionsByName.get(def.defName)!.reference)],
        })

        return
      }

      this.definitionsByName.set(def.defName, newDef)
    }
  }

  // Check that there is a value definition for `name` under scope `id`
  private checkScopedName(name: string, id: bigint) {
    const def = this.definitionsByName.get(name)
    if (!def || def.kind === 'type') {
      this.recordError('value', name, id)
      return
    }

    if (def.reference) {
      this.table.set(id, { kind: def.kind, reference: def.reference, typeAnnotation: def.typeAnnotation })
    }
  }

  private recordError(kind: 'type' | 'value', name: string, id?: bigint) {
    this.errors.push({
      kind,
      name,
      definitionName: this.lastDefName,
      moduleName: this.currentModuleName,
      reference: id,
    })
  }

  /**
   * Merges two definitions tables together in a new one.
   *
   * @param t1 a definitions table to be merged
   * @param t2 a definitions table to be merged
   *
   * @returns the merged definitions table
   */
  private mergeTables(t1: DefinitionsByName, t2: DefinitionsByName): DefinitionsByName {
    t2.forEach((def, identifier) => {
      if (t1.has(identifier) && t1.get(identifier)!.reference !== def.reference) {
        this.conflicts.push({
          kind: 'merging',
          identifier,
          sources: [sourceFrom(t1.get(identifier)!.reference), sourceFrom(def.reference)],
        })
      }
    })

    return new Map([...t1.entries(), ...t2.entries()])
  }
}

function sourceFrom(reference?: bigint): ConflictSource {
  return reference ? { kind: 'user', reference } : { kind: 'builtin' }
}

/**
 * Copy the names of a definitions table to a new one, ignoring scoped and default
 * definitions, and optionally adding a namespace.
 *
 * @param originTable the definitions table to copy from
 * @param namespace optional namespace to be added to copied names
 * @param scope optional scope to be added to copied definitions
 *
 * @returns a definitions table with the filtered and namespaced names
 */
export function copyNames(originTable: DefinitionsByName, namespace?: string, scoped?: boolean): DefinitionsByName {
  const table = new Map()

  originTable.forEach((def, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier

    // Copy only unscoped and non-default (referenced) names
    if ((def.kind === 'const' || !def.scoped) && def.reference) {
      table.set(name, { ...def, identifier: name, scoped })
    }
  })

  return table
}
