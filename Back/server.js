var express = require("express"),
    bodyParser = require("body-parser"),
    OAuth = require("./authentication.js"),
    Router = require("./router.js");

var app = express();

// Enables parsing messages via POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup the OAuth server at /oauth/token
OAuth.setup(app);

// Setup all the router methods
Router.setup(app, OAuth);

// Start listening on the server port
app.listen(8080);
