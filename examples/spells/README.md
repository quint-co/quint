This directory contains Quint spells. These are operator definitions that are
useful for writing Quint specifications. The spells are organized in three
categories:

 - [basic spells](./basicSpells.qnt) are the most commonly used definitions.
   If you are writing a specification, most likely, you will need one of them.

 - [common spells](./commonSpells.qnt) are the definitions that appear in many
   specifications, but they are more specific. Not everybody would need them.

 - [rare spells](./rareSpells.qnt) are the new definitions that are nice and
   simplify specification writing. They still need a proof of time. At some
   point, they may get promoted to the common spells or the basic spells.
   Consider [contributing your spell](./contribute-your-spell.md).

## How to use the spells?

At some point in the future, we will distribute the spells with the language
tools. For the moment, you can do one of the following:

 - Just pick the spell you like and copy it in your spec.
   Be nice to the spell contributors by writing a comment that the spell has
   been copied from the basic spells, common spells, or rare spells.

 - Copy the spell file into the directory, where your specification is located
   and use e.g.:
   
   ```
   import basicSpells.* from "./basicSpells"
   ```