if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('turtle.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = TURTLE.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */

suite("PARSER TESTS", function() {
    test('parse x:=EXPR', function() {
        assert.deepEqual(parse('x:=EXPR;'),
                         { tag:":=", left:"x", right:"EXPR" },
                         'parse x:=EXPR');
    });
    test('parse var x;', function() {
        assert.deepEqual(parse('var x;'),
                         { tag:"var", name:"x" },
                         'parse var x;');
    });
    test('parse if(EXPR){x:=EXPR;}', function() {
        assert.deepEqual(parse('if(EXPR){x:=EXPR;}'),
                         { tag:"if", expr:"EXPR", body: [
                             { tag:":=", left:"x", right:"EXPR" } ] },
                         'parse if(EXPR){x:=EXPR;}');
    });
    test('parse repeat(EXPR){x:=EXPR;}', function() {
        assert.deepEqual(parse('repeat(EXPR){x:=EXPR;}'),
                         { tag:"repeat", expr:"EXPR", body: [
                             { tag:":=", left:"x", right:"EXPR" } ] },
                         'parse repeat(EXPR){x:=EXPR;}');
    });
});
