;;; quint-mode.el --- Major mode for editing Quint

;; Author: Gabriela Moreira (gabriela@informal.systems)
;; URL: https://github.com/informalsystems/quint
;; Version: 1.0.0
;; Created: 25 Feb 2022
;; Updated 03 Feb 2023
;; Keywords: languages

;; This file is not part of GNU Emacs.

;;; License:

;; Apache License 2.0

;;; Commentary:

;; A major mode with basic syntax highlighting for Quint files.
;; See language specification at https://github.com/informalsystems/quint/blob/main/doc/lang.md

;;; Code:

;; define several category of keywords
(defconst quint-types '("int" "str" "bool" "Set" "List"))
(defconst quint-keywords '("Rec" "Tup" "not" "and" "or" "iff" "implies" "all" "any" "if" "else"))
(defconst quint-declarations '("module" "import" "from" "export" "as" "const" "var" "def" "val" "pure"
                             "nondet" "action" "temporal" "assume" "type"))
(defconst quint-constants '("Bool" "Int" "Nat" "false" "true"))

(defconst quint-declarations-font-locks (mapcar (lambda (arg) (cons (format "\\<%s\\>" arg) font-lock-builtin-face)) quint-declarations))
(defconst quint-types-font-locks (mapcar (lambda (arg) (cons (format "\\_<%s\\_>" arg) font-lock-type-face)) quint-types))
(defconst quint-constants-font-locks (mapcar (lambda (arg) (cons (format "\\_<%s\\_>" arg) font-lock-constant-face)) quint-constants))

;;;###autoload
(define-generic-mode 'quint-mode
  ;; Comment Syntax
  '("//" ("/*" . "*/"))
  ;; Keywords
  quint-keywords
  ;; Operators and Other Syntax
  (append quint-declarations-font-locks quint-types-font-locks quint-constants-font-locks)
  ;; Files
  '("\\.qnt$")
  ;; Other Functions
  nil
  ;; Docstring
  "Major mode for the Quint specification languaage.
`https://github.com/informalsystems/quint'")

;; add the mode to the `features' list
(provide 'quint-mode)

;; Local Variables:
;; coding: utf-8
;; End:

;;; quint-mode.el ends here
