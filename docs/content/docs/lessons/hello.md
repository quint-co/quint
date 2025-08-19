# Lesson 0 - Hello, world!
## 1. Introduction

*Progress:*  0%

This lesson introduces the standard "Hello, world!" example.
Since Quint is designed for distributed protocols, we introduce
a barebone protocol, instead of just printing "Hello, world".

In our protocol, two parties are communicating:

 - the computer that outputs "Hello, world!" to the console, and
 - the user who reads "Hello, world!" from the console.

We describe the protocol in terms of a state machine. This means
that we have to describe two important aspects of the protocol:

 - What constitutes a state of the state machine.
 - What kinds of transitions can be made by the state machine.

          
          

If you would like to see the complete code before diving into
the details, check [hello.qnt](https://github.com/informalsystems/quint/blob/main/examples/tutorials/hello.qnt).
          
## 2. Declare a module

*Progress:*  10%

**Code snippet:**

```quint
module hello {
```


As a first necessary step, we declare a top-level module for our protocol.
        
## 3. Introduce state variables

*Progress:*  20%

**Code snippet:**

```quint

    // the state variable to keep the output by the computer
    var consoleOutput: str
```


The main purpose of Quint is to code a distributed protocol as a state machine.
Since different protocols may output "Hello, world!" differently, Quint does not
have any printing facilities like `print(...)` or `console.log(...)`. In our
protocol, we opt to simply store the output in the variable called `consoleOutput`.

Once introduced, this variable becomes an integral part of the state. Hence, we have to
take care of it, when the state machine makes a transition from one state to another.

All state variables require a type. We use `str`, that is, the string type.
        
## 4. Introduce state variables

*Progress:*  30%

**Code snippet:**

```quint

    // the state variable to keep the out read by the user
    var readByUser: str
```


The output does not have to be immediately consumed by the user. Hence, we introduce
another state variable called `readByUser`, which will store the last output read
by the user. This state variable has the string type too.
        
## 5. Introduce an initializer

*Progress:*  40%

**Code snippet:**

```quint

    // initialize the state machine that captures the protocol
    action init = all {
      consoleOutput' = "",
      readByUser' = ""
    }
```


Since we are writing distributed protocols in Quint, there is no
reasonable default for initializing a distributed protocol. This means
that we have to think about protocol initialization and write an
initialization action.

This is what we do in the action called `init`. Let's break down
what is going on here. We have two assignments to state variables:

 1. `consoleOutput' = ""`
 2. `readByUser' = ""`

These two assignments are executed in no particular order. In fact,
you can imagine that they are executed in any order:

  - 1, then 2
  - 2, then 1
  - 1 and 2 at the same time

Once finished, every assignment records the value of its left-hand side
for the next state, and the assignment unconditionally returns the result `true`.
Importantly, the assignments do not update the values of `consoleOutput`
and `readByUser` immediately.

Once both assignments are finished, the operator `all {...}` is finished,
and it returns `true` (since both assignments returned `true`).
As a result, the whole action `init` returns the result `true`.
When `init` is executed as a top-level action, it transitions the state
machine from whatever state it was in to the state where `consoleOutput = ""`
and `readByUser = ""`.

If you think that the above behavior of assignments is a bit silly,
read the next step.
        
## 6. Introduce an action by the computer

*Progress:*  50%

**Code snippet:**

```quint

    // write "Hello, world!" in consoleOutput of the state machine,
    // if the console output is clean
    action write = all {
      consoleOutput == "",
      consoleOutput' = "Hello, world!",
      readByUser' = readByUser,
    }
```



Now it's time to print the "Hello, world!" message. Similar to `init`, we
introduce the action `write`. In contrast to `init`, this action cannot be
unconditionally executed in any state of our state machine.  Similar to how the
variable `consoleOutput` is updated in the action `init`, you should be able to
see how the action `write` schedules an update of `consoleOutput` in the next
state. This only happens though, if the action `write` returns `true`.

The first statement of `write` may be confusing to you though:

```scala
  consoleOutput == ""
```

If you are familiar with C, Java, JavaScript and similar languages, this
statement looks useless, as in those languages such an expression would be
evaluated and its result would be simply dropped. Moreover, in a static
language such a statement could be simply removed by the compiler as
fruitless at the optimization stage.

In Quint, things are a bit different. Recall the discussion about the
action `init` at the previous step. Assignments return `true` and
`all { ... }` returns true only if all of its arguments return `true`.
The same principle applies to the expression `consoleOutput == ""`.
If `consoleOutput == ""` evaluates to `true` in the current state
of the state machine, then the enclosing expression `all { ... }`
evaluates to `true`, and only then the action `write` evaluates to `true`
and it may produce the next state.

Finally, the third statement may look useless to you too:

```scala
  readByUser' = readByUser,
```

Why shall we say that `readByUser` keeps its value in the next state?
Most likely, we will be able to automatically infer this in the future.
In the current version of Quint, if an action is used to execute transitions,
it has to explicitly assign values to all of the state variables.
        
## 7. Introduce an action by the user

*Progress:*  60%

**Code snippet:**

```quint

    // read the message from `consoleOutput` into `readByUser`,
    // if the console output is not clean
    action read = all {
      consoleOutput != "",
      readByUser' = consoleOutput,
      consoleOutput' = consoleOutput,
    }
```


If you understood the behavior of `write`, it should be easy to see
what is happening in the action `read`.

**Exercise:** Try to spell out the behavior of `read` similar to
how we did it for `write`.
        
## 8. Describe a single step

*Progress:*  70%

**Code snippet:**

```quint

    // execute a single step of the state machine:
    // it may be `read` or `write`, whatever is available
    action step = any {
      write,
      read
    }
```



We have described `init`, `read`, and `write`. These are the essential actions
for understanding our protocol. However, we have to also understand *when* the
actions may be executed. We do this by composing `read` and `write` into the
action called `step`.

The operator `any { ... }` looks similar to `all { ... }`. Indeed, they are of
the same nature. While the operator `all { ... }` returns `true` if and only if
all of its arguments return `true`, the operator `any` returns `true` if and
only if at least one of its arguments returns `true`. Moreover, `any { ... }`
executes only one of its arguments that evaluate to `true`. That is, if several
actions (like `read` and `write`) can be executed in the same state, `any { ... }`
would pick one of them and execute it.

There is no particular way of choosing among simultaneously enabled actions.
You can imagine that they are picked at random, and they are indeed picked at random
by the random simulator of Quint. However, when we describe a distributed protocol,
we should not rely on probabilistic guarantees offered by random choice, unless
we know the probability distribution in our protocol for sure. Hence, we say
that `any { ... }` chooses one of the actions *non-deterministically*.
        
## 9. Introduce a simple test

*Progress:*  80%

**Code snippet:**

```quint

    // a simple test that demonstrates an interaction between
    // the computer and the user
    run writeReadTest = init.then(write).then(read)
```


We have written all the important parts of our protocol. It would be nice not
to only read the code, but also to execute it somehow. After all, this is what
we normally do with the code.

Since we are specifying a distributed protocol, there may be many ways to
execute actions in different orders. In general, it is not even always clear,
whether our protocol has terminated or not. Luckily, our protocol is quite simple.

To test our protocol, we fix one particular execution sequence in `writeReadTest`:

 1. Execute the initialization action `init`.
 2. Execute the action `write`.
 3. Execute the action `read`.

We could draw this execution sequence with UML sequence diagrams or state
diagrams. For example:

![test1-sequence](./img/hello-test1.png)

The unfortunate fact about UML sequence diagrams and state charts is that they
are given as figures, which have to be executed in the reader's brain.

In Quint, running `writeReadTest` is as simple as evaluating an expression. To try it
out, run the command `quint`, which starts a REPL session, and execute the
following commands (written after the REPL prompt `>>> `):

```sh
$ quint -r hello.qnt
Quint REPL v0.0.3
Type ".exit" to exit, or ".help" for more information
>>> import hello.*

>>> writeReadTest
true
```

In the above session, we load the module `hello` from the file `hello.qnt`,
import all definitions from the module `hello` and execute the run
`writeReadTest`. As indicated with the result `true`, the run was executed
successfully. We can also evaluate the state variables `consoleOutput` and
`readByUser` in the state produced by `writeReadTest`:

```sh
>>> consoleOutput
"Hello, world!"
>>> readByUser
"Hello, world!"
```

Running tests by hand in REPL may quickly become tedious. To automate that,
use the `test` command:

            

```sh
quint test hello.qnt
```


**Exercise:** Carefully read the code of `read` and `write` again. Explain,
whether it is possible to execute `read` and `write` in the same state.

**Exercise:** Explain, whether it is possible to execute `read` or `write`
after executing the run called `writeReadTest`.
            
## 10. Suming it up

*Progress:*  90%

We have covered all the aspects of our "Hello, world!" example.
Actually, we could have written a much shorter example, but it would not
demonstrate the distinctive features of Quint. If you look at the
source code of [hello.qnt](./hello.qnt), it is not scary long.

We are experimenting with different kinds of tutorials.
It would be great to learn, whether you liked this tutorial format, or not.
Please vote in the
[discussion](https://github.com/informalsystems/quint/discussions/509).
        
## The end

  You have made it!
      
