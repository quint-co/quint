" Vim syntax file
" Language: Quint
" Maintainer: Igor Konnov, Informal Systems, igor at informal.systems
" Latest Revision: 03 February 2023
"
" How to install:
" 1. Copy this file to ~/.vim/syntax/ (vim) or to ~/.config/nvim/syntax (neovim).
" 2a. Either manually set syntax with :set syntax=quint
" 2b. Or add the following in your ~/.vimrc
"    au  BufNewFile,BufReadPost *.qnt runtime syntax/quint.vim
" 2c. Use modelines, which should be enabled Vim (they are disabled
"     by default in Mac OS), by adding at end of the Quint file:
"    // vim: syntax=quint

if exists("b:current_syntax")
  finish
endif

let b:current_syntax = "quint"

" clear the old stuff
syn clear

" comments
syn match quintComment "//.*$"
syn region quintComment start="/\*" end="\*/" fold

" identifiers
syn match quintIdent "[a-zA-Z_][a-zA-Z0-9_]*"

" numbers and strings
syn match quintNumber '-\?\(0x[0-9a-fA-F]\([0-9a-fA-F]\|_[0-9a-fA-F]\)*\|0\|[1-9]\([0-9]\|_[0-9]\)*\)'
syn region quintString start='"' end='"'

" types
syn keyword quintType int str bool Set List Rec Tup

" typedefs
syn keyword quintTypedef type

" built-in values
syn keyword quintValue Bool Int Nat
syn keyword quintBoolValue false true

" conditionals
syn keyword quintCond if else

" declarations
syn keyword quintDecl module import from export const var val def pure nondet action temporal assume run

" standard operators
syn keyword quintStd Set List Map Rec Tup
syn keyword quintStd not and or iff implies all any as

" curly braces
syn region quintBlock start="{" end="}" fold transparent contains=ALLBUT,quintCurlyError
syn match quintCurlyError     "}"

" parentheses
syn region quintParen start="(" end=")" fold transparent contains=ALLBUT,quintParenError
syn match quintParenError     ")"

" braces
syn region quintBrace start="\[" end="\]" fold transparent contains=ALLBUT,quintBraceError
syn match quintBraceError     "\]"

" operators
syn keyword quintOper "^" "-" "+" "*" "/" "%" "." " "<-" "<" ">" "<=" ">="
syn keyword quintOper "==" "!=" "=>" "->"

" delimiters
syn match quintDelim "," ":" ";"


" highlighting instructions
hi def link quintComment     Comment
hi def link quintIdent       Identifier
hi def link quintType        Type
hi def link quintTypedef     Typedef
hi def link quintString      String
hi def link quintNumber      Number
hi def link quintBoolValue   Boolean
hi def link quintValue       Constant
hi def link quintDecl        StorageClass
hi def link quintStd         Statement
hi def link quintOper        Operator
hi def link quintCond        Conditional
hi def link quintParenError  Error
hi def link quintBraceError  Error
hi def link quintBlockError  Error
