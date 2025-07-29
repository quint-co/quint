##
# Quint Codetour and markdown tutorials
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

%.qnt: %.template.qnt
	./script/mk-tutorial.py $^ $*
	# move the generated tour to the CodeTour's hidden directory
	mv $*.tour .tours
	cp -r img .tours/
	# move the generated markdown files to the website directory
	mv $*.md ../content/docs/lessons/
	cp -r img ../public/lessons/
	# move the generated quint files to the examples directory
	cp $*.qnt ../../examples/tutorials/

# end
