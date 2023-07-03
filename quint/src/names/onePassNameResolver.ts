import { Either, left, right } from '@sweet-monads/either'
import { IRVisitor, walkModule } from '../IRVisitor'
import {
  QuintApp,
  QuintAssume,
  QuintConst,
  QuintDef,
  QuintInstance,
  QuintLambda,
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
  scope?: bigint
}
type DefinitionsByName = Map<string, ValueDefinition | TypeDefinition>

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
  kind: 'value' | 'type'
  /* The name that has a conflict */
  identifier: string
  /* Sources of the occurrences of the conflicting name */
  sources: ConflictSource[]
}

/**
 * The result of name resolution for a Quint Module.
 */
export type NameResolutionResult = Either<[Conflict[], NameError[]], LookupTable>

export function resolveNames(quintModule: QuintModule): NameResolutionResult {
  const visitor = new NameResolver()
  walkModule(visitor, quintModule)
  const errors: [Conflict[], NameError[]] = [visitor.conflicts, visitor.errors]
  return errors.length > 0 ? left(errors) : right(visitor.table)
}

export class NameResolver implements IRVisitor {
  definitionsByName: DefinitionsByName = new Map(defaultValueDefinitions().map(def => [def.identifier, def]))
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
    this.definitionDepth++
    if (this.definitionDepth > 0) {
      this.collectValueDefinition(def.kind, def.name, def.id, true, def.typeAnnotation)
    } else {
      this.collectValueDefinition(def.kind, def.name, def.id)
    }
  }

  exitOpDef(def: QuintOpDef): void {
    this.definitionDepth--

    if (this.definitionDepth !== 0) {
      this.definitionsByName.delete(def.name)
    }
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
    def.overrides.forEach(([name, _]) => {
      const qualifiedName = def.qualifiedName ? `${def.qualifiedName}::${name.name}` : name.name
      this.checkScopedName(qualifiedName, name.id)
    })
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
}

function sourceFrom(reference?: bigint): ConflictSource {
  return reference ? { kind: 'user', reference } : { kind: 'builtin' }
}
