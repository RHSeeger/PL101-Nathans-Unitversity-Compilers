

all: parser.js test

parser.js: scheem.peg
	../node_modules/.bin/pegjs -e SCHEEM scheem.peg parser.js
test:
	../node_modules/.bin/mocha -u tdd -R list

.PHONY:	test
