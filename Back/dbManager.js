var MongoClient = require("mongodb").MongoClient;
var mongoUri = "mongodb://localhost";
var exampleDB = require("./examples.json");

var clientConnection = null;

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
};

var verify= function(query) {
    // TODO
    return true;
}

var run = function (name, query, next) {
    var db = clientConnection.db(name);
    if (verify(query)) {
        var cursor = null;
        try {
            cursor = eval(query);
        }
        catch (e) {
            console.log(e);
            next(e, null);
        }

        if (cursor != null) {
            cursor.toArray((err, documents) => {
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
                    }, function(err, result) {
                        next(err, documents);
                    });
                }   
            });
        }
    }
    else {
        next("VALIDATION ERROR", null);
    }
};

var getHistory = function(name, next) {
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
};
