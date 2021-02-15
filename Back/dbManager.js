var MongoClient = require("mongodb").MongoClient;
var mongoUri = "mongodb://localhost";
var exampleDB = require("./examples.json");

var clientConnection = null;

const limitDBSize = 16 * 1024 * 1024;
const limitQuerySize = 16 * 1024;
const limitResultSize = 256 * 1024;

var setup = function () {
    MongoClient.connect(
        mongoUri,
        { useUnifiedTopology: true },
        function (err, client) {
            if (err) {
                return console.dir(err);
            }

            clientConnection = client;
            console.log("Conectado a la Base de Datos");
        }
    );
};

var create = function (name, next) {
    var db = clientConnection.db(name);
    var collection = db.collection("movies");
    collection.insertMany(
        exampleDB,
        function (err, result) {
            if (err) {
                console.dir(err);
            }

            next(err, result);
        }
    );
    db.createCollection("history", { capped: true, size: 5000 })
};

var checkSyntax = function (query) {
    var expression = 'db.collection\\("[a-zA-Z0-9_]+"\\).(drop|insertOne|insertMany|find|findOne|findOneAndDelete|findOneAndReplace|findOneAndUpdate|rename|updateOne|updateMany|deleteOne|deleteMany)\\([\\s\\S]*\\)';
    var regexp = new RegExp(expression)
    if (regexp.test(query)) {
        return true;
    }
    else {
        return false;
    }
}

var checkWrite = function (query) {
    var expression = 'db.collection\\("[a-zA-Z0-9_]+"\\).(insertOne|insertMany|findOneAndReplace|findOneAndUpdate|updateOne|updateMany)\\([\\s\\S]*\\)';
    var regexp = new RegExp(expression)
    if (regexp.test(query)) {
        return true;
    }
    else {
        return false;
    }
}

var run = function (name, query, author, next) {
    var db = clientConnection.db(name);
    var querySize = checkObjectSize(query);
    if (querySize < limitQuerySize) {
        if (checkSyntax(query)) {
            getDBSize(name, function (err, dataSize) {
                if (err) {
                    next(err, null);
                }
                else if ((dataSize > limitDBSize) && checkWrite(query)) {
                    next("STORAGE EXCEEDED", null);
                }
                else {
                    var result = null;
                    try {
                        result = eval(query);
                    }
                    catch (e) {
                        next(e, null);
                    }

                    if (result != null) {
                        var storeResult = function (value, next) {
                            var queryTs = new Date();
                            var history = db.collection("history");
                            history.insertOne({
                                query: query,
                                result: value,
                                author: author,
                                timestamp: queryTs,
                            }).then(
                                function (ins) {
                                    next(null, value);
                                }
                            ).catch(
                                function (err) {
                                    next(err, null);
                                }
                            );
                        };

                        if (result.toArray) {
                            result = result.toArray();
                        }

                        if (result.then) {
                            result.then(
                                function (value) {
                                    if (value.result) {
                                        value = value.result;
                                    }

                                    var valueSize = checkObjectSize(value);
                                    if (valueSize < limitResultSize) {
                                        storeResult(value, next);
                                    }
                                    else {
                                        next("RESULT TOO BIG", null);
                                    }
                                }
                            ).catch(
                                function (err) {
                                    next(err, null);
                                }
                            );
                        }
                        else {
                            next(null, { unknown: true });
                        }
                    }
                }
            });
        }
        else {
            next("VALIDATION ERROR", null);
        }
    }
    else {
        next("QUERY TOO BIG", null);
    }
};

var getDBSize = function (name, next) {
    var db = clientConnection.db(name);
    db.stats(function (err, res) {
        if (err) {
            next(err, -1)
        }
        else {
            next(err, res.dataSize);
        }
    });
}

var getHistory = function (name, next) {
    var db = clientConnection.db(name);
    var cursor = db.collection("history").find();
    cursor.toArray((err, documents) => {
        next(err, documents);
    })
}

var check = function (name, next) {
    clientConnection
        .db(name)
        .listCollections()
        .next(
            (callback = function (err, result) {
                next(err, result != null);
            })
        );
};

function checkObjectSize(object) {
    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if
            (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

module.exports = {
    setup: setup,
    run: run,
    create: create,
    check: check,
    getHistory: getHistory,
    getDBSize: getDBSize,
    checkSyntax: checkSyntax,
    checkWrite: checkWrite
};
