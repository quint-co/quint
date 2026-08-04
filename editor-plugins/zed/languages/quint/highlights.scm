; Based on gruhn/tree-sitter-quint's queries/highlights.scm, re-mapped
; from Helix capture names to Zed's, with declaration keywords moved
; from @property to @keyword and import/export keywords enabled.

[
  "module"
  "import"
  "from"
  "export"
  "as"
  "if"
  "else"
  "or"
  "and"
  "implies"
  "iff"
  "all"
  "any"
] @keyword

[
  "type"
  "assume"
  "const"
  "var"
  "val"
  "nondet"
  "def"
  "pure"
  "action"
  "temporal"
  "run"
] @keyword

(match_expr "match" @keyword)

[
  "true"
  "false"
  "Int"
  "Nat"
  "Bool"
] @constant.builtin

; The grammar doesn't tokenize built-in type/collection names as
; distinct terminals -- they parse as plain identifiers -- so match
; them lexically, mirroring the other Quint editor plugins.
((identifier) @type
  (#any-of? @type "int" "str" "bool" "Set" "List" "Map" "Tup" "Rec"))

(type) @type
(int_literal) @number
(comment) @comment
(string) @string

[
  ";"
  "."
  ","
  ":"
  "::"
] @punctuation.delimiter

[
  "-"
  "+"
  "*"
  "/"
  "%"
  "<"
  "<="
  "="
  "=="
  "!="
  "=>"
  ">"
  ">="
  "^"
  "->"
  "'"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(operator_application
  operator: (qualified_identifier) @function)

; An operator definition is a function if it has an argument list ...
(operator_definition
  name: (qualified_identifier) @function
  arguments: (typed_argument_list))
