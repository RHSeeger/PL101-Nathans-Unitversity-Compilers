

all: parser.js test

parser.js: turtle.peg
	../node_modules/.bin/pegjs -e TURTLE turtle.peg parser.js
test:
	../node_modules/.bin/mocha -u tdd -R list

.PHONY:	test
