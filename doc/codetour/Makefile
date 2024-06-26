##
# Quint tutorials
#
# @file
# @version 0.1

.PHONY: tutorials

# Compile all Quint tutorials
tutorials: lesson0-helloworld/hello.qnt \
			lesson1-booleans/booleans.qnt \
			lesson2-integers/integers.qnt \
			lesson3-anatomy/coin.qnt \
			lesson4-sets/sets.qnt
	@echo "Updated all tutorials"

./repl/kettle.qnt: ./repl/repl.md
	lmt $^
	cat ./repl/replTest.txt |\
		egrep '^(>>>|\.\.\.) ' | sed 's/^>>> //g' | sed 's/^\.\.\. //g' \
		>./repl/replTestIn.txt
	cat ./repl/replTest.txt |\
		egrep -v '^(>>>|\.\.\.) ' >./repl/replTestOut.txt

%.qnt: %.template.qnt
	./script/mk-tutorial.py $^ $*
	# move the generated tour to the CodeTour's hidden directory
	mv $*.tour .tours
	cp -r img .tours/
	# move the generated markdown files to the website directory
	mv $*.md ../pages/docs/tutorials/
	cp -r img ../pages/docs/tutorials/

# end
