// See:
// https://github.com/informalsystems/quint/issues/1133
module lastActionInRun {
    var s: str

    action A = 
        s' = "A"
    
    action B = 
        s' = "B"
    
    run t1 = A.then(A).then(B)

    run t2 = A.then(A).then(B).then(s'=s)
}
