# ADR002: Structure of error messages and warnings

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 3        | 13.11.2021 | Igor Konnov      |

All error messages in the transpiler and the VScode plugin have the following structure:

```js
{
  "explanation": "QNTnnn: text of the error message",
  "source": "/path/to/file.qnt",
  "start": {
    "line": number,
    "col": number
  },
  "end": {
    "line": number,
    "col": number
  },
  // additional fields
}
```

The meaning of the fields is as follows:

 - `explanation` is an explanation of an error.
 - `source` is a text representation of an input, e.g., filename.
 - `start` is the starting position of the text that caused the error.
 - `end` is the position of the first character after the text that caused
    the error.

Note that `nnn` is the error code, which should be from the list of error code
(see below). Following the conventions of LSP, the values of lines and columns
(`line` and `col`) start with 0, instead of 1.

## List of error codes

In the following list, we are collecting the error codes that Quint tools should
use to report their errors. By having the error codes, we should be able to
write an error explanation tool.

 - QNT001: expected 'const', 'var', 'def', 'type', etc.
 - QNT002: missing ': type' after 'var' or 'const'
 - QNT003: expected an expression
 - QNT004: unexpected symbol after expression
 - QNT005: keywords are not allowed as record fields in record.field
 - QNT006: unexpected '=', did you mean '=='?
 - QNT007: type names must start with an uppercase letter
 - QNT404: module <name> not found
 - QNT405: name <name> not found
 - QNT406: instantiation error
