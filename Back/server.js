var express = require("express"),
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser"),
    OAuth = require("./authentication.js");

var app = express();

// Enables parsing messages via POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup the OAuth server at /oauth/token
OAuth.setup(app);

var mongoUri = "mongodb://localhost";
var db = null;

MongoClient.connect(
    mongoUri,
    { useUnifiedTopology: true },
    function (err, client) {
        if (err) {
            return console.dir(err);
        }

        db = client.db("test");

        console.log("Conectado a la Base de Datos");
        /*var borrameCol = db.collection("borrame");
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
                return console.dir(err);
            }

            var res = borrameCol.find({});
            res.toArray((err, documents) => {
                console.log(documents);
            });
        });*/
    }
);

app.get("/api", OAuth.authenticateRequest, function (req, res) {
    res.send("Que bello ser sos dario :)");
});

app.get("/api/run", OAuth.authenticateRequest, function (req, res) {
    var script = req.query.script;
    console.log(script);

    //TODO evaluar istintos temas de seguridad para que no toquen cosas raras
    var cursor = eval(script);
    cursor.toArray((err, documents) => {
        var fullResponse = JSON.stringify(documents);
        res.send(fullResponse);
        //registrarconsulta(usuario, timestamp, consulta, resultado)
    });
    //http://localhost:8080/run?script=db.collection("borrame").find()
});

//  POST /oauth/token (DONE)
//      OAuth2 entrypoint.
//  POST /api/autoregister
//      Generate a new username and password at random.
//  POST /api/register (OAUTH)
//      Renames the user associated to the OAuth token.
//      username: The new username.
//      password: The new password.
//  POST /api/run_query (OAUTH)
//      Run the specified query on the user's database.
//  GET /api/query_history (OAUTH)
//      Retrieve all queries and their results.
//  POST /api/invite_user (OAUTH)
//      Give access to another user to the databases of the user associated to the OAuth token.
//  POST /api/uninvite_user (OAUTH)
//      Delete previously invited user.

//especificamos el puerto donde vamos a escuchar con el server
app.listen(8080);
