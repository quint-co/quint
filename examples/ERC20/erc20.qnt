module erc20 {
  type ADDR = str

  type TX =
    | { tag: "none", id: int, failed: bool }
    | { tag: "transfer", id: int, failed: bool, sender: ADDR, toAddr: ADDR, value: int }
    | { tag: "approve", id: int, failed: bool, sender: ADDR, spender: ADDR, value: int }
    | { tag: "transferFrom", id: int, failed: bool, sender: ADDR, fromAddr: ADDR, toAddr: ADDR, value: int }

  const ADDR: Set[ADDR]
  const AMMOUNTS: Set[int]

  var balanceOf: ADDR -> int
  var allowance: (ADDR, ADDR) -> int

  var pendingTransactions: Set[TX]
  var lastTx: TX
  var nextTxId: int

  action Init = all {
    balanceOf' = ADDR.mapBy(_ => 100),
    allowance' = tuples(ADDR, ADDR).mapBy(_ => 0),
    pendingTransactions' = Set(),
    nextTxId' = 0,
    lastTx' = { id: 0, tag: "none", failed: false }
  }

  /* EIP-20:
  The following action submits a transaction to the blockchain.

  Transfers value amount of tokens to address toAddr, and MUST fire the Transfer
  event. The function SHOULD throw if the message caller’s account balance does
  not have enough tokens to spend.

  Note Transfers of 0 values MUST be treated as normal transfers and fire the
  Transfer event.
  */
  action SubmitTransfer(sender, toAddr, value) = {
    val newTx = { id: nextTxId, tag: "transfer", failed: false,
                  sender: sender, toAddr: toAddr, value: value }
    all {
      pendingTransactions' = pendingTransactions.union(Set(newTx)),
      lastTx' = { id: 0, tag: "none", failed: false },
      nextTxId' = nextTxId + 1,
      balanceOf' = balanceOf,
      allowance' = allowance,
    }
  }

  /* Process a Transfer transaction that was submitted with SubmitTransfer. */
  action CommitTransfer(tx) = all {
    tx.tag == "transfer",
    pendingTransactions' = pendingTransactions.exclude(Set(tx)),
    allowance' = allowance,
    nextTxId' = nextTxId,
    val failed = or {
     tx.value < 0,
     tx.value > balanceOf.get(tx.sender),
     tx.sender == tx.toAddr
    }
    all {
      lastTx' = tx.with("failed", failed),
      if (failed)
        balanceOf' = balanceOf
      else
        balanceOf' = balanceOf
                       .setBy(tx.sender, v => v - tx.value)
                       .setBy(tx.toAddr, v => v + tx.value)
    },
  }

  /* EIP-20:
  Transfers value amount of tokens from address fromAddr to address toAddr, and
  MUST fire the Transfer event.

  The transferFrom method is used for a withdraw workflow, allowing contracts to
  transfer tokens on your behalf. This can be used for example to allow a
  contract to transfer tokens on your behalf and/or to charge fees in
  sub-currencies. The function SHOULD throw unless the fromAddr account has
  deliberately authorized the sender of the message via some mechanism.

  Note Transfers of 0 values MUST be treated as normal transfers and fire the
  Transfer event.
  */
  action SubmitTransferFrom(sender, fromAddr, toAddr, value) = {
    val newTx = { id: nextTxId, tag: "transferFrom", failed: false, sender: sender,
                  fromAddr: fromAddr, toAddr: toAddr, value: value }
    all {
      pendingTransactions' = pendingTransactions.union(Set(newTx)),
      lastTx' = { id: 0, tag: "none", failed: false },
      nextTxId' = nextTxId + 1,
      balanceOf' = balanceOf,
      allowance' = allowance,
    }
  }

  /* Process a TransferFrom transaction that was submitted with SubmitTransferFrom. */
  action CommitTransferFrom(tx) = all {
    tx.tag == "transferFrom",
    pendingTransactions' = pendingTransactions.exclude(Set(tx)),
    nextTxId' = nextTxId,
    val failed = or {
     tx.value < 0,
     tx.value > balanceOf.get(tx.fromAddr),
     tx.value > allowance.get((tx.fromAddr, tx.sender)),
     tx.fromAddr == tx.toAddr
    }
    all {
      lastTx' = tx.with("failed", failed),
      if (failed)
        all {
          balanceOf' = balanceOf,
          allowance' = allowance,
        }
      else
        all {
          balanceOf' = balanceOf
                         .setBy(tx.fromAddr, v => v - tx.value)
                         .setBy(tx.toAddr, v => v + tx.value),
          allowance' = allowance.setBy((tx.fromAddr, tx.sender), v => v - tx.value),
        },
    },
  }

  /* EIP-20:
  Allows spender to withdraw from your account multiple times, up to the _value
  amount. If this function is called again it overwrites the current allowance
  with _value.
  */
  action SubmitApprove(sender, spender, value) = {
    val newTx = { id: nextTxId, tag: "approve", failed: false,
                  sender: sender, spender: spender, value: value }
    all {
      pendingTransactions' = pendingTransactions.union(Set(newTx)),
      lastTx' = { id: 0, tag: "none", failed: false },
      nextTxId' = nextTxId + 1,
      balanceOf' = balanceOf,
      allowance' = allowance,
    }
  }

  /* Process an Approve transaction that was submitted with SubmitApprove. */
  action CommitApprove(tx) = all {
    tx.tag == "approve",
    pendingTransactions' = pendingTransactions.exclude(Set(tx)),
    nextTxId' = nextTxId,
    balanceOf' = balanceOf,
    val failed = or {
     tx.value < 0,
     tx.sender > tx.spender,
    }
    all {
      lastTx' = tx.with("failed", failed),
      if (failed)
        allowance' = allowance
      else
        allowance' = allowance.set((tx.sender, tx.spender), tx.value)
    },
  }

  /* The transition relation, which chooses one of the actions */
  action Next = any {
    {
      nondet sender = oneOf(ADDR)
      nondet toAddr = oneOf(ADDR)
      nondet value = oneOf(AMMOUNTS)
      SubmitTransfer(sender, toAddr, value)
    },
    {
      nondet sender = oneOf(ADDR)
      nondet fromAddr = oneOf(ADDR)
      nondet toAddr = oneOf(ADDR)
      nondet value = oneOf(AMMOUNTS)
      SubmitTransferFrom(sender, fromAddr, toAddr, value)
    },
    {
      nondet sender = oneOf(ADDR)
      nondet spender = oneOf(ADDR)
      nondet value = oneOf(AMMOUNTS)
      SubmitApprove(sender, spender, value)
    },
    {
      nondet tx = oneOf(pendingTransactions)
      any {
        CommitTransfer(tx),
        CommitTransferFrom(tx),
        CommitApprove(tx),
      }
    },
  }

  /* False invariants to debug the spec */

  /* Claim that no `TransferFrom` transaction is ever processed.
    This is false. Use this false invariant to see an example of how
    `TransferFrom` is processed. */

  val NoTransferFrom =
    val example = all {
      lastTx.tag == "transferFrom",
      not(lastTx.failed),
      lastTx.value > 0,
    }

    not(example)


  /* Claim that no `Approve` transaction is ever processed.
    This is false. Use this false invariant to see an example of how
    `Approve` is processed. */

  val NoApprove =
    val example = all {
      lastTx.tag == "approve",
      not(lastTx.failed),
      lastTx.value > 0,
    }

    not(example)

  /* EXPECTED PROPERTIES */

  /* No transferFrom should be possible, while there is a pending approval
    for a smaller amount. This invariant is violated, as explained in:
    https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit# */

  val NoTransferFromWhileApproveInFlight =
    val badExample = all {
      lastTx.tag == "transferFrom",
      lastTx.value > 0,
      not(lastTx.failed),
      nondet tx = oneOf(pendingTransactions)
      all {
        tx.tag == "approve",
        tx.sender == lastTx.fromAddr,
        tx.spender == lastTx.sender,
        tx.value < lastTx.value,
        tx.value > 0,
      }
    }
    not(badExample)

  /* Make sure that the account balances never go negative. */
  val NoNegativeBalances = ADDR.forall(a => balanceOf.get(a) >= 0)
}
