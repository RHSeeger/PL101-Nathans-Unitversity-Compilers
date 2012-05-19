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

suite("PARSER TESTS>", function() {
    suite("Internal Nodes>", function() {
        test('numbers direct', function() {
            assert.deepEqual(parse('42', 'number'), 42);
            assert.deepEqual(parse('-101', 'number'), -101);
            assert.deepEqual(parse('-101.25', 'number'), -101.25);
        });
        
        test('identifiers', function() {
            assert.deepEqual(parse('x', 'identifier'), 'x');
            assert.deepEqual(parse('forward', 'identifier'), 'forward');
        });
        test('statement', function() {
            assert.deepEqual(parse('x:=2;', 'statement'),
                             { tag:":=", left:"x", right:2 });
        });

        test('if', function() {
            assert.deepEqual(parse('if(x){y:=1;}', 'statement'), {
                tag:"if", 
                expr:{tag:'ident', name:"x"}, 
                body:[ { tag:":=", left:"y", right:1 } ]  
            });
        });
        test('define', function() {
            assert.deepEqual(parse("define foo(x, y) {\n}", 'statements'), [
                {
                    "tag": "define",
                    "name": "foo",
                    "args": [ "x", "y" ],
                    "body": []
                }
            ]);
        });
    });

    suite("Top Level>", function() {
        test('assignment', function() {
            assert.deepEqual(parse('x:=3;'), [{ tag:":=", left:"x", right:3 }]);
            assert.deepEqual(parse('x := 3;'), [{ tag:":=", left:"x", right:3 }]);
        });

        test('declare variable', function() {
            assert.deepEqual(parse('var x;'), [{ tag:"var", name:"x" }], 'parse var x;');
            assert.deepEqual(parse('var x; '), [{ tag:"var", name:"x" }], 'parse var x;');
            var res =
                [ {
                        "tag": "var",
                        "name": "x"
                    },
                    {
                        "tag": ":=",
                        "left": "x",
                        "right": 3
                    }
                ];
            assert.deepEqual(parse("var x;x:=3;"), res);
            assert.deepEqual(parse("var x; x := 3;"), res);

        });
        test('if', function() {
            assert.deepEqual(parse('if(x){x:=3;}'),[
                {
                    tag:"if", 
                    expr:{tag:'ident', name:"x"}, 
                    body:[ { tag:":=", left:"x", right:3 } ]  
                }
            ]);
        });
        test('repeat', function() {
            assert.deepEqual(parse('repeat(5){x:=2;}'),[
                { 
                    tag:"repeat", 
                    expr:5, 
                    body: [
                        { tag:":=", left:"x", right:2 } 
                    ]
                }]);
        });
        test('function call', function() {
            assert.deepEqual(parse('myfunction(1,2);'),[{
                tag:'ignore',
                body: {
                    tag:"call", 
                    name:"myfunction", 
                    args:[1,2]
                }
            }]);
        });
        test('multiple statements', function() {
            assert.deepEqual(parse('var x; x:= y;'), [
                { tag:"var", name:"x" },
                { tag:":=", left:"x", right: {tag:'ident', name:'y'} }
            ], 'parse var x;');
        });
        test('multiple expressions', function() {
            assert.deepEqual(parse('2 + 3; x * 5;'), [ 
                { tag: 'ignore', body: { tag: '+', left: 2, right: 3 } },
                { tag: 'ignore', body: { 
                    tag: '*', 
                    left: {tag:'ident', name:'x'}, 
                    right: 5 
                } } 
            ] , 'parse var x;');
        });
        test('expression + statements', function() {
            assert.deepEqual(parse('var x; x:= 2 + 5;'), [
                { tag: 'var', name: 'x' },
                { tag: ':=', left: 'x', right: { tag: '+', left: 2, right: 5 } } 
            ], 'parse var x;');
        });
    });
});

