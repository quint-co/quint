import { describe, it } from 'mocha'
import { expect } from 'chai'
import chalk from 'chalk'
import { Doc, braces, brackets, format, group, line, nest, parens, richtext, text } from '../src/prettierimp'

// define the standard line break to avoid repetition
const br = line('\n', ' ')

describe('prettierimp', () => {
  it('page 2 tests', () => {
    const doc = [
      text('[begin'), br,
      group([
        text('[stmt;'), br,
        text('stmt;'), br,
        text('stmt;]'),
      ]),
      br,
      text('end]'),
    ]

    const result1 = format(60, 0, doc)
    expect(result1).to.equal('[begin [stmt; stmt; stmt;] end]')

    const result2 = format(30, 0, doc)
    const expected2 =
`[begin
[stmt; stmt; stmt;]
end]`
    expect(result2).to.equal(expected2)

    const result3 = format(10, 0, doc)
    const expected3 =
`[begin
[stmt;
stmt;
stmt;]
end]`
    expect(result3).to.equal(expected3)
  })

  it('page 3 tests', () => {
    const doc = [
      text('[begin'),
      nest('   ',
        [
          br,
          group([
            text('[stmt;'),
            br,
            text('stmt;'),
            br,
            text('stmt;]'),
          ]),
        ]
      ),
      br,
      text('end]'),
    ]

    const result1 = format(50, 0, doc)
    expect(result1).to.equal('[begin [stmt; stmt; stmt;] end]')

    const result2 = format(30, 0, doc)
    const expected2 =
`[begin
   [stmt; stmt; stmt;]
end]`
     expect(result2).to.equal(expected2)

    const result3 = format(10, 0, doc)
    const expected3 =
`[begin
   [stmt;
   stmt;
   stmt;]
end]`
     expect(result3).to.equal(expected3)
  })

  it('page 6 tests', () => {
    const binop = (left: string, op: string, right: string) => {
      return group(nest('  ', [
        group([ text(left), br, text(op) ]),
        br,
        text(right)
      ]))
    }
    const cond = binop('a', '==', 'b')
    const expr1 = binop('a', '<<', '2')
    const expr2 = binop('a', '+', 'b')
    const ifthen = (c: Doc, e1: Doc, e2: Doc) => {
      return group([
        group(nest('  ', [ text('if'), br, c ])),
        br,
        group(nest('  ', [ text('then'), br, e1 ])),
        br,
        group(nest('  ', [ text('else'), br, e2 ])),
      ])
    }

    const doc = ifthen(cond, expr1, expr2)

    const result32 = format(32, 0, doc)
    expect(result32).to.equal('if a == b then a << 2 else a + b')

    const result15 = format(15, 0, doc)
    const expected15 =
`if a == b
then a << 2
else a + b`
     expect(result15).to.equal(expected15)

    const result10 = format(10, 0, doc)
    const expected10 =
`if a == b
then
  a << 2
else a + b`
     expect(result10).to.equal(expected10)

    const result8 = format(8, 0, doc)
    const expected8 =
`if
  a == b
then
  a << 2
else
  a + b`
     expect(result8).to.equal(expected8)

    const result7 = format(7, 0, doc)
    const expected7 =
`if
  a ==
    b
then
  a <<
    2
else
  a + b`
     expect(result7).to.equal(expected7)

    const result6 = format(6, 0, doc)
    const expected6 =
`if
  a ==
    b
then
  a <<
    2
else
  a +
    b`
     expect(result6).to.equal(expected6)
   })

  it('page 2 tests with colors', () => {
    // check that the color codes do not affect the string length
    // when computing the layout
    const y = chalk.yellow
    const b = chalk.bold
    const doc = [
      richtext(y, '[begin'), br,
      group([
        text('[stmt;'), br,
        richtext(b, 'stmt;'), br,
        text('stmt;]'),
      ]),
      br,
      richtext(y, 'end]'),
    ]

    const result1 = format(60, 0, doc)
    const expected1 =
      `${y('[begin')} [stmt; ${b('stmt;')} stmt;] ${y('end]')}`
    expect(result1).to.equal(expected1)

    const result2 = format(30, 0, doc)
    const expected2 =
`${y('[begin')}
[stmt; ${b('stmt;')} stmt;]
${y('end]')}`
    expect(result2).to.equal(expected2)

    const result3 = format(10, 0, doc)
    const expected3 =
`${y('[begin')}
[stmt;
${b('stmt;')}
stmt;]
${y('end]')}`
    expect(result3).to.equal(expected3)
  })

  it('parentheses, braces, brackets', () => {
    const doc = [
      parens(braces(brackets([line(), text('abc'), line()]))),
    ]

    const result60 = format(60, 0, doc)
    expect(result60).to.equal('({[ abc ]})')

    const result3 = format(3, 0, doc)
    expect(result3).to.equal('({[\nabc\n]})')
  })
})
