var express = require("express"),
    //mongoose va a usarse para trabajar ocn oauth
    mongoose = require("mongoose"),
    //mongoclient va a ser para utilizar la base de datos con las consultas crudas
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser");

var app = express();
//parsea el post para poder usarlo
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoUri = "mongodb://localhost/test";

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
);

mongoose.once("open", function () {
});

app.get("/", function (req, res) {
    res.send("Que bello ser sos dario :)");
});

app.get("/execute", function (req, res) {
    
});

//especificamos el puerto donde vamos a escuchar con el server
app.listen(8080);
