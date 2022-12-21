##
# Quint
#
# @file
# @version 0.1

.PHONY: vscode quintc all

all: vscode

# Build quintc and install it to local packages
quintc:
	cd quintc; npm install; npm run compile; npm link; yalc publish

# Build quintc and install it to local packages
vscode: quintc
	cd vscode/quint/server; yalc add quintc
	cd vscode/quint; npm install; npm run compile

# end
