##
# Quint
#
# @file
# @version 0.1

.PHONY: vscode quint local tutorials docs all apalache examples ./examples/README.md

all: vscode

# Build quint locally and make the executable `quint` available in shell
quint:
	cd quint; npm install; npm run compile; npm link;

# Build the vscode plugin by pulling quint as a dependency from npm
# (not the sources!)
vscode: quint
	cd vscode/quint-vscode; npm install; npm run compile
	@echo ""
	@echo "To install the compiled extension in VSCode, run this once:"
	@echo "ln -s $(PWD)/vscode/quint-vscode/ $(HOME)/.vscode/extensions/informal.quint-vscode"

# Build quint and vscode from the sources without publishing them with npm
local: quint
	cd quint; yalc publish
	cd vscode/quint-vscode/server; npm uninstall @informalsystems/quint; yalc add @informalsystems/quint
	cd vscode/quint-vscode; npm install; npm run compile
	@echo ""
	@echo "To install the compiled extension in VSCode, run this once:"
	@echo "ln -s $(PWD)/vscode/quint-vscode/ $(HOME)/.vscode/extensions/informal.quint-vscode"

# Generate the tutorials
tutorials:
	$(MAKE) -C tutorials

# Generate the docs
docs:
	$(MAKE) -C doc

BUILD_DIR := quint/_build
quint/_build:
	mkdir $@

# Download the latest Apalache for quint integration tests
apalache: | $(BUILD_DIR)
	# remove the previously downloaded archive in case it exists (required by gh)
	rm -f $(BUILD_DIR)/apalache.tgz
	gh release download --repo apalache-mc/apalache --pattern apalache.tgz --dir $(BUILD_DIR)
	tar -xvzf $(BUILD_DIR)/apalache.tgz --directory $(BUILD_DIR) > /dev/null

# Alias to update examples readme
examples: ./examples/README.md

EX_SCRIPTS:=./examples/.scripts
# The scripts for updating the ./examples/README.md and all the quint files needed
EXAMPLES_DEPS:=$(EX_SCRIPTS)/run-example.sh $(EX_SCRIPTS)/run-examples.sh $(shell find examples/ -type f -name "*.qnt")

./examples/README.md: $(EX_SCRIPTS)/README-text.md $(EXAMPLES_DEPS)
    # Add a header
	echo "<!-- DO NOT EDIT: THIS FILE IS GENERATED FROM $< VIA 'make examples' -->" > $@
    # Append the human written README.md.txt
	cat $< >> $@
    # Generate the dashboard and append it
	$(EX_SCRIPTS)/run-examples.sh >> $@

# end
