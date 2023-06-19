# Scripts and assets for generating [../README.md](../README.md)

The scripts and assets in this directory are used to generate the
[../README.md](../README.md) file. This filer is generated so that  the
"dashboard" provided in that table as a markdown file will be automatically
generated. 

Generation of the dashboard ensures that:

- Every newly added example gets listed.
- The status of any new example is kept up to date with the current code.

## Directory Contents

- [./README-text.md](./README-text.md): This is the human written content of the
  README file. Update this to add new information or extend the explanation.

- [./run-example.sh](./run-example.sh): A script to run the checked subcommands
  in a single spec file. It outputs a single table row of the dashboard.

- [./run-examples.sh](./run-examples.sh): A script to run all examples in
  parallel and sort their outputs. It us used in our [../Makefile](../Makefile)
  and our CI.
