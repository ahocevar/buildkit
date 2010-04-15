var FILE = require("file");

var JS_RE = /\.js$/;
var REQUIRE_RE = /^\s\**\s*@requires?\s+([\w\/]+\.js)\s*$/;
var INCLUDE_RE = /^\s\**\s*@includes?\s+([\w\/]+\.js)\s*$/;

var compile = function(base) {
    var assets = {};
    FILE.listTree(base).forEach(function(path) {
        if (FILE.isFile(FILE.join(base, path)) && JS_RE.test(path)) {
            assets[path.replace(/\\/g, "/")] = getDependencies(base, path);
        }
    });
    return assets;    
};

var getDependencies = function(base, path) {
    var source = FILE.read(FILE.join(base, path));
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
