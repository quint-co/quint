------------------------ MODULE ERC20_typedefs --------------------------------
(*
  Type definitions for the module ERC20.

  An account address, in our case, simply an uninterpreted type ADDR.

  @typeAlias: transfer = { id: Int, fail: Bool, sender: ADDR, toAddr: ADDR, value: Int };
  @typeAlias: approve = { id: Int, fail: Bool, sender: ADDR, spender: ADDR, value: Int };
  @typeAlias: transferFrom = { id: Int, fail: Bool, sender: ADDR, fromAddr: ADDR, toAddr: ADDR, value: Int };

  A transaction is a discriminated union:
  @typeAlias: TX = None({ id: Int, fail: Bool }) | Transfer($transfer) | Approve($approve) | TransferFrom($transferFrom) ;

  A state of the state machine:
  @typeAlias: STATE = {
    balanceOf: ADDR -> Int,
    allowance: <<ADDR, ADDR>> -> Int, 
    pendingTransactions: Set(TX),
    lastTx: TX,
    nextTxId: Int
  };

  Below is a dummy definition to introduce the above type aliases.
 *) 
ERC20_typedefs == TRUE
===============================================================================
