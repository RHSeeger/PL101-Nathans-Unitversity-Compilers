require("../assert_local.js");

var prelude = function(expr) {
    return {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'd4',
            dur: 500
        },
        right: expr
    };
};


var melody1 = { tag: 'note', pitch: 'c4', dur: 250 };
var melody2 = 
    { tag: 'seq',
      left: { tag: 'note', pitch: 'd4', dur: 500 },
      right: { tag: 'note', pitch: 'c4', dur: 250 } };
var melody3 = 
    { tag: 'seq',
      left: { tag: 'note', pitch: 'd4', dur: 500 },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'd4', dur: 500 },
         right: { tag: 'note', pitch: 'c4', dur: 250 } } };


assert_eq(prelude(melody1), melody2, 'Single note input prelude test');
assert_eq(prelude(melody2), melody3, 'Double note input prelude test');

var reverse = function(expr) {
    if ( expr.tag === 'note' ) {
        return expr;
    } else if ( expr.tag === 'seq' ) {
        return {
            tag: 'seq',
            left: reverse(expr.right),
            right: reverse(expr.left)
        };
    } else {
        throw "Invalid expression type: '" + expr.tag + "'";
    }
};


var melody1 = { tag: 'note', pitch: 'a4', dur: 125 };
var melody2 = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };
var melody3 = 
    { tag: 'seq',
      left:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'd4', dur: 500 },
         right: { tag: 'note', pitch: 'c4', dur: 500 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'b4', dur: 250 },
         right: { tag: 'note', pitch: 'a4', dur: 250 } } };

assert_eq(reverse(melody1), melody1,       'One note test');
assert_eq(reverse(melody2), melody3,       'Four note test');
assert_eq(reverse(melody3), melody2,       'Four note test backwards');



var endTime = function (time, expr) {
    //console.log("endTime(" + time + ", " + JSON.stringify(expr) + ")");
    if ( expr.tag === 'note' ) {
        return time + expr.dur;
    } else if ( expr.tag === 'seq' ) {
        return endTime(endTime(time, expr.left), expr.right);
    } else {
        throw "Invalid expression type: '" + expr.tag + "'";
    }
};


var melody1_mus = { tag: 'note', pitch: 'a4', dur: 125 };
var melody2_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };
assert_eq(endTime(500, melody1_mus), 625,       'One note test'); 
assert_eq(endTime(0, melody2_mus), 1500,       'Four note test');



var compile = function (musexpr, start) {
    start = typeof start !== 'undefined' ? start : 0;

    if ( musexpr.tag === 'note' ) {
        return [ 
            { 
                tag: 'note',
                pitch: musexpr.pitch,
                start: start,
                dur: musexpr.dur
            } ];
    } else if ( musexpr.tag === 'seq' ) {
        return compile(musexpr.left, start).concat(compile(musexpr.right, endTime(start, musexpr.left)));
    } else {
        throw "Invalid expression type: '" + expr.tag + "'";
    }
    
};

var melody1_mus = { tag: 'note', pitch: 'a4', dur: 125 };
var melody1_note = [ 
    { tag: 'note', pitch: 'a4', start: 0, dur: 125 } ];
var melody2_mus = 
    { tag: 'seq',
      left: { tag: 'note', pitch: 'a4', dur: 250 },
      right: { tag: 'note', pitch: 'b4', dur: 250 } };
var melody2_note = [
    { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
    { tag: 'note', pitch: 'b4', start: 250, dur: 250 } ];
var melody3_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };
var melody3_note = [
    { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
    { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
    { tag: 'note', pitch: 'c4', start: 500, dur: 500 },
    { tag: 'note', pitch: 'd4', start: 1000, dur: 500 } ];

assert_eq(compile(melody1_mus), melody1_note,       'One note test');
assert_eq(compile(melody2_mus), melody2_note,       'Two note test');
assert_eq(compile(melody3_mus), melody3_note,       'Four note test');
