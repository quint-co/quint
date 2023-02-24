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
			lesson3-anatomy/coin.qnt
	@echo "Updated all tutorials"

%.qnt: %.template.qnt
	./script/mk-tutorial.py $^ $*
	# move the generated tour to the CodeTour's hidden directory
	mv $*.tour .tours

# end
