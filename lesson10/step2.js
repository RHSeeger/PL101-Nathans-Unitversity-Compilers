if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var compileEnvironment = function (env) {
    var result = "";
    for(var i=0; i<env.length; i++) {
        result += "var " + env[i][0] + " = " + env[i][1] + ";\n";
    }
    return result;
};

if (typeof module !== 'undefined') {
    module.exports.compileEnvironment = compileEnvironment;
}
