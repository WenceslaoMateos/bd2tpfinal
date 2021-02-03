var MongoClient = require("mongodb").MongoClient;
var mongoUri = "mongodb://localhost";

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

    // TODO: Mejorar los datos de prueba
    var borrameCol = db.collection("borrame");
    borrameCol.insertMany(
        [
            {
                name: "Wen",
                age: 28,
            },
            {
                name: "Dario",
                age: 27,
            },
        ],
        function (err, result) {
            if (err) {
                console.dir(err);
            }

            next(err, result);
        }
    );
};

var run = function (name, query) {
    var db = clientConnection.db(name);
    eval(query);
};

module.exports = {
    setup: setup,
    run: run,
    create: create,
};
