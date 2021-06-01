# TNT Parser

This directory contains a parser for TNT (no types yet!).  For the moment, it
is only a syntax parser, no semantic actions or a type checker are implemented.
Also, the parser does not parse other files that are imported via `extends` or
`instance` (TBD). However, this is a complete prototype for trying and
experimenting with the language syntax.

## How to build

```sh
mvn package
```

If the maven build is successful, you should be able to find the following file:

```sh
./target/tnt-parser-0.0.1-SNAPSHOT-complete.jar
```

## How to run

```sh
java -jar ./target/tnt-parser-0.0.1-SNAPSHOT-complete.jar <filename>.tnt
```

