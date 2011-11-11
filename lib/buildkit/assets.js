var FS = require("fs");

var JS_RE = /\.js$/;
var REQUIRE_RE = /^\s\**\s*@requires?\s+([\w\/]+\.js)\s*$/;
var INCLUDE_RE = /^\s\**\s*@includes?\s+([\w\/]+\.js)\s*$/;

var compile = function(base) {
    var assets = {};
    base.forEach(function(b) {
        FS.listTree(b).forEach(function(path) {
            if (FS.isFile(FS.join(b, path)) && JS_RE.test(path)) {
                assets[path.replace(/\\/g, "/")] = getDependencies(b, path);
            }
        });
    });
    return assets;    
};

var getDependencies = function(base, path) {
    var file = FS.join(base, path);
    var source = FS.read(file);
    var require = {};
    var include = {};
    source.split("\n").forEach(function(line) {
        var match = line.match(REQUIRE_RE);
        if (match) {
            require[match[1]] = true;
        }
        match = line.match(INCLUDE_RE);
        if (match) {
            include[match[1]] = true;
        }
    });
    return {
        include: include,
        require: require
    };
};

exports.compile = compile;
