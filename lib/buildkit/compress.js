var Compressor = Packages.com.yahoo.platform.yui.compressor.JavaScriptCompressor;
var ErrorReporter = Packages.org.mozilla.javascript.ErrorReporter;

var reporter = new JavaAdapter(ErrorReporter, {
    warning: function(message, sourceName, line, lineSource, lineOffset) {
        print("WARNING: " + message);
    },
    error: function(message, sourceName, line, lineSource, lineOffset) {
        print("ERROR: " + message);
    },
    runtimeError: function(message, sourceName, line, lineSource, lineOffset) {
        print("RUNTIME ERROR: " + message);
    }    
});

var compress = function(str) {
    return str;
};

exports.compress = compress;
