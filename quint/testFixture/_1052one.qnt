module one {
    type Foo = int
}

module onePrime {
    import one.*
    import two.* from "./_1053two"

    var a: Boo
    var b: Foo
}
