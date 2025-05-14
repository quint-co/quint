# EWD426

This folder contains Quint specifications for the three different self-stabilization algorithms proposed by Dijkstra in [EWD426](https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD426.html).
1. A solution with K-state machines [ewd426.qnt](ewd426.qnt)
2. A solution with three-state machines [ewd426_3.qnt](ewd426_3.qnt)
3. A solution with four-state machines [ewd426_4.qnt](ewd426_4.qnt)

Due to the presence of temporal properties and fairness, we need to use TLC to model check these specs. As the integration with TLC is not completed, we provide a script to automate running it for these specific specifications: [check_with_tlc.sh](../../../../tlc/check_with_tlc.sh). Usage:

```sh
check_with_tlc.sh ewd426_3.qnt --temporal convergence,closure,persistence
check_with_tlc.sh ewd426_4.qnt --temporal convergence,closure,persistence
```

If you are trying to learn/understand these algorithms, we recommend playing with the Quint REPL. For that, pick one of the files (for example [ewd426.qnt](ewd426.qnt)) and run the following command in the terminal:
``` sh
quint -r ewd426.qnt::ewd426
```

This will open the REPL with the `ewd426` machine loaded. You can now interact with the machine and explore its states and transitions:

``` bluespec
Quint REPL 0.22.4
Type ".exit" to exit, or ".help" for more information
>>> init
true
>>> step
true
>>> show_token(system)
Map(0 -> false, 1 -> true, 2 -> true, 3 -> false, 4 -> true, 5 -> false)
>>> 5.reps(_ => step)
true
>>> show_token(system)
Map(0 -> true, 1 -> false, 2 -> false, 3 -> false, 4 -> false, 5 -> false)
```
