##
# Quint
#
# @file
# @version 0.1

.PHONY: vscode quint all

all: vscode

# Build quint and install it to local packages
quint:
	cd quint; npm install; npm run compile; npm link; yalc publish

# Build quint and install it to local packages
vscode: quint
	cd vscode/quint/server; yalc add quint
	cd vscode/quint; npm install; npm run compile

# end
