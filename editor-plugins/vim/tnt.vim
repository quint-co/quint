" Vim syntax file
" Language: TNT
" Maintainer: Igor Konnov
" Latest Revision: 29 October 2021
"
" How to install:
" 1. Copy this file to ~/.vim/syntax/
" 2a. Either manually set syntax with :set syntax=tnt
" 2b. Or add the following in your ~/.vimrc
"    augroup syntax
"    au! BufNewFile,BufReadPost *.tnt
"    au  BufNewFile,BufReadPost *.tnt so ~/vim/syntax/tnt.vim
"    augroup END

if exists("b:current_syntax")
  finish
endif

let b:current_syntax = "tnt"

" clear the old stuff
syn clear

" comments
syn match tntComment "//.*$"
syn region tntComment start="/\*" end="\*/" fold

" identifiers
syn match tntIdent "[a-zA-Z_][a-zA-Z0-9_]*"

" numbers and strings
syn match tntNumber '-\?\d\+'
syn region tntString start='"' end='"'

" types
syn keyword tntType int str bool set seq

" typedefs
syn keyword tntTypedef type

" built-in values
syn keyword tntValue Bool Int Nat 
syn keyword tntBoolValue false true

" conditionals
syn keyword tntCond if else match

" declarations
syn keyword tntDecl module import const var def val pred action temporal assume

" standard operators
syn keyword tntStd not and or iff implies
syn keyword tntStd exists guess forall in notin union
syn match   tntStd "contains"   " use match, as 'contains' is a vim option
syn match   tntStd "fold"       " use match, as 'fold' is a vim option
syn keyword tntStd intersect exclude subseteq map filter
syn keyword tntStd powerset flatten seqs choose_some
syn keyword tntStd isFinite cardinality get put keys mapOf setOfMaps
syn keyword tntStd update updateAs fields with cross append concat
syn keyword tntStd head tail length nth indices replaceAt slice
syn keyword tntStd select foldl foldr to
syn keyword tntStd always eventually next stutter nostutter
syn keyword tntStd enabled weakFair strongFair guarantees
syn keyword tntStd exists_const forall_const choose_const

" curly braces
syn region tntBlock start="{" end="}" fold transparent contains=ALLBUT,tntCurlyError
syn match tntCurlyError     "}"

" parentheses
syn region tntParen start="(" end=")" fold transparent contains=ALLBUT,tntParenError
syn match tntParenError     ")"

" braces
syn region tntBrace start="\[" end="\]" fold transparent contains=ALLBUT,tntBraceError
syn match tntBraceError     "\]"

" operators
syn keyword tntOper "^" "-" "+" "*" "/" "%" "." " "<-" "<" ">" "<=" ">="
syn keyword tntOper "==" "!=" "=>" "->"

" delimiters
syn match tntDelim "," ":" "|" "&"


" highlighting instructions
hi def link tntComment     Comment
hi def link tntIdent       Identifier
hi def link tntType        Type
hi def link tntTypedef     Typedef
hi def link tntString      String
hi def link tntNumber      Number
hi def link tntBoolValue   Boolean
hi def link tntValue       Constant
hi def link tntDecl        StorageClass
hi def link tntStd         Statement
hi def link tntOper        Operator
hi def link tntCond        Conditional
hi def link tntParenError  Error
hi def link tntBraceError  Error
hi def link tntBlockError  Error

