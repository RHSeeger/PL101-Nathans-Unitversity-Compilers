if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var prettyType = function (type) {
    if (type.tag === 'basetype') {
        return type.name;
    } else if (type.tag === 'arrowtype') {
        return "(" + prettyType(type.left) + " -> " + prettyType(type.right) + ")";
    } else {
        throw new Error("Unknown construct: " + JSON.stringify(type));
    }
};

if (typeof module !== 'undefined') {
    module.exports.prettyType = prettyType;
}



