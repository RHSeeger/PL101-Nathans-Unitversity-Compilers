if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var scheem = require('../scheem');
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

var seval = function (code) { return scheem.evalScheem(parse(code), {}); }
/*
 * TESTS
 */

suite('+', function() {
    test('no args', function() {
        assert.deepEqual(seval('(+)'), 0);
    });
    test('one arg', function() {
        assert.deepEqual(seval('(+ 1)'), 1);
    });
    test('two arg', function() {
        assert.deepEqual(seval("(+ 2 4)"), 6);
    });
    test('more arg', function() {
        assert.deepEqual(seval("(+ 1 2 3 4)"), 10);
    });
});

suite('-', function() {
    test('no args', function() {
        expect(function () {
            seval("(-)")
        }).to.throw('/incorrect number of arguments/');
    });
    test('one arg', function() {
        assert.deepEqual(seval("(- 1)"), -1);
    });
    test('two arg', function() {
        assert.deepEqual(seval("(- 4 2)"), 2);
    });
    test('more arg', function() {
        assert.deepEqual(seval("(- 1 2 3 4)"), -8);
    });
});

suite('*', function() {
    test('no args', function() {
        assert.deepEqual(seval("(*)"), 1);
    });
    test('one arg', function() {
        assert.deepEqual(seval("(* 10)"), 10);
    });
    test('two arg', function() {
        assert.deepEqual(seval("(* 2 4)"), 8);
    });
    test('more arg', function() {
        assert.deepEqual(seval("(* 1 2 3 4)"), 24);
    });
});

suite('/', function() {
    test('no args', function() {
        assert.deepEqual(seval("(\/)"), 1);
    });
    test('one arg', function() {
        assert.deepEqual(seval("(\/ 2)"), 1/2); // not sure why I need to escape / here
    });
    test('two arg', function() {
        assert.deepEqual(seval("(/ 4 2)"), 2);
    });
    test('more arg', function() {
        assert.deepEqual(seval("(/ 24 4 3 1)"), 2);
    });
});

suite("let-one", function() {
    test('Variable reference in environment', function() {
        assert.deepEqual(seval("(let-one x 2 x)"), 2);
    });
    test('let-one with computed value', function() {
        assert.deepEqual(seval("(let-one x (+ 2 2) x)"), 4);
    });
    test('Variable references in environment', function() {
        assert.deepEqual(seval("(let-one x 2 (let-one y 16 (+ x y)))"), 18);
    });
    test('let-one with environment, inner reference', function() {
        assert.deepEqual(seval("(let-one x 2 (let-one z 7 z))"), 7);
    });
    test('let-one with environment, outer reference', function() {
        assert.deepEqual(seval("(let-one y 16 (let-one x 7 y))"), 16);
    });
});

suite("define", function() {
    test("simple", function() {
        assert.deepEqual(seval("(begin (define x 2) x)"), 2);
    });
});

// suite("set!", function() {
//     /* TODO: implement tests */
// });


// /* Internal Tests */


// suite('createEnv', function() {
//     test('simple', function() {
//         var result = createEnv("a", 4, {});
//         var expect = { bindings: {'a': 4}, outer: {} };
//         console.log("SIMPLE: " + JSON.stringify(result));
//         console.log("THING: " + JSON.stringify(expect));
//         assert.deepEqual(result, expect);
//     });
// });

// suite("section 1 : lookup", function() {
//     var env1 = createEnv("x", 19, {});
//     var env2 = createEnv("y", 16, env1);
//     var env3 = createEnv("x", 2, env2);

//     test('Single binding', function() {
//         assert.deepEqual(lookup(env1, 'x'), 19);
//     });
//     test('Double binding inner', function() {
//         assert.deepEqual(lookup(env2, 'y'), 16);
//     });
//     test('Double binding outer', function() {
//         assert.deepEqual(lookup(env2, 'x'), 19);
//     });
//     test('Triple binding inner', function() {
//         assert.deepEqual(lookup(env3, 'x'), 2);
//     });
// });

// suite("section 2 : let-one-internal", function() {
//     var env1 = createEnv("x", 19, {});
//     var env2 = createEnv("y", 16, env1);
//     var env3 = createEnv("x", 2, env2);

//     test('Variable reference in environment', function() {
//         assert.deepEqual(evalScheem('x', env3), 2);
//     });
//     test('Variable references in environment', function() {
//         assert.deepEqual(evalScheem(['+', 'x', 'y'], env3), 18);
//     });
//     test('let-one with computed value', function() {
//         assert.deepEqual(evalScheem(['let-one', 'x', ['+', 2, 2], 'x'], env3), 4);
//     });
//     test('let-one with environment, inner reference', function() {
//         assert.deepEqual(evalScheem(['let-one', 'z', 7, 'z'], env3), 7);
//     });
//     test('let-one with environment, outer reference', function() {
//         assert.deepEqual(evalScheem(['let-one', 'x', 7, 'y'], env3), 16);
//     });
// });

// suite("section 3 : update", function() {
//     var env1 = createEnv("x", 19, {});
//     var env1u = createEnv("x", 20, {});

//     var env2 = createEnv("y", 16, createEnv("x", 19, {}));
//     var env2u = createEnv("y", 10, createEnv("x", 19, {}));
//     var env2v = createEnv("y", 10, createEnv("x", 20, {}));

//     var env3 = createEnv("x", 2, createEnv("y", 16, createEnv("x", 19, {})));
//     var env3u = createEnv("x", 9, createEnv("y", 16, createEnv("x", 19, {})));

//     test('Single binding', function() {
//         update(env1, 'x', 20);
//         assert.deepEqual(env1, env1u);
//     });
//     test('Double binding inner', function() {
//         update(env2, 'y', 10);
//         assert.deepEqual(env2, env2u);
//     });
//     test('Double binding outer', function() {
//         update(env2, 'x', 20);
//         assert.deepEqual(env2, env2v);
//     });
//     test('Triple binding inner', function() {
//         update(env3, 'x', 9);
//         assert.deepEqual(env3, env3u);
//     });
// });

// suite("section 4 - functions", function() {
//     var always3 = function (argList) { return 3; };
//     var identity = function (argList) { return argList[0]; };
//     var plusone = function (argList) { return argList[0] + 1; };
//     var env = createEnv("always3", always3, 
//                         createEnv("identity", identity, 
//                                   createEnv("plusone", plusone, {})));

//     test('(always3 5)', function() {
//         assert.deepEqual(evalScheem(['always3', 5], env), 3);
//     });
//     test('(identity 5)', function() {
//         assert.deepEqual(evalScheem(['identity', 5], env), 5);
//     });
//     test('(plusone 5)', function() {
//         assert.deepEqual(evalScheem(['plusone', 5], env), 6);
//     });
//     test('(plusone (always3 5))', function() {
//         assert.deepEqual(evalScheem(['plusone', ['always3', 5]], env), 4);
//     });
//     test('(plusone (+ (plusone 2) (plusone 3)))', function() {
//         assert.deepEqual(evalScheem(['plusone', ['+', ['plusone', 2], ['plusone', 3]]], env), 8);
//     });
//     // TODO: Add tests for unknown function
// });

// suite("section 5 - lambda", function() {
//     test('((lambda-one x x) 5)', function() {
//         assert.deepEqual(evalScheem([['lambda-one', 'x', 'x'], 5], { }), 5);
//     });
//     test('((lambda-one x (+ x 1)) 5)', function() {
//         assert.deepEqual(evalScheem([['lambda-one', 'x', ['+', 'x', 1]], 5], { }), 6);
//     });
//     test('(((lambda-one x (lambda-one y (+ x y))) 5) 3)', function() {
//         assert.deepEqual(evalScheem([[['lambda-one', 'x', ['lambda-one', 'y', ['+', 'x', 'y']]], 5], 3], { }), 8);
//     });
//     test('(((lambda-one x (lambda-one x (+ x x))) 5) 3)', function() {
//         assert.deepEqual(evalScheem([[['lambda-one', 'x', ['lambda-one', 'x', ['+', 'x', 'x']]], 5], 3], { }), 6);
//     });
//     test("parsed ((lambda-one x x) 5)", function() {
//         var parsed = parse("((lambda-one x x) 5)");
//         //console.log("PARSED: " + JSON.stringify(parsed));
//         var evaled = evalScheem(parsed, { });
//         assert.deepEqual(evaled, 5); 
//     });
//     test("parsed ((lambda-one x (+ x 1)) 5)", function() {
//         var parsed = parse("((lambda-one x (+ x 1)) 5)");
//         var evaled = evalScheem(parsed, { });
//         assert.deepEqual(evaled, 6); 
//     });
//     test("parsed (((lambda-one x (lambda-one x (+ x x))) 5) 3)", function() {
//         var parsed = parse("(((lambda-one x (lambda-one x (+ x x))) 5) 3)");
//         var evaled = evalScheem(parsed, { });
//         assert.deepEqual(evaled, 6); 
//     });
// });

// suite("section 6 - recursion", function() {
//     var env1 = { bindings: {'x': 19}, outer: { } };
//     var env1u = { bindings: {'x': 19, 'y': 3}, outer: { } };
    
//     var env2 = { bindings: {'y': 16}, outer:
//                  { bindings: {'x': 19}, outer: { } }};
//     var env2u = { bindings: {'z': 9, 'y': 16}, outer:
//                   { bindings: {'x': 19}, outer: { } }};

//     test('Simple new binding', function() {
//         add_binding(env1, 'y', 3);
//         assert.deepEqual(env1, env1u);
//     });
//     test('New binding', function() {
//         add_binding(env2, 'z', 9);
//         assert.deepEqual(env2, env2u);
//     });
//     test("factorial", function() {
//         var parsed = parse("(begin (define factorial (lambda-one x (if (= x 1) 1 (+ x (factorial (- x 1)))))) (factorial 4))");
//         var evaled = evalScheem(parsed, {});
//         assert.deepEqual(evaled, 10); 
//     });
// });

// suite("section 7 : multiple args : functions", function() {
//     test('parsed multivalue function', function() {
//         var env = createEnv("add3", function(argList) { return argList[0] + argList[1] + argList[2]; }, {});
//         assert.deepEqual(seval("(add3 1 2 3)"), 6);
//     });
//     test('parsed multivalue function evaled args', function() {
//         var env = createEnv("add3", function(al) { return al[0] + al[1] + al[2]; }, {});
//         assert.deepEqual(seval("(add3 1 2 (add3 10 20 30))"), 63);
//     });
// });

suite("section 7 : multiple args : lambda", function() {
    test('parsed multivalue lamda created', function() {
        assert.deepEqual(typeof seval("(lambda (a b) (+ a b))"), "function");
    });
    test('parsed multivalue lamda used', function() {
        assert.deepEqual(seval("((lambda (a b) (+ a b)) 1 2)"), 3);
    });
    // The a in the inner function returned comes from the original scope
    test('env capture is creator', function() {
        var code = "(begin                                        \
                        (define add-n (lambda (a)                 \
                                          (lambda (x) (+ a x))))  \
                        (define add-2 (add-n 2))                  \
                        (add-2 5))";
        assert.deepEqual(seval(code), 7);
    });
    // The captured variable is shared between the functions
    // Both see updates the other makes
    test('env capture is shared', function() {
        var code = "(begin                                                              \
                        (define create-functions                                        \
                            (lambda ()                                                  \
                                (begin                                                  \
                                    (define counter 0)                                  \
                                    (define f100 (lambda ()                             \
                                                   (begin                               \
                                                       (set! counter (+ counter 100))   \
                                                       counter)))                       \
                                    (define f10 (lambda ()                              \
                                                   (begin                               \
                                                       (set! counter (+ counter 10))    \
                                                       counter)))                       \
                                    (list f10 f100))))                                  \
                        (define fs (create-functions))                                  \
                        (define lf10 (car fs))                                          \
                        (define lf100 (car (cdr fs)))                                   \
                        (lf10)                                                          \
                        (lf100))";
        assert.deepEqual(seval(code), 110);
    });

});
