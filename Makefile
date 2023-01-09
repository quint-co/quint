##
# Quint
#
# @file
# @version 0.1

.PHONY: vscode quint local all

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

# end
