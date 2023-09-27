# Vim support

This guide will help you set up Vim for Quint, including syntax highlighting and an integrated language server. Follow these easy steps for a smooth configuration.

## Syntax Highlighting

1. If you are using vim, copy the [quint.vim] file to `~/.vim/syntax/`.
1. If you are using neovim, copy the [quint.vim] file to `~/.config/nvim/syntax`.
2. Choose one of the following options to enable syntax highlighting for Quint:

   - **Option A (Manual):** Open a Quint file in Vim and manually set the syntax with `:set syntax=quint`.

   - **Option B (Automatic):** Add the following line to your `~/.vimrc` file:

     ```vim
     au BufNewFile,BufReadPost *.qnt runtime syntax/quint.vim
     ```

   - **Option C (Modelines):** Make sure you have modelines enabled and add the following line to the end of your Quint file:

     ```bluespec
     // vim: syntax=quint
     ```

## Language Server (Neovim only)

1. Install the [quint-language-server][] globally using npm:

```sh
npm i @informalsystems/quint-language-server -g
```

2. Enable language server integration by adding the following lines to your `~/.config/nvim/init.vim`:

```vim-script
autocmd FileType quint lua vim.lsp.start({name = 'quint', cmd = {'quint-language-server', '--stdio'}, root_dir = vim.fs.dirname()})
au BufRead,BufNewFile *.qnt  setfiletype quint
```

[quint.vim]: (./quint.vim)
[quint-language-server]: (https://www.npmjs.com/package/@informalsystems/quint-language-server)
