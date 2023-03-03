##
# Quint documentation
#
# @file
# @version 0.1

.PHONY: adrs

DEPS=./generated/adr006before.qnt

# Compile all Quint ADRs
adrs: $(DEPS)
	@echo "Updated all ADRs"

./generated/adr006before.qnt: adr006-modules.lit.md
	lmt $^

%.qnt: %.template.qnt
	./script/mk-tutorial.py $^ $*
	# move the generated tour to the CodeTour's hidden directory
	mv $*.tour .tours

# end
