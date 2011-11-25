var FS = require("fs");
var ASSERT = require("assert");
var BUILD = require("buildkit/build");

var tmpDir = module.resolve("./tmp" + Date.now() + Math.random());

exports.setUp = function() {
    exports.tearDown();
    FS.makeDirectory(tmpDir);
};
exports.tearDown = function() {
    if (FS.exists(tmpDir)) {
        FS.removeTree(tmpDir);
    }
};

function buildLib(config) {
    var path = module.resolve("./integration/" + config);
    ASSERT.isTrue(FS.exists(path), "exists: " + path);
    try {
        BUILD.main(["-o", tmpDir, path]);
    } catch (err) {
        ASSERT.fail("Build failed: " + err.message);
    }
}

function evalLib(name) {
    var path = FS.join(tmpDir, name);
    ASSERT.isTrue(FS.exists(path), "exists: " + path);
    var code = FS.read(path);
    var func = new Function("g", code);
    var g = {};
    try {
        func(g);
    } catch (err) {
        ASSERT.fail("Failed to execute code '" + path + "': " + err.message);
    }
    return g;
}

exports["test: all_animals"] = function() {
    buildLib("all_animals.cfg");
    var g = evalLib("all_animals.js");
    ASSERT.ok(g.animal, "g.animal");
    ASSERT.ok(g.animal.mammal, "g.animal.mammal");
    ASSERT.ok(g.animal.mammal.monkey, "g.animal.mammal.monkey");
    ASSERT.ok(g.animal.reptile, "g.animal.reptile");
    ASSERT.ok(g.animal.reptile.lizard, "g.animal.reptile.lizard");
    ASSERT.ok(g.food, "g.food");
    ASSERT.ok(g.food.fruit, "g.food.fruit");
    ASSERT.ok(g.food.fruit.banana, "g.food.fruit.banana");
    ASSERT.ok(g.food.vegetable, "g.food.vegetable");
    ASSERT.ok(g.food.vegetable.carrot, "g.food.vegetable.carrot");
};

exports["test: monkey"] = function() {
    buildLib("monkey.cfg");
    var g = evalLib("monkey.js");
    ASSERT.ok(g.animal, "g.animal");
    ASSERT.ok(g.animal.mammal, "g.animal.mammal");
    ASSERT.ok(g.animal.mammal.monkey, "g.animal.mammal.monkey");
    ASSERT.isTrue(!(g.animal.reptile), "no g.animal.reptile");
    ASSERT.ok(g.food, "g.food");
    ASSERT.ok(g.food.fruit, "g.food.fruit");
    ASSERT.ok(g.food.fruit.banana, "g.food.fruit.banana");
    ASSERT.isTrue(!(g.food.vegetable), "no g.food.vegetable");
};

if (require.main == module || require.main == module.id) {
    require("test").run(exports);
}
