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

## Language Server

1. Install the [quint-language-server][] globally using npm:

```sh
npm i @informalsystems/quint-language-server -g
```

### Neovim

2. Enable language server integration by adding the following lines to your `~/.config/nvim/init.vim`:

```vim-script
autocmd FileType quint lua vim.lsp.start({name = 'quint', cmd = {'quint-language-server', '--stdio'}, root_dir = vim.fs.dirname()})
au BufRead,BufNewFile *.qnt  setfiletype quint
```

### Vim

This requires vim built with Lua support (check with `vim --version`).

2. Install [`prabirshrestha/vim-lsp`](https://github.com/prabirshrestha/vim-lsp) (e.g., via vim-plug):

```vim-script
Plug 'prabirshrestha/vim-lsp'
```

3. Enable LSP for Quint

```vim-script
au BufRead,BufNewFile *.qnt setfiletype quint

if executable('quint-language-server')
  au User lsp_setup call lsp#register_server({
    \ 'name': 'quint',
    \ 'cmd': {server_info->['quint-language-server', '--stdio']},
    \ 'allowlist': ['quint'],
    \ })
endif

function! s:on_lsp_buffer_enabled() abort
  setlocal omnifunc=lsp#complete
  setlocal signcolumn=yes
  if exists('+tagfunc') | setlocal tagfunc=lsp#tagfunc | endif
  nmap <buffer> gd <plug>(lsp-definition)
  nmap <buffer> gs <plug>(lsp-document-symbol-search)
  nmap <buffer> gS <plug>(lsp-workspace-symbol-search)
  nmap <buffer> gr <plug>(lsp-references)
  nmap <buffer> gi <plug>(lsp-implementation)
  nmap <buffer> gt <plug>(lsp-type-definition)
  nmap <buffer> <leader>rn <plug>(lsp-rename)
  nmap <buffer> [g <plug>(lsp-previous-diagnostic)
  nmap <buffer> ]g <plug>(lsp-next-diagnostic)
  nmap <buffer> K <plug>(lsp-hover)
  nnoremap <buffer> <expr><c-f> lsp#scroll(+4)
  nnoremap <buffer> <expr><c-d> lsp#scroll(-4)
endfunction

augroup lsp_install
  au!
  autocmd User lsp_buffer_enabled call s:on_lsp_buffer_enabled()
augroup END
```

[quint.vim]: ./quint.vim
[quint-language-server]: https://www.npmjs.com/package/@informalsystems/quint-language-server
