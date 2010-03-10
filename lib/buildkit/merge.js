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
    var include = config.include || [];
    if (include.length === 0) {
        for (var path in assets) {
            include.push(path);
        }
    }
    var exclude = config.exclude || [];
    var last = config.last || [];
    
    // determine which files to omit in includes
    var omit = {};
    last.forEach(function(path) {
        omit[path] = true;
    });
    
    // pull in all includes and requires declared in code
    include = expand(include, omit, assets);
    var dependencies = {};
    include.forEach(function(path) {
        dependencies[path] = assets[path].requires;
    });
    
    // topo sort of ordered
    var ordered = TSORT.sort(dependencies);
    
    // pull out any assets declared in first or explictly excluded
    ordered = ordered.filter(function(asset) {
        return (first.indexOf(asset) < 0 && exclude.indexOf(asset) < 0);
    });
    
    // order based on first, includes (sorted by requires), last
    return first.concat(ordered, last);

};

var expand = function(include, omit, assets) {
    var included = {};
    include.forEach(function(path) {
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
