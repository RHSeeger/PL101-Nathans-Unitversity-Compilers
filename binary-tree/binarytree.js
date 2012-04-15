var assert = require("assert");

/* Supplied */
var add_elem = function(tree, value) {
    if(tree === null) {
        return {
            data: value,
            left: null,
            right: null
        };
    }
    if(value <= tree.data) {
        return {
            data: tree.data,
            left: add_elem(tree.left, value),
            right: tree.right
        };
    } else {
        return {
            data: tree.data,
            left: tree.left,
            right: add_elem(tree.right, value)
        };
    }
};

var create_tree = function(lst) {
    var i;
    var curr = null;
    for(i = 0; i < lst.length; i++) {
        curr = add_elem(curr, lst[i]);
    }
    return curr;
};

var contains = function(tree, value) {
    var location = tree; // start at top of tree
    // keep searching until we hit a dead end
    while(location !== null) {
        // see if we match
        if(value === location.data) {
            return true;
        } else {
            // go down left or right side based on comparison
            if(value < location.data) {
                location = location.left;
            } else {
                location = location.right;
            }
        }
    }
    return false;
};


/* Custom */
var count_recursive = function(tree) {
    if(tree === null) {
        return 0;
    }
    return 1 + count(tree.left) + count(tree.right);
};
var count_iterative = function(tree) {
    var count = 0;
    var stack = [];
    var currentNode = tree;
    while(true) {
        if(currentNode === null) {
            if(stack.length === 0) {
                return count;
            }
            currentNode = stack.pop();
            continue;
        }
        count += 1;
        stack.push(currentNode.right);
        currentNode = currentNode.left;
    }
    return count;
};


count = count_recursive;

// tests
assert.ok( count(null) === 0, 'Empty tree has no elements');
assert.ok( count(create_tree(['b', 'a'])) === 2, 'Small tree has 2 elements');
assert.ok( count(create_tree(['b', 'a', 'd', 'e', 'c'])) === 5, 'Example tree has 5 elements');
assert.ok( count(create_tree(['a', 'b', 'c', 'd', 'e'])) === 5, 'Degenerate tree also has 5 elements');

count = count_iterative;

// tests
assert.ok( count(null) === 0, 'Empty tree has no elements');
assert.ok( count(create_tree(['b', 'a'])) === 2, 'Small tree has 2 elements');
assert.ok( count(create_tree(['b', 'a', 'd', 'e', 'c'])) === 5, 'Example tree has 5 elements');
assert.ok( count(create_tree(['a', 'b', 'c', 'd', 'e'])) === 5, 'Degenerate tree also has 5 elements');