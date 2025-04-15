// -*- mode: Bluespec; -*-

module utxo {
  import basicSpells.* from "./basicSpells"

  type Key = {
    txid: int,
    vout: int
  }

  type Value = {
    height: int,
    coinbase: int,
    amount: int,
    lockingCode: str,
  }

  type UTXOs = Key -> Value
  type Signatures = Key -> str

  type Transaction = {
    input: UTXOs,
    s: Signatures, // every key in the input must be signed by the sender. I guess potentially the user could combine utxos with different keys
    receiver: str,
    remainder_address: str,
    amount: int,
  }

  //
  // wallet logic
  //

  /// what utxos are controlled by the key
  pure def user_utxo_set (key: str, cs: UTXOs): UTXOs = 
    cs.keys().filter(k => cs.get(k).lockingCode == key).mapBy(k => cs.get(k))

  /// how many coins are controlled by the key
  pure def user_balance (key: str, cs: UTXOs): int = 
    user_utxo_set(key, cs).keys().fold(0, (acc, k) => acc + cs.get(k).amount)

  /// return a minimal utxo set whose sum is greater than or equal to amount 
  /// (minimal meaning that taking one utxo out more would drop under amount)
  /// assumes that the user balance is greater than or equal to amount
  pure def compute_input (key: str, cs: UTXOs, amount: int): UTXOs =
    val mySet = user_utxo_set(key, cs) // here one might eventually filter out the utxos that cannot be spent
    mySet.keys().fold(mySet, (acc, k) =>
      val excludeAcc = mapRemove(acc, k)
      if (user_balance(key, excludeAcc) >= amount) 
        excludeAcc
      else
        acc
    )

  //
  // on-chain functions
  //

  /// compute output utxos of a transaction
  pure def compute_output (input: UTXOs, sender: str, receiver: str, amount: int, height: int, id: int): UTXOs =
    val input_sum = user_balance(sender, input) 
    if (input.values().exists(v => v.lockingCode != sender) or
        input_sum < amount) 
      Map()
    else
      val rcv_utxo = Map( { txid: id, vout: 0 } -> 
                          { height: height, coinbase: -1, amount: amount, lockingCode: receiver })
      if (input_sum - amount == 0) 
        rcv_utxo
      else
        // we add the remainder utxo of the sender if it is not empty
        rcv_utxo.put( { txid: id, vout: 1 }, 
                      { height: height, coinbase: -1, amount: input_sum - amount, lockingCode: sender })
  
  /// we verify the signatures for each utxo in the input
  /// TODO: actual check is not implemented
  pure def verify_signatures (tx: Transaction) : bool =
    if (tx.input.keys() != tx.s.keys())
      false
    else
      tx.input.keys().forall(k => tx.s.get(k) == tx.input.get(k).lockingCode) // here we could model private/public key verification

  /// check that utxos exist on chain (are not spent)
  pure def input_contained_in_chain (tx: Transaction, chain_state: UTXOs): bool =
    if (tx.input.keys().forall(k => chain_state.keys().contains(k)) )
      tx.input.keys().forall(k => tx.input.get(k) == chain_state.get(k)) 
    else
      false

  /// on-chain execution logic
  pure def execute_tx (chain_state: UTXOs, tx: Transaction, height: int, id: int): UTXOs =
    if (not(tx.verify_signatures()) or not(tx.input_contained_in_chain(chain_state)))
      // transaction not valid. Do nothing.
      chain_state
    else
      val output = compute_output(tx.input, tx.remainder_address, tx.receiver, tx.amount, height, id)
      if (output == Map())
        chain_state
      else
        val state_without_input = chain_state.keys().exclude(tx.input.keys()).mapBy(k => chain_state.get(k)) // we remove the input utxos
        output.keys().fold(state_without_input, (acc, k) => acc.put(k, output.get(k))) // we add the output utxos to the state


  //
  // state machine
  //

  val pubKeys = Set("Alice", "Bob", "Charlie")
 
  type Transaction_Record = {
    sender: str,
    receiver: str,
    amount: int,
    height: int,
    success: bool,
  }

  var state: UTXOs
  var height: int
  var txCounter: int
  var history: List[Transaction_Record]
  var chain: List[UTXOs]

  pure def token_supply(s: UTXOs): int = 
    s.keys().fold(0, (acc, k) => acc + s.get(k).amount)
  val constant_supply = state.token_supply() == 100

  /// this is a bad implementation of the token supply function
  /// it does not take into account that a user can have multiple utxos
  /// with the same value (but different keys)
  /// simulation finds a counter example
  pure def token_supply_bad(s: UTXOs): int = 
    s.values().fold(0, (acc, v) => acc + v.amount)
  val constant_supply_bad = state.token_supply_bad() == 100


  action init = 
    val genesis = Map({ txid: 0, vout: 0 } -> { height: 0, coinbase: 0, amount: 100, lockingCode: "Alice" })
    all {
      state' = genesis,
      height' = 0,
      txCounter' = 0,
      history' = List(),
      chain' = List(genesis),
    }

  /// token transfer between two users
  /// the sender must have enough balance to perform the transaction
  action transfer (sender, receiver, amount) = 
    // this would happen off-chain in a wallet. The wallet computes the input utxos for the user
    val input = compute_input(sender, state, amount)
    // here the user signs the transaction with its private key
    val tx = {
      input: input,
      s: input.keys().mapBy(k => state.get(k).lockingCode), // no real signing here. We just use the locking code as the signature
      receiver: receiver,
      remainder_address: sender, // here the user might put a different address
      amount: amount,
    }
    // the transaction is executed on-chain. The state is updated
    val new_state = execute_tx(state, tx, height, txCounter + 1)
    all {
      height' = height,
      txCounter' = txCounter + 1,
      state' = new_state,
      history' = history.append({
        sender: sender,
        receiver: receiver, 
        amount: amount, 
        height: height,
        success: state != new_state
      }),
      chain' = chain.append(new_state),
    }

  /// mining a coin to a user and incrementing the height
  action coinbase_tx(receiver) = 
    val new_state = state.put({ txid: txCounter + 1, vout: 0 },
                              { height: height + 1, coinbase: height + 1, amount: 1, lockingCode: receiver }
    )
    all {
      height' = height + 1,
      txCounter' = txCounter + 1,
      state' = new_state,
      history' = history.append({
        sender: "coinbase",
        receiver: receiver, 
        amount: 1, 
        height: height + 1,
        success: true
      }),
      chain' = chain.append(new_state),
    }

  action step = 
    nondet sender = pubKeys.oneOf()
    nondet receiver = pubKeys.exclude(Set(sender)).oneOf()
    nondet amount = 1.to(100).oneOf()
    any{
      transfer(sender, receiver, amount),
      // coinbase_tx(receiver)
    }
}
