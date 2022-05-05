;;; tnt-mode.el --- Major mode for editing TNT

;; Author: Gabriela Moreira (gabriela@informal.systems)
;; URL: https://github.com/informalsystems/tnt
;; Version: 1.0.0
;; Created: 25 Feb 2022
;; Keywords: languages

;; This file is not part of GNU Emacs.

;;; License:

;; Apache License 2.0

;;; Commentary:

;; A major mode with basic syntax highlighting for TNT files.
;; See language specification at https://github.com/informalsystems/tnt/blob/main/doc/lang.md

;;; Code:

;; define several category of keywords
(defconst tnt-types '("int" "str" "bool" "set" "seq"))
(defconst tnt-keywords '("not" "and" "or" "iff" "implies" "exists" "guess" "forall" "in" "notin"
      "union" "contains" "fold" "intersect" "exclude" "subseteq" "map" "applyTo" "filter"
      "powerset" "flatten" "seqs" "choose_some" "isFinite" "cardinality" "get" "put" "keys"
      "mapOf" "setOfMaps" "update" "updateAs" "fields" "with" "tuples" "append" "concat" "head"
      "tail" "length" "nth" "indices" "replaceAt" "slice" "select" "foldl" "foldr" "to" "always"
      "eventually" "next" "stutter" "nostutter" "enabled" "weakFair" "strongFair" "guarantees"
      "exists_const" "forall_const" "choose_const" "if" "else" "match"))
(defconst tnt-declarations '("module" "import" "const" "var" "def" "val" "pred" "action" "temporal" "assume" "type"))
(defconst tnt-constants '("Bool" "Int" "Nat" "false" "true"))

(defconst tnt-declarations-font-locks (mapcar (lambda (arg) (cons (format "\\<%s\\>" arg) font-lock-builtin-face)) tnt-declarations))
(defconst tnt-types-font-locks (mapcar (lambda (arg) (cons (format "\\_<%s\\_>" arg) font-lock-type-face)) tnt-types))
(defconst tnt-constants-font-locks (mapcar (lambda (arg) (cons (format "\\_<%s\\_>" arg) font-lock-constant-face)) tnt-constants))

;;;###autoload
(define-generic-mode 'tnt-mode
  ;; Comment Syntax
  '("//" ("/*" . "*/"))
  ;; Keywords
  tnt-keywords
  ;; Operators and Other Syntax
  (append tnt-declarations-font-locks tnt-types-font-locks tnt-constants-font-locks)
  ;; Files
  '("\\.tnt$")
  ;; Other Functions
  nil
  ;; Docstring
  "Major mode for the TNT specification languaage.
`https://github.com/informalsystems/tnt'")

;; add the mode to the `features' list
(provide 'tnt-mode)

;; Local Variables:
;; coding: utf-8
;; End:

;;; tnt-mode.el ends here
