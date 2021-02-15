var express = require("express"),
    cors = require('cors'),
    bodyParser = require("body-parser"),
    OAuth = require("./authentication.js"),
    Router = require("./router.js");

const port = process.env.PORT || 51808;

var app = express();
app.use(cors());

// Enables parsing messages via POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup the OAuth server at /oauth/token
OAuth.setup(app);

// Setup all the router methods
Router.setup(app, OAuth);

// Start listening on the server port
console.log("Listening on " + port);
app.listen(port);
