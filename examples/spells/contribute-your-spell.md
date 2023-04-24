# Contribute your spell :scroll:

If you have find a small nice definition that helps you in writing Quint specs,
consider contributing it to our library of spells :scroll:.

To do so, open a pull request that adds a spell in the file
[rareSpells.qnt](./rareSpells.qnt) by following the template:

```bluespec
 /// An explanation of what the spell is doing.
 ///
 /// @param __param1 a description of the first parameter
 /// @param __param2 a description of the second parameter
 /// ...
 /// @returns a description of the returned value
pure def <name>(<parameters with types>): <return type> = {
  <body>
}

run <name>Test = and {
  assert(<test your spell>),
  assert(<test your spell again>)
}
```

Note that we are using two underscores in front of parameter names,
in order to prevent these names from clashing with state variables.
In the future, we will introduce a better mechanism for avoiding name
clashes.

To see concrete examples, visit [rareSpells.qnt](./rareSpells.qnt).

If your contribution is too specific too one concrete example, we may
reject the pull request. In any case, let us see the great spells you
have invented!