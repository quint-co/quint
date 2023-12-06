module two {
    type Boo = int
}


module twoPrime {
    import one.* from "./_1052one"
    import two.*

    var c: Boo
    var d: Foo
}
