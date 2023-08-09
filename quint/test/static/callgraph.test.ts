import { assert, expect } from 'chai'
import { describe } from 'mocha'

import { dedent } from '../textUtils'
import { newIdGenerator } from '../../src/idGenerator'
import {
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
} from '../../src/parsing/quintParserFrontend'
import { SourceLookupPath, fileSourceResolver } from '../../src/parsing/sourceResolver'
import { LookupTable, QuintDef, QuintExport, QuintImport, QuintInstance, QuintModule } from '../../src'
import { CallGraphVisitor, mkCallGraphContext } from '../../src/static/callgraph'
import { walkModule } from '../../src/ir/IRVisitor'

describe('compute call graph', () => {
  // Parse Quint code without, stopping after name resolution
  function parse3phases(code: string): [QuintModule[], LookupTable] {
    const idGen = newIdGenerator()
    const fakePath: SourceLookupPath = {
      normalizedPath: 'fake_path',
      toSourceName: () => 'fake_path',
    }

    // we are calling parse phases directly instead of `parse`,
    // as the call graph will be computed at parse phase 4
    const resolver = fileSourceResolver()
    const parseResult = parsePhase1fromText(idGen, code, fakePath.normalizedPath)
      .chain(phase1Data => parsePhase2sourceResolution(idGen, resolver, fakePath, phase1Data))
      .chain(phase2Data => parsePhase3importAndNameResolution(phase2Data))

    if (parseResult.isLeft()) {
      const msgs = parseResult.value.map(e => e.explanation).join('; ')
      assert.fail(`Failed to parse a mock module: ${msgs}`)
    }
    const { modules, table } = parseResult.unwrap()
    return [modules, table]
  }

  function findDef(module: QuintModule, name: string): QuintDef {
    const d = module.defs.find(
      d => (d.kind === 'def' || d.kind === 'const' || d.kind === 'var' || d.kind === 'typedef') && d.name === name
    )
    assert(d, `Definition ${name} not found`)
    return d
  }

  function findImport(module: QuintModule, pred: (imp: QuintImport) => boolean): QuintDef {
    const d = module.defs.find(d => d.kind === 'import' && pred(d))
    assert(d, `Import not found in ${module.name}`)
    return d
  }

  function findInstance(module: QuintModule, pred: (imp: QuintInstance) => boolean): QuintDef {
    const d = module.defs.find(d => d.kind === 'instance' && pred(d))
    assert(d, `Instance not found in ${module.name}`)
    return d
  }

  function findExport(module: QuintModule, pred: (imp: QuintExport) => boolean): QuintDef {
    const d = module.defs.find(d => d.kind === 'export' && pred(d))
    assert(d, `Export not found in ${module.name}`)
    return d
  }

  it('computes a call graph of const, var, and operator definitions', () => {
    const code = dedent(
      `module main {
      |  const N: int
      |  var w: int
      |  pure def plus(x, y) = x + y
      |  pure def double(x) = plus(x, x)
      |  pure def triple(x) = plus(x, double(x, x))
      |  val getW = w + N
      |}`
    )

    const [modules, table] = parse3phases(code)
    const main = modules.find(m => m.name === 'main')!
    const visitor = new CallGraphVisitor(table, mkCallGraphContext(modules))
    walkModule(visitor, main)
    const graph = visitor.graph
    const plus = findDef(main, 'plus')
    const double = findDef(main, 'double')
    const triple = findDef(main, 'triple')
    const w = findDef(main, 'w')
    const N = findDef(main, 'N')
    const getW = findDef(main, 'getW')
    expect(graph.get(plus.id)?.size).to.equal(2)
    expect(graph.get(double.id)?.toArray()).to.include.members([plus.id])
    expect(graph.get(triple.id)?.toArray()).to.include.members([plus.id, double.id])
    expect(graph.get(getW.id)?.toArray()).to.include.members([w.id, N.id])
  })

  it('computes a "uses" graph of typedefs', () => {
    const code = dedent(
      `module main {
      |  type BagOfApples = Set[int]
      |  type BoxOfApples = Set[BagOfApples]
      |  var x: BoxOfApples
      |}`
    )

    const [modules, table] = parse3phases(code)
    const main = modules.find(m => m.name === 'main')!
    const visitor = new CallGraphVisitor(table, mkCallGraphContext(modules))
    walkModule(visitor, main)
    const graph = visitor.graph
    const bagOfApples = findDef(main, 'BagOfApples')
    const boxOfApples = findDef(main, 'BoxOfApples')
    const x = findDef(main, 'x')
    expect(graph.get(bagOfApples.id)).to.be.undefined
    expect(graph.get(boxOfApples.id)?.toArray()).to.eql([bagOfApples.id])
    expect(graph.get(x.id)?.toArray()).to.eql([boxOfApples.id])
  })

  it('computes a "uses" graph of imports and defs', () => {
    // the following definitions should always come in this order:
    const code = dedent(
      `module A {
      |  pure def sqr(x) = x * x
      |}
      |module B {
      |  const M: int
      |  pure val doubleM = M + M
      |}
      |module main {
      |  import A.*
      |  pure val myM = sqr(3)
      |  import B(M = myM) as B1
      |  pure val quadM = 2 * B1::doubleM
      |  export B1.*
      |}`
    )

    const [modules, table] = parse3phases(code)

    const [A, B, main] = modules
    const visitor = new CallGraphVisitor(table, mkCallGraphContext(modules))
    walkModule(visitor, main)
    const graph = visitor.graph
    // uncomment to debug the graph structure
    //visitor.print(console.log)

    const sqr = findDef(A, 'sqr')
    const importA = findImport(main, imp => imp.protoName === 'A')
    const myM = findDef(main, 'myM')
    const importB = findInstance(main, imp => imp.protoName === 'B')
    const quadM = findDef(main, 'quadM')
    const doubleM = findDef(B, 'doubleM')
    const exportB1 = findExport(main, exp => exp.protoName === 'B1')

    expect(graph.get(importA.id)?.toArray()).eql([A.id])
    expect(graph.get(myM.id)?.toArray()).to.eql([sqr.id, importA.id])
    expect(graph.get(importB.id)?.toArray()).to.eql([B.id, myM.id])
    expect(graph.get(quadM.id)?.toArray()).to.eql([doubleM.id, importB.id])
    expect(graph.get(exportB1.id)?.toArray()).to.eql([importB.id])
  })
})
