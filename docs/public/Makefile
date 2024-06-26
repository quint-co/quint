# Compile all graphics dependencies

all: *.svg

%.svg: %.mer
	# if mmdc is not found, run: brew install mermaid-cli
	mmdc -i $< -o $@
