# TNT Parser

This directory contains a parser for TNT. For the moment, it
is only a syntax parser, no semantic actions or a type checker are implemented.
Also, the parser does not parse other files that are imported via `extends` or
`instance` (TBD). However, this is a complete prototype for trying and
experimenting with the language syntax.

For the moment, we have put the parser package in `server/src/parser`, to avoid
back and forth with publishing npm packages. However, we keep the parser interfaces
as isolated as possible, so it should be easy to extract the parser into an independent
package later.