# Specifying the lottery contract in Quint

In [lottery.qnt](./lottery.qnt), we specify the lottery contract
that is used as an illustration of atomicity violation in
the paper (Fig. 7):

    Zhuo Zhang, Brian Zhang, Wen Xu, Zhiqiang Lin, "Demystifying Exploitable Bugs in Smart Contracts." ICSE'23.

The paper and the accompanying material can be found at
[Web3bugs](https://github.com/ZhangZhuoSJTU/Web3Bugs).

This example belongs to a class of issues that are not detected
automatically by static analysis tools. But even if this behavior
cannot be automatically detected, can it be specified? The ability
to specify it is the first step towards automatic verification.

To be more exact, the problematic behavior is formally specified
and can be reproduced with the test:

```bluespec
    // This is the scenario reported in the paper.
    // By modeling the mempool, we can specify this scenario.
    run lotteryMultiBuyTest = {
        init.then(submit(EnterDrawingPhaseTx("owner")))
            .then(commit(EnterDrawingPhaseTx("owner")))
            .then(submit(DrawTx("owner", 3)))
            // Bob can buy lottery tickets in the drawing phase,
            // by front-running the draw transaction
            .then(submit(MultiBuyTx("bob", [3], [2000])))
            .then(commit(MultiBuyTx("bob", [3], [2000])))
            .then(commit(DrawTx("owner", 3)))
    }
```

We can also specify a state invariant that is broken by the above test:

```bluespec
    val noBuyInDrawingInv = {
        and {
            lastTx.status == "success",
            lastTx.kind == "buy" or lastTx.kind == "multiBuy"
        } implies not(lotteryState.drawingPhase)
    }
```

Instead of specifying a run with the steps leading to the bug, we can try to disprove this invariant in the random simulator:

```sh
quint run --max-samples 1000000 --max-steps 6 \
  --invariant noBuyInDrawingInv --main lotteryMempool lottery.qnt
```

Unfortunately, random simulation does not find this example.
This seems to be a good use case for symbolic model checking with
[Apalache](https://github.com/informalsystems/apalache/).