import { describe, it } from 'mocha'
import { assert } from 'chai'
import { fixAngleActions, postprocessTlaplus } from '../src/tlaplusPostprocessing'

describe('fixAngleActions', () => {
  it('fixes angle actions over operator names', () => {
    assert.equal(fixAngleActions('a == []<>(<Inc>_x)'), 'a == []<>(<<Inc>>_x)')
    assert.equal(fixAngleActions('e == [Inc]_x /\\ <Inc>_x'), 'e == [Inc]_x /\\ <<Inc>>_x')
  })

  it('fixes angle actions over operator applications and parenthesized expressions', () => {
    assert.equal(fixAngleActions('a == <A(i, (j))>_vars'), 'a == <<A(i, (j))>>_vars')
    assert.equal(
      fixAngleActions("b == []<>(<(x' > x /\\ x < 2)>_<<x, y>>)"),
      "b == []<>(<<(x' > x /\\ x < 2)>>_<<x, y>>)"
    )
  })

  it('fixes angle actions spanning multiple lines', () => {
    const tla = `d ==
  []<>(<(\\A i \\in { 1, 2 }:
    (x' > x + i \\/ y' < y - i) \\/ x' + y' >= i)>_<<x, y>>)`
    const expected = `d ==
  []<>(<<(\\A i \\in { 1, 2 }:
    (x' > x + i \\/ y' < y - i) \\/ x' + y' >= i)>>_<<x, y>>)`
    assert.equal(fixAngleActions(tla), expected)
  })

  it('fixes several angle actions', () => {
    assert.equal(fixAngleActions('a == <A>_x /\\ <(B)>_y'), 'a == <<A>>_x /\\ <<(B)>>_y')
  })

  it('does not change correct angle actions', () => {
    const tla = "a == []<>(<<Inc>>_x) /\\ <<(x' > x)>>_<<x, y>>"
    assert.equal(fixAngleActions(tla), tla)
  })

  it('does not change comments and strings', () => {
    const tla = '(* <A>_x *)\n\\* <A>_x\ns == "<A>_x"\n'
    assert.equal(fixAngleActions(tla), tla)
  })

  it('does not change other operators', () => {
    const tla = "a == x > _y /\\ [A]_x /\\ WF_x(A) /\\ x' >= x /\\ <<1, 2>>"
    assert.equal(fixAngleActions(tla), tla)
  })
})

describe('postprocessTlaplus', () => {
  it('applies the fixes', () => {
    assert.equal(postprocessTlaplus('a == []<>(<Inc>_x)'), 'a == []<>(<<Inc>>_x)')
  })
})
