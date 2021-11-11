# ADR002: Structure of error messages and warnings

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 2        | 10.11.2021 | Igor Konnov      |

All error messages in the transpiler and the VScode plugin have the following structure:

```js
{
  "explanation": "TNTnnn: text of the error message",
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

Note that `nnn` is the error code, which should be from the list of error code
(see below).

## List of error codes

In the following list, we are collecting the error codes that TNT tools should
use to report their errors. By having the error codes, we should be able to
write an error explanation tool.

 - TNT001: expected 'const', 'var', 'def', 'type', etc.
 - TNT002: missing ': type' after 'var' or 'const'
 - TNT404: module <name> not found
 - TNT405: name <name> not found
 - TNT406: instantiation error

