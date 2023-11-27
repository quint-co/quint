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
        // note that there may be multiple "draw" transactions in flight
        val winningIds =
            mempool.filter(tx => tx.kind == "draw" and tx.sender == lotteryState.owner)
              .map(tx => tx.id)
        // if there are some winning ids, and the contract is in the drawing phase
        and {
            lotteryState.drawingPhase,
            winningIds != Set(),
        } implies
        // then nobody could buy anything in this state
        or {
            // it's fine if the transaction was rejected
            lastTx.status != "success",
            // or it was not a buying transaction
            lastTx.kind != "buy" and lastTx.kind != "multiBuy",
            // or the buyer did not guess the winning id anyhow
            winningIds.intersect(indices(lastTx.ids).map(i => lastTx.ids[i])) == Set()
        }
    }
```

It's not a simple invariant. No wonder that automatic tools are not tuned
towards exactly this pattern. Instead of specifying a run with the steps
leading to the bug, we can try to disprove this invariant in the random simulator:

```sh
quint run --max-samples 100000 --max-steps 5 \
  --invariant noBuyInDrawingInv --main lotteryMempool lottery.qnt
```

With a bit of luck, quint finds a violation in 29 seconds:

```bluespec
An example execution:
---------------------------------------------
action step0 = all {
  lotteryState' = { tickets: Map(), winningId: 0, drawingPhase: false, owner: "eve" },
  mempool' = Set(),
  lastTx' = { kind: "none", status: "none", sender: "", id: 0, amount: 0, ids: [], amounts: [] },
}

action step1 = all {
  lotteryState' = { tickets: Map(), winningId: 0, drawingPhase: false, owner: "eve" },
  mempool' = Set({ kind: "enterDrawingPhase", status: "pending", sender: "eve", id: 0, amount: 0, ids: [], amounts: [] }),
  lastTx' = { kind: "enterDrawingPhase", status: "pending", sender: "eve", id: 0, amount: 0, ids: [], amounts: [] },
}

action step2 = all {
  lotteryState' = { tickets: Map(), winningId: 0, drawingPhase: true, owner: "eve" },
  mempool' = Set(),
  lastTx' = { kind: "enterDrawingPhase", status: "success", sender: "eve", id: 0, amount: 0, ids: [], amounts: [] },
}

action step3 = all {
  lotteryState' = { tickets: Map(), winningId: 0, drawingPhase: true, owner: "eve" },
  mempool' = Set({ kind: "draw", status: "pending", sender: "eve", id: 3, amount: 0, ids: [], amounts: [] }),
  lastTx' = { kind: "draw", status: "pending", sender: "eve", id: 3, amount: 0, ids: [], amounts: [] },
}

action step4 = all {
  lotteryState' = { tickets: Map(), winningId: 0, drawingPhase: true, owner: "eve" },
  mempool' = Set({ kind: "draw", status: "pending", sender: "eve", id: 3, amount: 0, ids: [], amounts: [] }, { kind: "multiBuy", status: "pending", sender: "eve", id: 0, amount: 0, ids: [3, 5], amounts: [5, 9] }),
  lastTx' = { kind: "multiBuy", status: "pending", sender: "eve", id: 0, amount: 0, ids: [3, 5], amounts: [5, 9] },
}

action step5 = all {
  lotteryState' = { tickets: Map("eve" -> Map(3 -> 5, 5 -> 9)), winningId: 0, drawingPhase: true, owner: "eve" },
  mempool' = Set({ kind: "draw", status: "pending", sender: "eve", id: 3, amount: 0, ids: [], amounts: [] }),
  lastTx' = { kind: "multiBuy", status: "success", sender: "eve", id: 0, amount: 0, ids: [3, 5], amounts: [5, 9] },
}

run test = {
  step0.then(step1).then(step2).then(step3).then(step4).then(step5)
}
---------------------------------------------
[nok] Found a violation (28752ms).
```
