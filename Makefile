##
# Quint
#
# @file
# @version 0.1

.PHONY: vscode quint local all

all: vscode

# Build quint and install it to local packages
quint:
	cd quint; npm install; npm run compile; npm link;

# Build quint and install it to local packages
vscode: quint
	cd vscode/quint-vscode; npm install; npm run compile

local: quint
	cd quint; yalc publish
	cd vscode/quint-vscode/server; npm uninstall @informalsystems/quint; yalc add @informalsystems/quint
	cd vscode/quint-vscode; npm install; npm run compile

# end
