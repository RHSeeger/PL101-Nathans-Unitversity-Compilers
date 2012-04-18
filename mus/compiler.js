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

var reverse = function(expr) {
    if ( expr.tag === 'note' || expr.tag === 'rest' ) {
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

var endTime = function (time, expr) {
    //console.log("endTime(" + time + ", " + JSON.stringify(expr) + ")");
    if ( expr.tag === 'note' || expr.tag === 'rest' ) {
        return time + expr.dur;
    } else if ( expr.tag === 'seq' ) {
        return endTime(endTime(time, expr.left), expr.right);
    } else if ( expr.tag == 'par' ) {
        return Math.max(endTime(time, expr.left), endTime(time, expr.right));
    } else {
        throw "Invalid expression type: '" + expr.tag + "'";
    }
};

var compile = function (musexpr, start) {
    start = typeof start !== 'undefined' ? start : 0;

    if ( musexpr.tag === 'note' ) {
        return [ 
            { 
                tag: 'note',
                pitch: convert_pitch(musexpr.pitch),
                start: start,
                dur: musexpr.dur
            } ];
    } else if ( musexpr.tag === 'rest' ) {
        return [ 
            { 
                tag: 'rest',
                start: start,
                dur: musexpr.dur
            } ];
    } else if ( musexpr.tag === 'seq' ) {
        return compile(musexpr.left, start).concat(compile(musexpr.right, endTime(start, musexpr.left)));
    } else if ( musexpr.tag === 'par' ) {
        return compile(musexpr.left, start).concat(compile(musexpr.right, start));
    } else {
        throw "Invalid expression type: '" + musexpr.tag + "'";
    }
    
};

var convert_pitch = function(pitch) {
    var notes = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 }
    if (pitch.length != 2) {
        throw "Invalid pitch '" + pitch + "'";
    }
    return 12 + (pitch.charAt(1) * 12) + notes[pitch.charAt(0).toLowerCase()];
}


/*
 * prelude
 */
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

/*
 * reverse
 */
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



/*
 * endTime
 */
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



/*
 * compile
 */
var melody1_mus = { tag: 'note', pitch: 'a4', dur: 125 };
var melody1_note = [ 
    { tag: 'note', pitch: convert_pitch('a4'), start: 0, dur: 125 } ];

var melody2_mus = 
    { tag: 'seq',
      left: { tag: 'note', pitch: 'a4', dur: 250 },
      right: { tag: 'note', pitch: 'b4', dur: 250 } };
var melody2_note = [
    { tag: 'note', pitch: convert_pitch('a4'), start: 0, dur: 250 },
    { tag: 'note', pitch: convert_pitch('b4'), start: 250, dur: 250 } ];

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
    { tag: 'note', pitch: convert_pitch('a4'), start: 0, dur: 250 },
    { tag: 'note', pitch: convert_pitch('b4'), start: 250, dur: 250 },
    { tag: 'note', pitch: convert_pitch('c4'), start: 500, dur: 500 },
    { tag: 'note', pitch: convert_pitch('d4'), start: 1000, dur: 500 } ];

assert_eq(compile(melody1_mus), melody1_note,       'One note test');
assert_eq(compile(melody2_mus), melody2_note,       'Two note test');
assert_eq(compile(melody3_mus), melody3_note,       'Four note test');


/*
 * par(allel)
 */

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'note', pitch: 'c3', dur: 250 },
         right: { tag: 'note', pitch: 'g4', dur: 500 } },
      right:
       { tag: 'par',
         left: { tag: 'note', pitch: 'd3', dur: 500 },
         right: { tag: 'note', pitch: 'f4', dur: 250 } } };
var melody_note = [
    { tag: 'note', pitch: convert_pitch('c3'), start: 0, dur: 250 },
    { tag: 'note', pitch: convert_pitch('g4'), start: 0, dur: 500 },
    { tag: 'note', pitch: convert_pitch('d3'), start: 500, dur: 500 },
    { tag: 'note', pitch: convert_pitch('f4'), start: 500, dur: 250 } ];
assert_eq(compile(melody_mus), melody_note,       'Four note test');


/*
 * rest
 */
assert_eq(compile({ tag: 'rest', dur: 125 }), [ { tag: 'rest', start: 0, dur: 125 } ], "rest alone");
assert_eq(
    compile({ 
        tag: 'seq',
        left: { tag: 'rest', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 150 }
    }), [
        { tag: 'rest', start: 0, dur: 250 },
        { tag: 'note', pitch: convert_pitch('b4'), start: 250, dur: 150 } 
    ],
    "rest first in sequence");
assert_eq(
    compile({ 
        tag: 'seq',
        left: { tag: 'note', pitch: 'b4', dur: 150 },
        right: { tag: 'rest', dur: 250 }
    }), [
        { tag: 'note', pitch: convert_pitch('b4'), start: 0, dur: 150 } ,
        { tag: 'rest', start: 150, dur: 250 }
    ],
    "rest second in sequence");

/*
 * convert_pitch
 */
assert_eq(convert_pitch('c4'), 60, "convert_pitch c4");
assert_eq(convert_pitch('e4'), 64, "convert_pitch e4");
assert_eq(convert_pitch('g4'), 67, "convert_pitch g4");

assert_eq(compile({ tag: 'note', pitch: 'a4', dur: 125 }), [ { tag: 'note', pitch: 69, start: 0, dur: 125 } ], "convert_pitch compile");
