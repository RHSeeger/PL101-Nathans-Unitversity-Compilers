if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem').evalScheem;
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

var seval = function (code) { return evalScheem(parse(code), {}); }
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

suite("set!", function() {
    test("simple", function() {
        assert.deepEqual(seval("(begin (define x 2) (set! x 4) x)"), 4);
    });
    test("shadowed inner - changed", function() {
        assert.deepEqual(seval("(let-one x 2            \
                                    (let-one x 4        \
                                        (begin          \
                                            (set! x 6)  \
                                            x)))"), 6);
    });
    test("shadowed outer - unchanged", function() {
        assert.deepEqual(seval("(let-one x 2            \
                                    (begin              \
                                        (let-one x 4    \
                                            (set! x 6)) \
                                        x))"), 2);
    });
});


// /* Internal Tests */

suite("section 5 - lambda", function() {
    test('((lambda-one x x) 5)', function() {
        assert.deepEqual(seval('((lambda-one x x) 5)'), 5);
    });
    test('((lambda-one x (+ x 1)) 5)', function() {
        assert.deepEqual(seval('((lambda-one x (+ x 1)) 5)'), 6);
    });
    test('(((lambda-one x (lambda-one y (+ x y))) 5) 3)', function() {
        assert.deepEqual(seval('(((lambda-one x (lambda-one y (+ x y))) 5) 3)'), 8);
    });
    test('(((lambda-one x (lambda-one x (+ x x))) 5) 3)', function() {
        assert.deepEqual(seval('(((lambda-one x (lambda-one x (+ x x))) 5) 3)'), 6);
    });
});

suite("section 6 - recursion", function() {
    test("factorial", function() {
        assert.deepEqual(seval("(begin                                          \
                                    (define factorial                           \
                                        (lambda-one x                           \
                                            (if (= x 1)                         \
                                                1                               \
                                                (+ x (factorial (- x 1))))))    \
                                    (factorial 4))"), 10); 
    });
});

suite("section 7 : multiple args : lambda", function() {
    test('parsed multivalue lamda created', function() {
        assert.deepEqual(typeof seval("(lambda (a b) (+ a b))"), "function");
    });
    test('parsed multivalue lamda used', function() {
        assert.deepEqual(seval("((lambda (a b) (+ a b)) 1 2)"), 3);
    });
});

suite("section 7 : captured environments / closures", function() {
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
