var express = require("express"),
    //mongoose va a usarse para trabajar co oauth
    modelo = require("./model.js"),
    mongoose = require("mongoose"),
    //mongoclient va a ser para utilizar la base de datos con las consultas crudas
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser"),
    OAuth2Server = require("oauth2-server"),
    Request = OAuth2Server.Request,
    Response = OAuth2Server.Response;

var app = express();

//parsea el post para poder usarlo
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoOAuthUri = "mongodb://localhost/oauth";
// vamos a usarlo para el oauth
mongoose.connect(
    mongoOAuthUri,
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    function (err, res) {
        if (err) {
            return console.error(
                'Error connecting to "%s":',
                mongoOAuthUri,
                err
            );
        }
        console.log("Conectado con OAuth");
        //modelo.loadExampleData(); //comentao por que el user y contraseña andan
    }
);

app.oauth = new OAuth2Server({
    model: modelo,
    accessTokenLifetime: 60 * 60,
    allowBearerTokensInQueryString: true,
});

app.all("/oauth/token", obtainToken);

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

        var borrameCol = db.collection("borrame");
        /*borrameCol.insertMany(
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
        }
    );*/
    }
);

app.get("/", authenticateRequest, function (req, res) {
    res.send("Que bello ser sos dario :)");
});

app.get("/run", function (req, res) {
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

//especificamos el puerto donde vamos a escuchar con el server
app.listen(8080);

function obtainToken(req, res) {
    var request = new Request(req);
    var response = new Response(res);

    return app.oauth
        .token(request, response)
        .then(function (token) {
            res.json(token);
        })
        .catch(function (err) {
            res.status(err.code || 500).json(err);
        });
}

function authenticateRequest(req, res, next) {
    var request = new Request(req);
    var response = new Response(res);

    return app.oauth
        .authenticate(request, response)
        .then(function (token) {
            next();
        })
        .catch(function (err) {
            res.status(err.code || 500).json(err);
        });
}
