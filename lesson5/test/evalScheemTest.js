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


suite('+', function() {
    test('no args', function() {
        assert.deepEqual(evalScheem(parse('(+)'), {}), 0);
    });
    test('one arg', function() {
        assert.deepEqual(evalScheem(parse('(+ 1)'), {}), 1);
    });
    test('two arg', function() {
        assert.deepEqual(evalScheem(parse("(+ 2 4)"), {}), 6);
    });
    test('more arg', function() {
        assert.deepEqual(evalScheem(parse("(+ 1 2 3 4)"), {}), 10);
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

suite("let-one", function() {
    var env1 = { name: 'x', value: 19, outer: null };
    var env2 = { name: 'y', value: 16, outer: env1};
    var env3 = { name: 'x', value: 2, outer: env2};
    test('Variable reference in environment', function() {
        assert.deepEqual(evalScheem(parse('x'), env3), 2);
    });
    test('Variable references in environment', function() {
        assert.deepEqual(evalScheem(parse("(+ x y)"), env3), 18);
    });
    test('let-one with computed value', function() {
        assert.deepEqual(evalScheem(parse("(let-one x (+ 2 2) x)"), env3), 4);
    });
    test('let-one with environment, inner reference', function() {
        assert.deepEqual(evalScheem(parse("(let-one z 7 z)"), env3), 7);
    });
    test('let-one with environment, outer reference', function() {
        assert.deepEqual(evalScheem(parse("(let-one x 7 y)"), env3), 16);
    });
});

/* Internal Tests */
suite("lookup", function() {
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

suite("let-one-internal", function() {
    var env1 = { name: 'x', value: 19, outer: null };
    var env2 = { name: 'y', value: 16, outer: env1};
    var env3 = { name: 'x', value: 2, outer: env2};
    test('Variable reference in environment', function() {
        assert.deepEqual(evalScheem('x', env3), 2);
    });
    test('Variable references in environment', function() {
        assert.deepEqual(evalScheem(['+', 'x', 'y'], env3), 18);
    });
    test('let-one with computed value', function() {
        assert.deepEqual(evalScheem(['let-one', 'x', ['+', 2, 2], 'x'], env3), 4);
    });
    test('let-one with environment, inner reference', function() {
        assert.deepEqual(evalScheem(['let-one', 'z', 7, 'z'], env3), 7);
    });
    test('let-one with environment, outer reference', function() {
        assert.deepEqual(evalScheem(['let-one', 'x', 7, 'y'], env3), 16);
    });
});

