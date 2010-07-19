var FS = require("FS");
var MERGE = require("./merge");
var CONFIG = require("./config");
var JSMIN = require("./jsmin");

// var parser = new (require("args").Parser)();
// 
// parser.help("Builds concatenated and minified scripts from a JavaScript library.");
// 
// parser.option("-l", "--list", "list")
//     .help("list files to be included in a build")
//     .set(true);
// 
// parser.option("-o", "--outdir", "outdir")
//     .help("output directory for scripts")
//     .set();
// 
// parser.arg("config");
// 
// parser.helpful();

exports.main = function main(args) {
    
    var options = parser.parse(args);
    
    if (options.args.length < 1) {
        parser.printHelp(options);
        parser.exit(options);
    }
    
    var config = options.args[0];
    if (!FS.isFile(config)) {
        parser.error(options, "Can't find config file: " + config);
    }
    
    var sections = CONFIG.parse(config);
        
    var group, separator, ordered, concat, oufile;
    for (var section in sections) {
        group = sections[section];
        group.root = [FS.join(FS.dirname(config), group.root[0])];
        if (options.list) {
            ordered = MERGE.order(group);
            print(section);
            print(section.replace(/./g, "-"));
            print(ordered.join("\n"));
            print();
        } else {
            concat = MERGE.concat(group);
            concat = JSMIN.jsmin(concat);
            outfile = section;
            if (options.outdir) {
                outfile = FS.join(options.outdir, outfile);
            }
            FS.write(outfile, concat);
        }
    }
    
};


if (module.id == require.main) {
	throw new Error("main not yet implemented");
    exports.main(system.args);
}
