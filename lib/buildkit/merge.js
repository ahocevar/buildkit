var ASSETS = require("./assets");
var TSORT = require("./tsort");
var FILE = require("file");

var concat = function(config) {
    var base = FILE.path(config.root[0]);
    var sources = order(config).map(function(path) {
        var source = "/** FILE: " + path + " **/\n";
        return source + FILE.read(FILE.join(base, path));
    });
    return sources.join("\n");
};

var order = function(config) {    
    var base = FILE.path(config.root[0]);
    var assets = ASSETS.compile(base);
    
    var first = config.first || [];
    var includes = config.includes || [];
    if (includes.length === 0) {
        for (var path in assets) {
            includes.push(path);
        }
    }
    var excludes = config.excludes || [];
    var last = config.last || [];
    
    // determine which files to omit in includes
    var omit = {};
    first.forEach(function(path) {
        omit[path] = true;
    });
    excludes.forEach(function(path) {
        omit[path] = true;
    });
    last.forEach(function(path) {
        omit[path] = true;
    });
    
    // pull in all includes and requires declared in code
    includes = expand(includes, omit, assets);
    var dependencies = {};
    includes.forEach(function(path) {
        dependencies[path] = assets[path].requires;
    });
    
    // order based on first, includes (sorted by requires), last
    var ordered = first.concat(
        TSORT.sort(dependencies), last
    );
    return ordered;

};

var expand = function(includes, omit, assets) {
    var included = {};
    includes.forEach(function(path) {
        if (!(path in omit)) {
            included[path] = true;
        }
    });
    var path, entry, require, include, newlyIncluded, expanded = true;
    while (expanded) {
        expanded = false;
        newlyIncluded = {};
        for (path in included) {
            newlyIncluded[path] = true;
            // expand to include requires & includes from assets
            entry = assets[path];
            if (entry) {
                for (require in entry.requires) {
                    if (!(require in omit) && (!(require in included))) {
                        expanded = true;
                        newlyIncluded[require] = true;
                    }
                }
                for (include in entry.includes) {
                    if (!(include in omit) && (!(include in included))) {
                        expanded = true;
                        newlyIncluded[include] = true;
                    }
                }
            } else {
                throw "Entry not found in assets: " + path;
            }
        }
        included = newlyIncluded;
    }
    includes = [];
    for (path in included) {
        includes.push(path);
    }
    return includes;
};

exports.order = order;
exports.concat = concat;
