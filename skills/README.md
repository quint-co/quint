# Quint Claude Code skills

This folder contains [Claude Code](https://code.claude.com) skills that help Claude write and reason about Quint specifications: a language reference and a modeling guide for authoring `.qnt` specifications.

## Install as a plugin (recommended)

No need to clone the repository. In Claude Code, register the Quint repo as a plugin marketplace and install the plugin:

```
/plugin marketplace add quint-co/quint
/plugin install quint@quint
```

This installs both skills. Once installed, the skills load automatically when you ask Claude something relevant.

Alternatively, you can install the skills manually by copying the skill folders in this directory into your home directory (`~/.claude/skills/`) or into a specific project (`.claude/skills/`).

Skills can run code, so review them before installing, as you would any tooling.