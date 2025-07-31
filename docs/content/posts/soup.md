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

## Performance comparison


TODO: you can take a look here. Here is the action that corresponds to the logic discussed above

TODO: look for the same witness. Show that MonadSoup finds a shorter trace


- How fast are we finding witnesses 
- How long are witnesses
    - More understandable
- How resilient to Byzantine messages

TODO: Perhaps graphs for multiple witnesses and use webpage magic to make it easier to view

TODO: find a place: it is also practice to model Byzantine faults, but just preloading all messages that they can send in the message soup.



List of blog posts/resources for consensus in Quint:
- [Alpenglow](https://quint-lang.org/posts/alpenglow)
- [Espresso](https://informal.systems/blog/espresso-hotshot-epoch-changes-in-quint-2025)
- [ChonkyBFT](https://protocols-made-fun.com/consensus/matterlabs/quint/specification/modelchecking/2024/07/29/chonkybft.html)
- [Minimmit](https://github.com/commonwarexyz/monorepo/tree/main/pipeline/minimmit/quint)