##
# Quint in Lean, through Veil.
#
#   make -C lean build         the Quint library (Lake fetches Veil and its toolchain on first run)
#   make -C lean test          run the model checker, the SMT backend and the proof tests
#   make -C lean lint          build the library, which reports Lean's lints
#                              lint-check is the same, and format has nothing to do
#   make -C lean clean         drop .lake/
#
# Needs `elan` on PATH (`nix develop .#lean` has it); it installs the Lean of lean-toolchain on the
# first `lake` run. The tests compile their specs with the `quint` of QUINT_BIN, which is the one
# that `quint/` builds unless QUINT_BIN is set.

LEAN := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
ROOT := $(patsubst %/,%,$(dir $(LEAN)))

export QUINT_BIN ?= $(ROOT)/quint/dist/src/cli.js

.DEFAULT_GOAL := test

.PHONY: build test lint lint-check format clean quint-dist

# The compiled `quint` carries a copy of the library's sources, which `quint verify --backend veil`
# loads, so it is built again when they change too.
quint-dist: $(ROOT)/quint/dist/src/cli.js

$(ROOT)/quint/dist/src/cli.js: $(shell find $(ROOT)/quint/src -name '*.ts' -o -name '*.qnt') $(LEAN)/Quint.lean $(wildcard $(LEAN)/Quint/*.lean) $(addprefix $(LEAN)/,lakefile.lean lake-manifest.json lean-toolchain)
	cd $(ROOT)/quint && npm run compile
	chmod +x $@

build:
	cd $(LEAN) && lake build Quint

# Lake doesn't track the Quint specs read at elaboration time or the external QUINT_BIN.
# Rerun the small test suite every time, without invalidating the library or its dependencies.
# Use `lake build` because `lake env lean` cannot load cvc5's native library.
test: quint-dist
	rm -f $(LEAN)/.lake/build/lib/lean/Tests/*.olean
	cd $(LEAN) && lake build Quint Tests

# Lean's formatter and linter are the elaborator's own: `lake build` reports both.
format:
	@:

lint lint-check: build

clean:
	rm -rf $(LEAN)/.lake
