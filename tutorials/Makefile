##
# Quint tutorials
#
# @file
# @version 0.1

.PHONY: tutorials

# Compile all Quint tutorials
tutorials: lesson2-integers/integers.qnt lesson0-helloworld/hello.qnt
	@echo "Updated all tutorials"

%.qnt: %.template.qnt
	./script/mk-tutorial.py $^ $*
	# move the generated tour to the CodeTour's hidden directory
	mv $*.tour .tours

# end
