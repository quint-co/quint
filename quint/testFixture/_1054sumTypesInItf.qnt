// Regression test for https://github.com/informalsystems/quint/issues/1281
// ITF export did not have support for sum types
module sum {
    type T = None | Some(int)
    var x: T
    action init = x' = None
    action step = x' = match x { None => Some(1) | Some(n) => Some(n+1) }
    run xTest = init.then(step).then(step).then(step)
}
