module records {
    var rec1: { f1: int, f2: str | r1 }
    var rec2: { f2: str, f3: bool | r2 }
    var rec3: { f1: int }

    val rec1FieldNames = rec1.fieldNames()

    // Should give a type error:
    // val fieldNamesTest = 1.fieldNames()

    // Should give a type error:
    // val setOfRecords = Set(rec1, rec2)

    def updateF1(r) = r.with("f1", 1) 

    action init = all {
        rec1' = { f1: 1, f2: "hello" },
        rec2' = { f2: "world", f3: true },
        rec3' = { f1: 2 },
    }

    action step = all {
        rec1' = updateF1(rec1),
        rec2' = rec2.with("f3", true),
        rec3' = updateF1(rec3),
    }

    def d(p) = rec1.with("f1", p.f1)
    val t = d({ f1: 2 }).fieldNames()
}
