var MongoClient = require("mongodb").MongoClient;
var mongoUri = "mongodb://localhost";
var exampleDB = require("./examples.json");

var clientConnection = null;

const limitDBSize = /*16 * 1024 * 1024*/150000;

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
    db.createCollection("history", { capped : true, max : 5000 } )
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

var run = function (name, query, next) {
    var db = clientConnection.db(name);
    if (checkSyntax(query)) {
        getDBSize(name, function (err, dataSize) {
            if (err) {
                next(err, null);
            }
            else if ((dataSize > limitDBSize) && checkWrite(query)) {
                next({ message: "STORAGE EXCEEDED" }, null);
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
                    // Cursor
                    if (result.toArray) {
                        result.toArray((err, documents) => {
                            if (err) {
                                next(err, documents);
                            }
                            else {
                                var queryTs = new Date();
                                var history = db.collection("history");
                                history.insertOne({
                                    query: query,
                                    result: documents,
                                    timestamp: queryTs,
                                }, function (err, result) {
                                    next(err, documents);
                                });
                            }
                        });
                    }
                    // Promise
                    else if (result.then) {
                        // TODO: ADD TO QUERY HISTORY
                        result.then(
                            function (value) {
                                if (value.result) {
                                    next(null, value.result)
                                }
                                else {
                                    next(null, value)
                                }
                            }
                        ).catch(
                            function (err) {
                                next(err, null)
                            }
                        );
                    }
                    // Unknown result
                    else {
                        next(null, { unknown: true });
                    }
                }
            }
        });
    }
    else {
        next({ message: "VALIDATION ERROR" }, null);
    }
};

var getDBSize = function (name, next) {
    var db = clientConnection.db(name);
    db.stats(function (err, res) {
        if (err) {
            next(err, -1)
        }
        console.log(res);
        next(err, res.dataSize);
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
