if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var scheem = require('../scheem');
    var evalScheem = scheem.evalScheem;
    var lookup = scheem.lookup;
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */
suite('stage 1', function() {
    test('5', function() {
        assert.deepEqual(5, evalScheem(5));
    });
    test('(+ 2 3)', function() {
        assert.deepEqual(5, evalScheem(['+', 2, 3]));
    });
    test('(* 2 3)', function() {
        assert.deepEqual(6, evalScheem(['*', 2, 3]));
    });
    test('(/ 1 2)', function() {
        assert.deepEqual(0.5, evalScheem(['/', 1, 2]));
    });
    test('(* (/ 8 4) (+ 1 1))', function() {
        assert.deepEqual(4, evalScheem(['*', ['/', 8, 4], ['+', 1, 1]]));
    });
});

suite('stage 2', function() {
    var env = {x:2, y:3, z:10};
    test('5', function() {
        assert.deepEqual(5, evalScheem(5, env));
    });
    test('x', function() {
        assert.deepEqual(2, evalScheem('x', env));
    });
    test('(+ 2 3)', function() {
        assert.deepEqual(5, evalScheem(['+', 2, 3], env));
    });
    test('(* y 3)', function() {
        assert.deepEqual(9, evalScheem(['*', 'y', 3], env));
    });
    test('(/ z (+ x y))', function() {
        assert.deepEqual(2, evalScheem(['/', 'z', ['+', 'x', 'y']], env));
    });
});


suite('stage 3', function() {
    test('x', function() {
        var env = {x:2, y:3, z:10};
        assert.deepEqual(2, evalScheem('x', env));
    });

    test('evaluation of define', function() {
        var env = {x:2, y:3, z:10};
        var tmp = evalScheem(['define', 'a', 5], env);
        assert.deepEqual(0, tmp);
        assert.deepEqual(env, {x:2, y:3, z:10, a:5});
    });

    test('(set! a 1)', function() {
        var env = {x:2, y:3, z:10};
        var tmp = evalScheem(['set!', 'a', 1], env);
        assert.deepEqual({x:2, y:3, z:10, a:1}, env);
    });

    test('(set! x 7)', function() {
        var env = {x:2, y:3, z:10};
        var tmp = evalScheem(['set!', 'x', 7], env);
        assert.deepEqual({x:7, y:3, z:10}, env);
    });

    test('(set! y (+ x 1))', function() {
        var env = {x:2, y:3, z:10};
        var tmp = evalScheem(['set!', 'y', ['+', 'x', 1]], env);
        assert.deepEqual({x:2, y:3, z:10}, env);
    });
});

suite('stage 4', function() {
    test('(begin 1 2 3)', function() {
        assert.deepEqual(3, evalScheem(['begin', 1, 2, 3], {}));
    });
    test('(begin (+ 2 2))', function() {
        assert.deepEqual(4, evalScheem(['begin', ['+', 2, 2]], {}));
    });
    test('(begin x y x)', function() {
        assert.deepEqual(1, evalScheem(['begin', 'x', 'y', 'x'], {x:1, y:2}));
    });
    test('(begin (set! x 5) (set! x (+ y x) x))', function() {
        assert.deepEqual(7, evalScheem(
            ['begin', ['set!', 'x', 5], ['set!', 'x', ['+', 'y', 'x']], 'x'],
            {x:1, y:2}));
    });
});

suite('stage 5', function() {
    test('(+ 2 3)', function() {
        assert.deepEqual(5, evalScheem(['+', 2, 3], {}));
    });
    test('(quote (+ 2 3))', function() {
        assert.deepEqual(['+', 2, 3], evalScheem(['quote', ['+', 2, 3]], {}));
    });
    test('(quote (quote (+ 2 3)))', function() {
        assert.deepEqual(['quote', ['+', 2, 3]], evalScheem(['quote', ['quote', ['+', 2, 3]]], {}));
    });
});

suite('stage 6', function() {
    test('(+ 2 3)', function() {
        assert.deepEqual(5, evalScheem(['+', 2, 3], {}));
    });
    test('(< 2 2)', function() {
        assert.deepEqual('#f', evalScheem(['<', 2, 2], {}));
    });
    test('(< 2 3)', function() {
        assert.deepEqual('#t', evalScheem(['<', 2, 3], {}));
    });
    test('(< (+ 1 1) (+ 2 3))', function() {
        assert.deepEqual('#t', evalScheem(['<', ['+', 1, 1], ['+', 2, 3]], {}));
    });
    test('(= 2 2)', function() {
        assert.deepEqual('#t', evalScheem(['=', 2, 2], {}));
    });
    test('(> 2 2)', function() {
        assert.deepEqual('#f', evalScheem(['>', 2, 2], {}));
    });
    test('(> 2 3)', function() {
        assert.deepEqual('#t', evalScheem(['>', 4, 3], {}));
    });
});

suite('stage 7', function() {
    test('(quote (2 3))', function() {
        assert.deepEqual([2, 3], evalScheem(['quote', [2, 3]], {}));
    });
    test("(cons 1 '(2 3))", function() {
        assert.deepEqual([1, 2, 3], evalScheem(['cons', 1, ['quote', [2, 3]]], {}));
    });
    test("(cons '(1 2) '(3 4))", function() {
        assert.deepEqual([[1, 2], 3, 4], evalScheem(['cons', ['quote', [1, 2]], ['quote', [3, 4]]], {}));
    });
    test("(car '((1 2) 3 4))", function() {
        assert.deepEqual([1, 2], evalScheem(['car', ['quote', [[1, 2], 3, 4]]], {}));
    });
    test("(cdr '((1 2) 3 4))", function() {
        assert.deepEqual([3, 4], (evalScheem(['cdr', ['quote', [[1, 2], 3, 4]]], {})));
    });
});

suite('stage 8', function() {
    test('(if (= 1 1) 2 3)', function() {
        assert.deepEqual(2, evalScheem(['if', ['=', 1, 1], 2, 3], {}));
    });
    test('(if (= 1 0) 2 3)', function() {
        assert.deepEqual(3, evalScheem(['if', ['=', 1, 0], 2, 3], {}));
    });
    test('(if (= 1 1) 2 error)', function() {
        assert.deepEqual(2, evalScheem(['if', ['=', 1, 1], 2, 'error'], {}));
    });
    test('(if (= 1 1) error 3)', function() {
        assert.deepEqual(3, evalScheem(['if', ['=', 1, 0], 'error', 3], {}));
    });
    test('(if (= 1 1) (if (= 2 3) 10 11) 12)', function() {
        assert.deepEqual(11, evalScheem(['if', ['=', 1, 1], ['if', ['=', 2, 3], 10, 11], 12], {}));
    });
});

suite('+', function() {
    test('no args', function() {
        assert.deepEqual(evalScheem(['+'], {}), 0);
    });
    test('one arg', function() {
        assert.deepEqual(evalScheem(['+', 1], {}), 1);
    });
    test('two arg', function() {
        assert.deepEqual(evalScheem(['+', 2, 4], {}), 6);
    });
    test('more arg', function() {
        assert.deepEqual(evalScheem(['+', 1, 2, 3, 4], {}), 10);
    });
});

suite('-', function() {
    test('no args', function() {
        expect(function () {
            evalScheem(['-'], {})
        }).to.throw('/incorrect number of arguments/');
    });
    test('one arg', function() {
        assert.deepEqual(evalScheem(['-', 1], {}), -1);
    });
    test('two arg', function() {
        assert.deepEqual(evalScheem(['-', 4, 2], {}), 2);
    });
    test('more arg', function() {
        assert.deepEqual(evalScheem(['-', 1, 2, 3, 4], {}), -8);
    });
});

suite('*', function() {
    test('no args', function() {
        assert.deepEqual(evalScheem(['*'], {}), 1);
    });
    test('one arg', function() {
        assert.deepEqual(evalScheem(['*', 10], {}), 10);
    });
    test('two arg', function() {
        assert.deepEqual(evalScheem(['*', 2, 4], {}), 8);
    });
    test('more arg', function() {
        assert.deepEqual(evalScheem(['*', 1, 2, 3, 4], {}), 24);
    });
});

suite('/', function() {
    test('no args', function() {
        assert.deepEqual(evalScheem(['/'], {}), 1);
    });
    test('one arg', function() {
        assert.deepEqual(evalScheem(['/', 2], {}), 1/2);
    });
    test('two arg', function() {
        assert.deepEqual(evalScheem(['/', 4, 2], {}), 2);
    });
    test('more arg', function() {
        assert.deepEqual(evalScheem(['/', 24, 4, 3, 1], {}), 2);
    });
});

suite("lesson-5-section-1", function() {
    test('Single binding', function() {
        var env1 = { name: 'x', value: 19, outer: null };
        assert.deepEqual(lookup(env1, 'x'), 19);
    });
    test('Double binding inner', function() {
        var env1 = { name: 'x', value: 19, outer: null };
        var env2 = { name: 'y', value: 16, outer: env1 };
        assert.deepEqual(lookup(env2, 'y'), 16);
    });
    test('Double binding outer', function() {
        var env1 = { name: 'x', value: 19, outer: null };
        var env2 = { name: 'y', value: 16, outer: env1 };
        assert.deepEqual(lookup(env2, 'x'), 19);
    });
    test('Triple binding inner', function() {
        var env1 = { name: 'x', value: 19, outer: null };
        var env2 = { name: 'y', value: 16, outer: env1 };
        var env3 = { name: 'x', value: 2, outer: env2 };
        assert.deepEqual(lookup(env3, 'x'), 2);
    });
});