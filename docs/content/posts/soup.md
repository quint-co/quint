---
title: "Message Soup: the Secret Sauce for Consensus Specifications"
date: 2025-07-30
excerpt: 
authors:
    - name: Yassine Boukhari
    - name: Gabriela Moreira    
    - name: Josef Widder

tags:
    - intermediate
---

# Message Soup: the Secret Sauce for Consensus Specifications

If you've ever tried to debug a consensus implementation, you know the frustration: your algorithm is stuck, but the logs shows hundreds of steps that obscure what's actually happening. You're drowning in implementation details when what you really need to understand is whether enough validators have voted to move to the next phase.

Consensus algorithms are among the hardest distributed systems problems to solve correctly, so you don't want to debug them in production. This is exactly why formal specification matters: you need to catch algorithmic errors before deployment. But writing good consensus specifications requires choosing the right level of abstraction.

There are some best practices that are useful to know. In this post we talk about one of them, the message soup, and how it helps you to focus on the core of consensus mechanism. We'll explore the message soup pattern, demonstrate its benefits through a comparison of specification approaches, and show how it leads to more analyzable consensus specifications.


## Recent consensus specifications

Consensus algorithms have recently gained novel attention, with Malachite, Alpenglow, Espresso, and MonadBFT, Minimmit, ChonkyBFT being just some example projects. Did you know that all of them have a Quint specification? You'll find a list with links at the bottom of this post.

We have written some of these specifications for newly announced algorithms. For Solana's Alpenglow and Category Lab's MonadBFT we have taken a straight-forward approach: we have specified in Quint what was written in the original papers. 

TODO: Doings is better than reading 


As we discussed in the [previous post](https://quint-lang.org/posts/alpenglow), a big value we get out of specs is that they help us to understand the algorithm. So let's do this exercise again, and let Quint generate example traces, where a block has been finalized

TODO: Show that the Monad trace is long and Alpenglow is short

While we would say, that these consensus algorithms are more or less comparable, the specifications seem to differ significantly in terms of usability and efficiency. The reason is that the Alpenglow specification uses actions that are guarded by predicates over the message soup, while the Monad spec is doing explicit bookkeeping. Wait! What does all that mean?

## The message soup design pattern vs. explicit bookkeeping

Let's look a bit at the structure of the actions. As we already have seen in the previous post, in the Alpenglow specification we have actions like `blockNotarizedAction(v, slot)`, which is enabled when 60% of the voting power have sent a notar vote. In more detail, all messages that are sent are stored (forever) in a variable `msgBuffer`. This is the famous message soup; one set that contains all message that were ever sent. 

This is a modeling trick. Production systems never work this way: messages travel over network stacks and disappear once received. However, production nodes do store information about received messages, making the local state an imperfect snapshot of network history.

Node actions are based on this stored history; there's one level of indirection through receiving and storing. In specifications, we can eliminate this indirection. Instead of defining actions based on local state (which depends on network history), we can define them directly based on network history: the message soup.

Observe that `blockNotarizedAction(v, slot)` is guarded by a predicate over the message soup (has 60% of the voting power voted), and this predicate is evaluated by the quint simulator. What is happening here effectively is that all the bookkeeping that an implementation is doing (reading messages one-by-one, storing it, eliminating duplicates, pruning etc.) is abstracted away, and only the **effect** of the bookkeeping is visible in a Quint run. This is a good thing, if we don't care too much about the bookkeeping. Remember, we don't want all the details that the logs of a testnet would give to us. 

Note: There are specific questions, e.g., when you want to focus on optimization in the bookkeeping implementation or want to focus on specifics in which order predicates should be evaluated, where modeling bookkeeping makes a lot of sense (we have done it in the driver and voterkeeper specs for Malachite). But for analyzing the core consensus algorithm it is good practice that these specifics should be abstracted. 

In contrast, the Monad spec has the action `receive_message`. Most of the time, this action doesn't do anything interesting: it just stores that it has received a message. Only when the number of received messages surpasses a given threshold, the action does something interesting, like sending a message or finalizing a block. In contrast, the `blockNotarizedAction(v, slot)` always does something interesting, but it happens more rarely. Observe that `receive_message` actually pulls all the bookkeeping within the specification, and its state space. So we have a level detail here in the specification, that we don't really care about, and which actually gets in our way, when wanting to analyze the core consensus mechanism.

Let's be clear. This is not about comparing the two consensus algorithms. The point we are discussing here is a matter of abstraction in the specification. To not compare apples and oranges in the remainder of the post, and to not give the wrong impression that we compare different algorithms, we have refactored MonadBFT to also work on the message soup. This has allowed us to analyze interesting scenarios that we couldn't do with our first attempt of specifying it.




## Cooking the soup: from single messages to quorum transitions
The recipe to go from explicit bookeeping to the message soup pattern is surprisingly simple. Take any place where you need a quorum of messages to trigger some effect and instead of modeling each message arrival individually, just model the moment when the quorum threshold is crossed. You skip all the intermediate states where you've received some messages but not enough, and jump straight to "threshold reached, action taken."
This works particularly well for MonadBFT because it's already structured around quorum-driven events. Vote quorums create QCs, timeout quorums create TCs, and these certificates drive the consensus protocol forward. In our refactored specification, each certificate formation becomes one atomic transition rather than a series of incremental message processing steps.

## TODO: This needs better Presentation (Arrow to represent the transformation)
```
pure def upon_vote_msg(vote: VoteMsg, s: LocalState): Transition =
    if (s.is_leader() and s.is_valid(vote))
        val s1 = s.add_vote(vote)
        if (s1.get_votes(vote.id).size() >= Q)
            val qc = s1.build_qc(vote.id)
            val p =  s1.build_proposal(qc)
            {postState: s1 , effects: Set(BroadcastProp(p))}
        else
            nop(s1)
    else
        nop(s)
```

```
pure def upon_vote_quorum(vote_soup: Set[VoteMsg], s: LocalState): Set[Transition] =
    if (s.is_leader())
        vote_soup.filter(v => s.is_valid(v))
                 .groupBy(v => v.id)
                 .values()
                 .filter(q => q.size() >= Q)
                 .map(vs => s.build_qc(vs))
                 .map(qc => s.build_proposal(qc))
                 .map(p => {postState: s , effects: Set(BroadcastProp(p))})
    else
        Set(nop(s))
```
Now let's compare the two MonadBFT specifications: the original with explicit bookkeeping versus our refactored version using the message soup pattern. To compare the performance of the two approaches, we use a set of witnesses that explore different scenarios ranging from a simple reproposal case to more complex scenarios like the disappearance of a high tip from subsequent view. A witness is something that we expect to hold in at least one state in one execution. We can then ask the Quint simulator whether it can find a trace that leads to a state that is described by the witness. We conducted 2 sets of experiments that answer these questions: How fast can a model find a specific witness "once"? What is the frequency of witness observation across multiple samples?

## Long Story Short
Remember how we said the message soup approach skips intermediate states? Well, this shows up dramatically in the traces. The same consensus scenario where a reproposal is observed that takes on average 37 steps with message soup needed 500+ steps in the original bookkeeping version. That's not just a numbers game, it's the difference between seeing the consensus logic clearly versus getting lost in translation.
Whether you're manually analyzing traces or feeding them to an LLM to parse and explain the behavior, shorter and more coarse-grained traces are always better. For engineers, it's about cognitive load as you can actually follow the consensus flow without drowning in message-handling mechanics. For language models, it's about token efficiency—why burn through your context window on message tracking when you could focus those tokens on the actual algorithmic logic?

## TODO: ADD BAR PLOT HERE FOR THE EXAMPLE ABOVE

## A Need for Speed
The message soup version finds witnesses at least 3x faster than the bookkeeping approach, and that's in the worst case. For more complex scenarios, the message-per-message version would often time out or run out of memory entirely while the message soup version sailed through. This speed matters because faster executions mean faster debugging cycles and more extensive coverage of the state space. When you can explore more scenarios in the same amount of time, you're establishing more trust in your system. More speed, more trust, more sleep.

## TODO: ADD REST OF BAR PLOTS HERE

## What Doesn't Kill You Makes You Stronger
A powerful trick to model byzantine behavior is to simply pre-populate the message soup with all messages that byzantine nodes could ever send without modeling complex byzantine node logic. The message soup approach handles the load that comes with this technique more elegantly than explicit bookkeeping: because our system only makes transitions on enabled steps, having a huge number of possibilities for byzantine messages doesn't cause state space explosion. In the bookkeeping approach, every byzantine message creates a new state transition that the system has to explore, leading to exponential blowup. 
The plot below shows resilience to byzantine messages injection. We can see that the frequency of observing witnesses is unaffected for the message soup approach, but the bookkeeping version fails to maintain this resilience. In the single-message version, there's a massive gap between the Byzantine and honest scenarios. Byzantine conditions severely degrade performance while the message soup approach shows barely any difference.
## TODO: ADD LINE PLOT HERE
When you're dealing with adversarial networks, what doesn't kill your protocol makes it stronger. The message soup cuts through the byzantine noise and helps you focus on what really matters: is your design still safe when under attack?


List of blog posts/resources for consensus in Quint:
- [Alpenglow](https://quint-lang.org/posts/alpenglow)
- [Espresso](https://informal.systems/blog/espresso-hotshot-epoch-changes-in-quint-2025)
- [ChonkyBFT](https://protocols-made-fun.com/consensus/matterlabs/quint/specification/modelchecking/2024/07/29/chonkybft.html)
- [Minimmit](https://github.com/commonwarexyz/monorepo/tree/main/pipeline/minimmit/quint)
