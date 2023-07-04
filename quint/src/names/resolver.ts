import { Either, left, right } from '@sweet-monads/either'
import { IRVisitor, walkModule } from '../IRVisitor'
import { QuintApp, QuintInstance, QuintLambda, QuintLet, QuintModule, QuintName, QuintOpDef } from '../quintIr'
import { QuintConstType } from '../quintTypes'
import { LookupTable, builtinNames } from './base'
import { QuintError } from '../quintError'
import { NameCollector } from './collector'

export function resolveNames(quintModules: QuintModule[]): Either<QuintError[], LookupTable> {
  const visitor = new NameResolver()
  quintModules.forEach(module => {
    walkModule(visitor, module)
  })
  return visitor.errors.length > 0 ? left(visitor.errors) : right(visitor.table)
}

export class NameResolver implements IRVisitor {
  collector: NameCollector
  errors: QuintError[] = []
  table: LookupTable = new Map()
  private definitionDepth: number = 0

  constructor() {
    this.collector = new NameCollector()
    // bind the errors so they are aggregated in the same array
    this.collector.errors = this.errors
  }

  enterModule(module: QuintModule): void {
    walkModule(this.collector, module)
  }

  enterOpDef(def: QuintOpDef): void {
    if (this.definitionDepth > 0) {
      this.collector.collectDefinition(def.name, {
        kind: def.kind,
        reference: def.id,
        typeAnnotation: def.typeAnnotation,
      })
    }

    this.definitionDepth++
  }

  exitOpDef(_def: QuintOpDef): void {
    this.definitionDepth--
  }

  exitLet(expr: QuintLet): void {
    this.collector.deleteDefinition(expr.opdef.name)
  }

  enterLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.collector.collectDefinition(p.name, { kind: 'param', reference: p.id })
    })
  }

  exitLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.collector.deleteDefinition(p.name)
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
    const def = this.collector.getDefinition(type.name)
    if (!def || def.kind !== 'type') {
      this.recordNameError(type.name, type.id!)
      return
    }

    this.table.set(type.id!, def)
  }

  enterInstance(def: QuintInstance): void {
    // Resolve param names in the current module
    def.overrides.forEach(([param, _]) => {
      const qualifiedName = def.qualifiedName ? `${def.qualifiedName}::${param.name}` : param.name
      this.resolveName(qualifiedName, param.id)
    })
  }

  private resolveName(name: string, id: bigint) {
    if (builtinNames.includes(name)) {
      return
    }

    const def = this.collector.getDefinition(name)
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
}
