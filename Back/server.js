var express = require("express"),
    //mongoose va a usarse para trabajar ocn oauth
    //mongoose = require("mongoose"),
    //mongoclient va a ser para utilizar la base de datos con las consultas crudas
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser");

var app = express();
//parsea el post para poder usarlo
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoUri = "mongodb://localhost";
var db = null;

MongoClient.connect(mongoUri, function (err, client) {
    if (err) {
        return console.dir(err);
    }

    db = client.db("test");

    console.log("Conectado a la Base de Datos");

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
                return console.dir(err);
            }

            var res = borrameCol.find({});
            res.toArray((err, documents) => {
                console.log(documents);
            });
        }
    );
});

/* vamos a usarlo para el oauth
mongoose.connect(
     mongoUri,
     {
         useCreateIndex: true,
         useNewUrlParser: true,
     },
     function (err, res) {
         if (err) {
             return console.error('Error connecting to "%s":', mongoUri, err);
         }
         console.log("Viaja todo");
     }
 );*/

app.get("/", function (req, res) {
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
