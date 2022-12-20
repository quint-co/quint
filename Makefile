##
# TNT
#
# @file
# @version 0.1

.PHONY: vscode tntc all

all: vscode

# Build tntc and install it to local packages
tntc:
	cd tntc; npm install; npm run compile; npm link; yalc publish

# Build tntc and install it to local packages
vscode: tntc
	cd vscode/tnt/server; yalc add tntc
	cd vscode/tnt; npm install; npm run compile

# end
