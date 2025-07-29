##
# Quint REPL tutorials
#
# @file
# @version 0.1

./repl/kettle.qnt: ../../../docs/content/docs/repl.md
	lmt $^
	cat replTest.txt |\
		egrep '^(>>>|\.\.\.) ' | sed 's/^>>> //g' | sed 's/^\.\.\. //g' \
		>replTestIn.txt
	cat replTest.txt |\
		egrep -v '^(>>>|\.\.\.) ' >replTestOut.txt

# end
