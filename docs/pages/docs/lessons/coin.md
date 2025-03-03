# Lesson 3 - Basic anatomy of a protocol in Quint
## 1. Introduction

*Progress:*  0%

In this tutorial, we explain the standard structure of a Quint protocol.
Although Quint does not impose a very rigid structure on protocol designers,
we have found that following common practices helps protocol authors and
their readers to cooperate more effectively.

As a running example, we are using the subcurrency smart contract that
is introduced in the Solidity documentation, see
[Subcurrency](https://docs.soliditylang.org/en/v0.8.17/introduction-to-smart-contracts.html#subcurrency-example).
You do not have to know Solidity to understand this tutorial.
On the contrary, you may acquire some basic understanding of Solidity contracts
by reading the Quint protocol specification.

The subcurrency smart contract defines a basic protocol that has the following features:

 - A single user (the protocol creator) is assigned the "minter" role.

 - The minter may generate new coins on the balances of the users, including themselves.

 - The users may send coins to other users, provided that they have enough coins
   on their balance.

In this tutorial, you will see how to:

 - Specify basic type aliases.

 - Define handy functions that can be used independently of the protocol.

 - Define the structure of the protocol states.

 - Define helper functions that read the current state, but do not modify it.

 - Define actions that read and modify the current state of the protocol.

 - Define basic protocol invariants.

 - Write basic protocol tests.

 - Write protocol tests that use input non-determinism.

 - Run a basic randomized test to discover an invariant violation.

        
        

If you would like to see the complete code before diving into
the details, check [coin.qnt](https://github.com/informalsystems/quint/tree/main/examples/tutorials/coin.qnt).
        
## 2. Declare a single module

*Progress:*  4%

**Code snippet:**

```quint
module coin {
```


Quint specifications are organized in modules, and may consist of one or many
top-level module declarations.
Nested module declarations are currently not supported.

In this tutorial, we declare a single module. In general, we recommend to start
with a single module and introduce multiple modules only if you are going to
reuse various parts of your protocol.
        
## 3. Declare types

*Progress:*  8%

**Code snippet:**

```quint

    // TYPE DEFINITIONS

    // encode addresses as string literals
    type Addr = str

    // We declare a Solidity uint (256 bit) as an alias of Quint int.
    // Note that these UInt values are still integers, which can get
    // arbitrarily large. Hence, we have to take care of overflows.
    // In the future, Quint will have a standard library for that.
    type UInt = int
```


Similar to programming languages, it is common in Quint to declare type
aliases for the types that appear in the protocol description often.
A type alias is simply a declaration of the form:

```scala
type [name] = [tp];
```

In the above definition, `[name]` is a unique identifier that will be associated
with the type, and `[tp]` is the type to be associated with the name, e.g.,
`int` or `Set[int]`. To see a complete description of all available types, visit the Section
[Type System 1.2](https://github.com/informalsystems/quint/blob/main/doc/lang.md#type-system-12)
of the language manual.

Although it is convenient to declare type aliases, it is not mandatory.
Protocol authors should decide together with their audience, whether they prefer
minimal type definitions, or they like abundance of types. Quint replaces type aliases
with the types on the right-hand sides of `type`. For example, it does not distinguish between
different kinds of "integers", when they are referred to via different type aliases.
        
## 4. Declare pure functions

*Progress:*  13%

**Code snippet:**

```quint

    // FUNCTIONAL LAYER:
    // Values and functions that are state-independent

    // the maximal value a Solidity UInt can carry
    pure val MAX_UINT = 2^256 - 1

    // does a big integer represent a Solidity UInt?
    pure def isUInt(i: int): bool = (0 <= i and i <= MAX_UINT)
```



It often happens that a protocol requires auxiliary definitions that do not
depend on the protocol state, but only on the values of their parameters.
Such computations are often called "pure". In the above code, we define two
pure definitions:
 
 - The pure value `MAX_UINT`.

 - The pure definition `isUInt` that computes if a given integer `i` is within
   the range from 0 to MAX_UINT (inclusive).

The main property of pure values is that they always return the same value.
Pure definitions always return the same value, if they are supplied with the
same arguments.

To see that no state is needed, evaluate these definitions in REPL
(read-evaluate-print-loop):

            

```sh
echo "MAX_UINT" | quint -r coin.qnt::coin
```


```sh
echo "isUInt(22)" | quint -r coin.qnt::coin
```


```sh
echo "isUInt(-1)" | quint -r coin.qnt::coin
```


```sh
echo "isUInt(MAX_UINT + 1)" | quint -r coin.qnt::coin
```


The functional layer is actually quite powerful; a lot of protocol behavior can
be defined here without referring to protocol state.

As you can see, we have omitted the type of `MAX_UINT` but specified the type of
`isUInt`. Most of the time, the type checker can infer the types of values and
operator definitions, and giving additional type annotations is up to you. In
rare cases, the type checker may get confused, and then explicit type
annotations will help you in figuring out the issue.
            
## 5. Declare the protocol parameters

*Progress:*  17%

**Code snippet:**

```quint

    // STATE MACHINE:
    // State-dependent definitions and actions

    // Currently, we fix the set of all addresses to a small set.
    // In the future, we will be using the commented-out constant declaration.
    // For now, we are using simple aliases instead of actual Ethereum addresses.
    //const ADDR: Set[Addr]
    pure val ADDR = Set("null", "alice", "bob", "charlie", "eve")
```



In this step, we are starting to describe the protocol structure and behavior
in terms of a state machine.        

It often happens that protocols are parameterized in the sense that the protocol
may be instantiated for different parameter values, and different instances
still make sense. The typical parameters are:

 - the set of all possible addresses,

 - the address that performs a special role,

 - minimal and maximal values,

 - timeout values.

For this purpose, Quint offers `const` declarations. You can see one of them
in the commented out section of the code above. You may be wondering, what is
the difference between `const` and `pure val`. They mean to express the same
concept: A value that stays the same for all computations. However, they differ
in the time when they are bound to a value:

 - The `pure val` values are immediately defined via an expression in the
   right-hand side.

 - The `const` values are first declared and later they are substituted
   with actual values via an `instance` declaration.

Constant declarations are not fully supported yet. They will be available
as soon as the issue [#528](https://github.com/informalsystems/quint/issues/528)
is closed.

At the moment, we simply declare the value for a small set of addresses `ADDR`,
in order to be able to iterate on the protocol specification quickly.
        
## 6. Declare the protocol state

*Progress:*  21%

**Code snippet:**

```quint

    // the minter's address
    var minter: Addr
    // the balances in the subcurrency tokens
    var balances: Addr -> UInt
```



As a next step, we declare state variables, which together represent
a state of the protocol. In the above code, we introduce two such variables:

 - The variable `minter` to store the minter's address.
   The type of this variable is `Addr`.

 - The variable `balances` to store the balances of all users.
   The type of this variable is `Addr -> UInt`, which means a map from
   values of type `Addr` to values of type `UInt`.

Variable definitions always require type. Otherwise, it may be too hard
for the type checker to infer the types of the state variables.

If you compare the above variable definitions to the relevant variable
declarations in the Solidity contract, you should see that our variable
declarations are conceptually similar, modulo the slightly different syntax
of Solidity:


```Solidity
    // in Solidity:
    address public minter;
    mapping (address => uint) public balances;
```    
        
## 7. Declare operators over states

*Progress:*  26%

**Code snippet:**

```quint
    // a handy definition to query the whole state in REPL at once
    val state = { minter: minter, balances: balances }
```



It is often convenient to define a few helper operators.

We start with the definition of `state` that represents the entire
state as a record. This is what we do in the above code with the definition of
`state`. Notice that the definition of `state` is prefixed with `val`, not `pure val`.
Since `state` accesses state variables is it impure.

You can try to evaluate the definition of `state` in REPL right away:

            

```sh
echo "state" | quint -r coin.qnt::coin
```


If you tried that, you saw several error messages. The reason is that the state
variables are not initialized by default. We would have to introduce an
initialization action, which is usually called `init`. You will see how to
do that a few steps later.
            
## 8. Declare `require` and `totalSupply`

*Progress:*  30%

**Code snippet:**

```quint
    
    // a helper function to make preconditions similar to Solidity
    def require(cond: bool): bool = cond

    // compute the total supply of coins over all balances
    val totalSupply = ADDR.fold(0, (sum, a) => sum + balances.get(a))
```



In the above code, we introduce a helper definition `require` that
evaluates its Boolean parameter. As you might have noticed, this
definition is not doing anything useful. We introduce it to make the code
a bit more accessible for first-time readers who are familiar with
Solidity.

The definition of `totalSupply` may look a bit complex,
if you have never seen similar code before. Let's break it down into smaller
pieces:

 - The definition of `totalSupply` defines a value, but not a `pure` one.
   Hence, even though `totalSupply` does not take any parameters,
   it implicitly depends on the state. As a result, `totalSupply`
   may evaluate to different values in different states, that is,
   in those states where the values of `balances` differ.

 - `ADDR.fold(0, f)` iterates over the set of addresses in *some order*
   and for every address `a`, it applies `f(s, a)` for the accumulator value `s`,
   which is initialized with 0. In our example, the operator `f` is defined as
   an anonymous lambda operator: `(sum, a) => sum + balances.get(a)`. For our
   definition of `ADDR`, the computed value would be equal to:

   ```scala
    ((((0 + balances.get("null")) + balances.get("alice")) + balances.get("bob"))
      + balances.get("charlie")) + balances.get("eve")
   ```

   *Note that the order of the addresses in the brackets may be different from
   the one above. Hence, you should not rely on a particular order when
   using `fold` over sets. We are fine when using commutative operators such as `+` and `*`.*

        
## 9. Declare an initializer `init`

*Progress:*  34%

**Code snippet:**

```quint

    // state initialization
    action init: bool = {
        // since the contract can be initialized by an arbitrary message sender,
        // we choose the sender from the set of all addresses non-deterministically.
        nondet sender = oneOf(ADDR)
```



As you may have seen in the previous steps, the state variables `minter` and `balances`
are not initialized by default. In order to compute an initial state (there may be
several!), we define a special action that we call an *initializer*. In our
code, such an action is called `init`.

This definition is essential for describing the protocol. When you read somebody else's
protocol, it is one of the key parts to look at.

If we go back to the Solidity code, it looks as follows:

```Solidity
    // in Solidity
    constructor() {
        minter = msg.sender;
    }
```

In the Solidity code, the constructor is using an implicit parameter `msg.sender`,
which is propagated from a user request by the Ethereum Virtual Machine. Quint
does not have any built-in mechanism for reading user input. Instead, Quint
offers a very powerful mechanism of non-deterministic choice. This is
exactly what we do with the following line of code:

```scala
nondet sender = oneOf(ADDR)
```

This expression non-deterministically chooses one value from the set `ADDR`
(assuming that the set is not empty) and binds this value to the name `sender`.
The qualifier `nondet` indicates that the value of `sender` is special: the
name `sender` is bound to a fixed value, but `sender` *may evaluate to two
different values* when `init` is called twice or is called in different runs.
This behavior may look
complicated, but this is exactly what we expect from user input, too:
The user may submit different inputs, even if the protocol resides in
two identical states.

For more details, check
[oneOf](https://github.com/informalsystems/quint/blob/main/doc/builtin.md#pure-def-oneof-seta--a)
in the reference manual.

        
## 10. Assign initial values to the state variables

*Progress:*  39%

**Code snippet:**

```quint
        all {
            minter' = sender,
            balances' = ADDR.mapBy(a => 0)
        }
    }
```



The rest of `init` is simple:
The value of `minter` is set to the value of `sender`, and the value
of `balances` is set to the map that maps all addresses from `ADDR`
to value 0. Notice that the variables `minter` and `balances` are not assigned
their new values immediately; they are assigned once `init` is
evaluated completely (and only if `init` evaluated to `true`).

Now we can call `init` and evaluate an initialized state in REPL:

            

```sh
echo "init\n state" | quint -r coin.qnt::coin
```


**Exercise:** Call `init` multiple times in REPL and evaluate `state` after
each call. Did you get the same initial states every time or were some states
different?

Remember that we called `init` an initializer? This is because `init`
only assigns new values to state variables, but does not read their previous values.

**Exercise:** Modify the assignment to `balances` in such a way that `minter`
gets 1000 coins, while the other addresses get 0 coins, as before.
Hint: use `if (cond) value1 else value2`.
            
## 11. Defining the action `send`

*Progress:*  43%

**Code snippet:**

```quint

    // Sends an amount of newly created coins to an address.
    // Can only be called by the minter, that is, the contract creator.
    // Note that we have to add `sender` as an action parameter,
    // which is accessed implicitly via `msg.sender` in Solidity.
    action mint(sender: Addr, receiver: Addr, amount: UInt): bool = all {
        require(sender == minter),
        val newBal = balances.get(receiver) + amount
        all {
            // Solidity does the overflow check under the hood.
            // We have to add it ourselves.
            require(isUInt(newBal)),
            // update the balances and keep the minter address
            balances' = balances.set(receiver, newBal),
            minter' = minter,
        }
    }
```



Similar to Solidity, we define the action `mint`. In contrast to `init`,
we have decided to avoid non-deterministic choice in `mint`.
Instead we are passing the user inputs as action parameters. You will see
later that this makes debugging and testing easier.

If you understood how `init` works, the behavior of `mint` should be also
easy to figure out. If you wonder what `get` and `set` are doing, here is
the explanation:

 - `balances.get(receiver)` produces the value assigned to the key `receiver`
   in the map `balances`. If the key `receiver` has no value assigned in
   the map `balances`, REPL would show a runtime error.
   For more details, check
   [get](https://github.com/informalsystems/quint/blob/main/doc/builtin.md#pure-def-get-a---b-a--b)
   in the reference manual.

 - `balances.set(receiver, newBal)` produces a new map, that assigns
   the value of `newBal` to the key `receiver`, and keeps the other key-value
   pairs as in `balances`.
   For more details, check
   [set](https://github.com/informalsystems/quint/blob/main/doc/builtin.md#pure-def-set-a---b-a-b--a---b)
   in the reference manual.

Now it's time to mint some coins in REPL! Try the following:

            

```sh
echo 'init\n mint(minter, "bob", 2023)\n state' | quint -r coin.qnt::coin
```


As you can see, we can mint coins for Bob.

**Exercise:** Mint more coins for Bob, actually, mint `MAX_UINT` coins.
Do you understand what happened in this case?
            
## 12. Defining the action `send`

*Progress:*  47%

**Code snippet:**

```quint

    // Sends an amount of existing coins from any caller (sender)
    // to a receiver's address.
    // Note that we have to add `sender` as an action parameter,
    // which is accessed via implicit `msg.sender` in Solidity.
    action send(sender: Addr, receiver: Addr, amount: UInt): bool = all {
        require(not(amount > balances.get(sender))),
        if (sender == receiver) {
            balances' = balances
        } else {
            val newSenderBal = balances.get(sender) - amount
            val newReceiverBal = balances.get(receiver) + amount
            all {
                // Again, Solidity does an automatic overflow test.
                // We do it ourselves.
                require(isUInt(newSenderBal)),
                require(isUInt(newReceiverBal)),
                balances' =
                    balances
                    .set(sender, newSenderBal)
                    .set(receiver, newReceiverBal)
            }
        },
        // keep the minter unchanged
        minter' = minter,
    }
```



If you understood the mechanics of the action `mint`, you should easily
figure out the behavior of `send`.

Play with `mint` and `send` in REPL! The simplest scenario would be:

            

```sh
echo 'init\n mint(minter, "bob", 2023)\n send("bob", "eve", 1024)\n state' | quint -r coin.qnt::coin
```

## 13. Defining a protocol step

*Progress:*  52%

**Code snippet:**

```quint

    // All possible behaviors of the protocol in one action.
    action step: bool = {
        nondet sender = oneOf(ADDR)
        nondet receiver = oneOf(ADDR)
        nondet amount = 0.to(MAX_UINT).oneOf()
        // execute one of the available actions/methods
        any {
            mint(sender, receiver, amount),
            send(sender, receiver, amount),
        }
    }
```



Finally, we can put together `mint` and `send` to describe every possible
transition of the protocol! To this end, we non-deterministically choose
the sender, the receiver, and the amount (from the set of integers from 0
to `MAX_UINT`, inclusive). The expression `any { ... }` executes one of its
arguments; if both could be executed, one of them is executed
non-deterministically.

**Exercise:** Run REPL, execute `init` once and execute `step` multiple times.
Do you understand why some of the occurrences of `step` evaluate to `false`
and some evaluate to `true`? It may help you, if you print `state` after `init`
and `step`.

We have defined the state variables, the initializer, and a step of the protocol.
This is the minimal set of tasks for defining a working protocol.
What we have achieved here is great! You can play with the protocol, feed it
with different parameters in REPL, and experiment with your protocol.

Although you should definitely play with the protocol at this point, we urge you
not to stop here! In the next steps, we show you the real magic of Quint.
        
## 14. Expected properties

*Progress:*  56%

**Code snippet:**

```quint

    // INVARIANTS AND TEMPORAL PROPERTIES
```



Having defined the protocol behavior with `init` and `step`, it is time to think
about what we expect from the protocol. This is a good place for specifying
protocol invariants and temporal properties.

        
## 15. Defining the most basic invariant

*Progress:*  60%

**Code snippet:**

```quint

    // One of the simplest properties is that all balances are within the uint range.
    // While it is automatically guaranteed by Solidity, our specification is using
    // big integers. Hence, it makes sense to check the range.
    val balancesRangeInv: bool = 
        ADDR.forall(a => isUInt(balances.get(a)))
```



One of the most basic properties that we expect from the protocol is defined
by the property `balancesRangeInv`. This property goes over all addresses
in `ADDR` and tests, whether the value stored in `balances` for every address
is in the range from `0` to `MAX_UINT` (inclusive).

We can immediately check this invariant for a few states:

            

```sh
echo 'init\n balancesRangeInv\n mint(minter, "bob", 2023)\n balancesRangeInv\n send("bob", "eve", 1024)\n balancesRangeInv\n ' | quint -r coin.qnt::coin
```


Properties like `balancesRangeInv` are called *invariants*, because we expect
them to hold in every state that could be produced by `init` and a number of
`step` actions. Intuitively, whatever happens, the property should hold true.

It is important to distinguish between the properties that we would like to be
invariants and the properties that we have proven to be invariants.
To be precise, the former properties are called *invariant candidates*,
whereas the latter are actually called *invariants*.
            
## 16. Defining the total supply invariant

*Progress:*  65%

**Code snippet:**

```quint

    // It is desirable that the total supply of tokens fits into UInt.
    // Otherwise, a blockchain implementation or the user interface
    // may run into an unexpected overflow when adding up the balances.
    val totalSupplyDoesNotOverflowInv: bool = {
        isUInt(totalSupply)
    }
```



Another basic invariant that we intuitively expect to hold is defined in
`totalSupplyDoesNotOverflowInv`. It is so simple that it should hold true, right?
If we have your attention now, read further!

**Exercise:** Extend the protocol with a state variable called `totalMinted`,
initialize it with 0 and increase it in `mint` with the `amount` passed to `mint`.

        
## 17. Temporal properties

*Progress:*  69%

**Code snippet:**

```quint

    // The temporal property that says the following:
    // Assume that we want to check the temporal property `NoSupplyOverflow`
    // for every initial state. Then we have to check for every initial state
    // that it never produces a computation that ends in a state violating
    // `totalSupplyDoesNotOverflowInv`. In general, temporal properties may be
    // checked against any kinds of states, not only initial ones.
    temporal NoSupplyOverflow: bool = always(totalSupplyDoesNotOverflowInv)
```



After we have defined state invariants, we should normally think about
temporal properties in general such as safety and liveness. However, 
temporal properties are an advanced topic, and smart
contracts are typically focused on safety. Thus, it is safe to skip this topic
for now. It is just important to know that temporal properties are labelled
with the qualifier `temporal`.

        
## 18. Tests

*Progress:*  73%

**Code snippet:**

```quint

    // TESTS

    // send should not work without minting
    run sendWithoutMintTest = {
        init.then(send(minter, "bob", 5))
            .fail()
    }
```



So far, we have been running sequences of actions in REPL, to get
basic understanding of the protocol mechanics. While REPL is capable of
replaying actions one-by-one, it would be more convenient to run something
similar to unit tests or integration tests, which are ubiquitous in
programming languages.

We normally add tests in the very bottom of the protocol module, or in
a separate module.

Quint introduces *runs* to express "happy paths" and tests. The above code
shows a simple test `sendWithoutMintTest`.
In this test, the action `init` runs first. If it evaluates to `true`,
then the action `send(...)` is run. Since this action is composed with
`fail()`, the action `send(...)` is expected to evaluate to `false`.

Go ahead and see if this test goes through:

            

```sh
echo 'sendWithoutMintTest' | quint -r coin.qnt::coin
```


**Exercise:** Actually, if you look carefully at the code of `send`,
you can find one value for `amount` that makes `send` work even without
prior minting. What is this value?
            
## 19. A single data point test

*Progress:*  78%

**Code snippet:**

```quint

    // `mint`, then `send`
    run mintSendTest = {
        init.then(mint(minter, "bob", 10))
            .then(send("bob", "eve", 4))
            .then(all {
                assert(balances.get("bob") == 6),
                assert(balances.get("eve") == 4),
                minter' = minter,
                balances' = balances,
            })
    }
```



We can write longer tests that are similar to unit/integration tests
in normal programming languages. For instance, the above test `mintSendTest`
makes sure that the exact sequence of `mint` and `send` transactions goes
through and the resulting balances have the expected values.

            

```sh
echo 'mintSendTest' | quint -r coin.qnt::coin
```


**Exercise:** Change some numbers in the test, run it again in REPL and observe
what happens.

Although it is better to have a test like `mintSendTest` than no test at all,
`mintSendTest` is testing only one data point. We can do better in Quint,
see the next step.
            
## 20. Testing with non-deterministic inputs

*Progress:*  82%

**Code snippet:**

```quint

    // Mint some coins for Eve and Bob.
    // Test that Eve can always send coins to Bob,
    // if she has enough on her balance.
    // This test may fail sometimes. Do you see why?
    // If not, execute it multiple times in REPL, until it fails.
    run mintTwiceThenSendError = {
        // non-deterministically pick some amounts to mint and send
        nondet mintEve = 0.to(MAX_UINT).oneOf()
        nondet mintBob = 0.to(MAX_UINT).oneOf()
        nondet eveToBob = 0.to(MAX_UINT).oneOf()
        // execute a fixed sequence `init`, `mint`, `mint`, `send`
        init.then(mint(minter, "eve", mintEve))
            .then(mint(minter, "bob", mintBob))
            .then(
                if (eveToBob <= balances.get("eve")) {
                    // if Eve has enough tokens, send to Bob should pass
                    send("eve", "bob", eveToBob)
                } else {
                    // otherwise, just ignore the test
                    all { minter' = minter, balances' = balances }
                }
            )
    }
```



Instead of testing a sequence of transactions for a carefully crafted
single input, we could fix a sequence of transactions and let the computer
find the inputs that fail the test. This is exactly what we are doing in
the above test `mintTwiceThenSendError`. The test non-deterministically
chooses the amounts of coins to mint and send and then executes the actions
`mint`, `mint`, and `send`. As the values are chosen non-deterministically,
we know that some of the inputs should fail `send`. Our hypothesis is that
`send` should never fail when Eve has enough coins on her account.
If she does not, we simply ignore this choice of inputs in the else-branch.

Let's run this test:

            

```sh
echo 'mintTwiceThenSendError' | quint -r coin.qnt::coin
```



If you lucky, it fails right away. If it does not fail, run it multiple times,
until it fails. To see why it failed, evaluate `state` after executing
the test. Do you understand why our hypothesis was wrong?

**Exercise:** Fix the condition in `mintTwiceThenSendError`,
so that the test never fails.

If you carefully look at `mintTwiceThenSendError`, you will see that it is still
a single data point test, though the data point (the inputs) are chosen
non-deterministically every time we run the test. In fact, REPL implements
non-determinism via random choice.

If you do not want to sit the whole day and run the test, you could integrate
it into continuous integration, so it runs from time to time for different
inputs. Quint comes with the command `test` that is designed for exactly this
purpose. Try the command below. Most likely, it would find a violation
after just a few tests.
          

```sh
quint test --match mintTwiceThenSendError coin.qnt
```


Also, we had to fix the sequence of actions in our test. We can do
better with Quint.

            
## 21. Testing with non-deterministic inputs and control

*Progress:*  86%

**Code snippet:**

```quint

    // to run the random simulator for 10000 executions, each up to 10 actions,
    // execute the following in the command line:
    //
    // $ quint run --invariant totalSupplyDoesNotOverflowInv coin.qnt
```



It is often hard to find a good sequence of actions that breaks an invariant.
Similar to how we let the computer to find the right inputs, we can use the
computing power to look for bad sequences of actions.

Quint REPL actually supports random search for sequences of actions that violate
an invariant. Its UX is a bit ad hoc at the moment. We will improve it in the
future. You can try it right away:

            

```sh
quint run --invariant totalSupplyDoesNotOverflowInv coin.qnt
```



The above command in REPL randomly produces sequences of steps,
starting with `init` and continuing with `step`, up to 20 steps. It checks the
invariant `totalSupplyDoesNotOverflowInv` after every step. If the invariant is
violated, the random search stops and returns `false`. If no invariant violaion
is found, the search returns `true` after enumerating the specified number of runs,
which is 10000 in our example. The search parameters such as the number of
runs and steps can be tuned. Check the options of `run`:

            

```sh
quint run --help
```

## 22. Does random testing always find bugs?

*Progress:*  91%


To be honest, our example is relatively simple, and we were quite lucky
that the invariant `totalSupplyDoesNotOverflowInv` was often violated by
a completely random search. For more complex protocols, random search
often gets stuck while looking for non-interesting inputs or sequences
of actions. Hence, if you have a hunch about where an error could potentially
be, you could restrict the scope of the search by:

 - Restricting the scope of non-determinstic choices, e.g.,
   by making every set in `oneOf(S)` smaller.

 - Restricting the choice of actions, e.g., by removing non-essential
   actions from `step`.

Although the above tricks may help you in detecting some bugs, it is well
known that there is always a probability of missing a bug with random search.

If you are looking for better guarantees of correctness, Quint will be soon
integrated with the
[Apalache model checker](https://github.com/apalache-mc/apalache).
The model checker looks for counterexamples more exhaustively, by solving
equations. In some cases, it may even give you a guarantee that there is no bug,
if it has not found any.

        
## 23. Suming it up

*Progress:*  95%


This was a long tutorial. We have specified the whole protocol,
experimented with it, wrote several tests and even found some surprising
behavior of this protocol. We hope that by going through this tutorial
you have got an idea of how you could specify your own protocol in Quint
and make Quint useful for solving your problems with protocols!

We have used a Solidity contract as the running example. Actually,
there is not much special about Solidity in this coin protocol.
A similar protocol could be implemented in
[Cosmos SDK](https://tutorials.cosmos.network/)
or [Cosmwasm](https://cosmwasm.com/).

We are experimenting with different kinds of tutorials.
It would be great to learn whether you liked this tutorial format, or not.
Please vote in the
[discussion](https://github.com/informalsystems/quint/discussions/595).
        
## The end

  You have made it!
      