import { LookupTable } from '../names/base'
import { IRTransformer, transformModule } from './IRTransformer'
import { IRVisitor, walkDefinition, walkModule } from './IRVisitor'
import { QuintApp, QuintDef, QuintModule, QuintName } from './quintIr'

export function convertInit(module: QuintModule, lookupTable: LookupTable): QuintModule {
  const defsFinder = new InitDefsFinder(lookupTable)
  walkModule(defsFinder, module)
  return transformModule(new InitConverter(defsFinder.insideInitDefs), module)
}

class InitDefsFinder implements IRVisitor {
  insideInitDefs = ['q::init']
  private insideInit = 0
  private lookupTable: LookupTable

  constructor(lookupTable: LookupTable) {
    this.lookupTable = lookupTable
  }

  enterDef(def: QuintDef) {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit++
    }
  }

  exitDef(def: QuintDef) {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit--
    }
  }

  enterName(expr: QuintName) {
    if (this.insideInit > 0) {
      this.insideInitDefs.push(expr.name)

      const def = this.lookupTable.get(expr.id)
      if (def) walkDefinition(this, def as QuintDef)
    }
  }

  enterApp(app: QuintApp) {
    if (this.insideInit > 0) {
      this.insideInitDefs.push(app.opcode)

      const def = this.lookupTable.get(app.id)
      if (def) walkDefinition(this, def as QuintDef)
    }
  }
}

class InitConverter implements IRTransformer {
  private insideInit = 0
  private insideInitDefs: String[]

  constructor(insideInitDefs: String[]) {
    this.insideInitDefs = insideInitDefs
  }

  enterDef(def: QuintDef): QuintDef {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit++
    }

    return def
  }

  exitDef(def: QuintDef): QuintDef {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit--
    }

    return def
  }

  enterApp(app: QuintApp): QuintApp {
    if (this.insideInit && app.opcode == 'assign') {
      console.log('updating', app)
      return { ...app, opcode: 'eq' }
    }

    return app
  }
}
