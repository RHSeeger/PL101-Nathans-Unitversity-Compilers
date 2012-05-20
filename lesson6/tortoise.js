var Turtle = function (id) {
    var $elem = $('#' + id);
    this.paper = Raphael(id);
    this.originx = $elem.width() / 2;
    this.originy = $elem.height() / 2;
    this.clear();
};
Turtle.prototype.clear = function () {
    this.paper.clear();
    this.x = this.originx;
    this.y = this.originy;
    this.angle = 90;
    this.width = 4;
    this.opacity = 1.0;
    this.color = '#00f';
    this.pen = true;
    this.turtleimg = undefined;
    this.updateTurtle();
};
Turtle.prototype.updateTurtle = function () {
    if(this.turtleimg === undefined) {
        this.turtleimg = this.paper.image(
            "http://nathansuniversity.com/gfx/turtle2.png",
            0, 0, 64, 64);
    }
    this.turtleimg.attr({
        x: this.x - 32,
        y: this.y - 32,
        transform: "r" + (-this.angle)});
    this.turtleimg.toFront();
};
Turtle.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};
Turtle.prototype.setWidth = function(width) {
    this.width = width;
};
Turtle.prototype.setColor = function(r, g, b) {
    this.color = Raphael.rgb(r, g, b);
};
Turtle.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.updateTurtle();
};
Turtle.prototype.setHeading = function(a) {
    this.angle = a;
    this.updateTurtle();
};
Turtle.prototype.drawTo = function (x, y) {
    var x1 = this.x;
    var y1 = this.y;
    var params = {
        "stroke-width": this.width,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke": this.color,
        "stroke-opacity": this.opacity
    };
    var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, x, y)).attr(params);
};
Turtle.prototype.forward = function (d) {
    var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
    var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
    if(this.pen) {
        this.drawTo(newx, newy);
    }
    this.x = newx;
    this.y = newy;
    this.updateTurtle();
};
Turtle.prototype.right = function (ang) {
    this.angle -= ang;
    this.updateTurtle();
};
Turtle.prototype.left = function (ang) {
    this.angle += ang;
    this.updateTurtle();
};
Turtle.prototype.penup = function () {
    this.pen = false;
};
Turtle.prototype.pendown = function () {
    this.pen = true;
};
Turtle.prototype.home = function() {
    this.setPosition(this.originx, this.originy);
};

// Utility function to log messages
var log_console = function(msg) {
    $('#console').append('<p>' + msg + '</p>');
};
// // After page load
// $(function() {
//     var myTurtle = new Turtle("turtlecanvas");
//     var env = { };
//     add_binding(env, 'forward', function(d) { myTurtle.forward(d); });
//     add_binding(env, 'right', function(a) { myTurtle.right(a); });
//     add_binding(env, 'left', function(a) { myTurtle.left(a); });
//     add_binding(env, 'home', function() { myTurtle.home(); });
//     $('#submitbutton').click(function() {
//         var user_text = $('#input').val();
//         $('#console').html('');
//         myTurtle.clear();
//         try {
//             var parsed = TORTOISE.parse(user_text);
//             try {
//                 var result = evalStatements(parsed, env);
//             }
//             catch(e) {
//                 log_console('Eval Error: ' + e);
//             }
//         }
//         catch(e) {
//             log_console('Parse Error: ' + e);
//         }
//     });
// });