//  Used to generate random usernames and passwords
var crypto = require("crypto");
var dbManager = require("./dbManager.js");
var userManager = require("./userManager.js");

var app = null;

var setup = function (server, oauth) {
    app = server;

    dbManager.setup();

    /*
    app.get("/api/run", oauth.authenticateRequest, function (req, res) {
        var script = req.query.script;
        console.log(script);

        //TODO evaluar istintos temas de seguridad para que no toquen cosas raras
        var cursor = dbManager.run(script);
        cursor.toArray((err, documents) => {
            var fullResponse = JSON.stringify(documents);
            res.send(fullResponse);
            //registrarconsulta(usuario, timestamp, consulta, resultado)
        });
        //http://localhost:8080/run?script=db.collection("borrame").find()
    });
    */

    // Generate a new username and password at random.
    app.post("/api/autoregister", function (req, res) {
        var randomName = function () {
            return crypto.randomBytes(16).toString("hex");
        };

        var pass = crypto.randomBytes(16).toString("hex");

        var createUser = function (name) {
            userManager.create(name, pass, function (err) {
                if (err) {
                    res.send(err);
                } else {
                    dbManager.create(name, function (err, result) {
                        if (err) {
                            res.send(err);
                        }
                        res.send({
                            username: name,
                            password: pass,
                        });
                    });
                }
            });
        };

        var recursiveCheck = function (name) {
            userManager.check(name, function (err, exists) {
                if (exists) {
                    name = randomName();
                    recursiveCheck(name);
                } else {
                    createUser(name);
                }
            });
        };

        recursiveCheck(randomName());
    });

    //      Renames the user associated to the OAuth token.
    //      username: The new username.
    //      password: The new password.
    app.post(
        "/api/register",
        oauth.authenticateRequest,
        function (req, res) {}
    );

    app.post(
        "/api/run_query",
        oauth.authenticateRequest,
        function (req, res) {}
    );
    //      Run the specified query on the user's database.

    app.get(
        "/api/query_history",
        oauth.authenticateRequest,
        function (req, res) {}
    );
    //      Retrieve all queries and their results.

    app.post(
        "/api/invite_user",
        oauth.authenticateRequest,
        function (req, res) {}
    );
    //      Give access to another user to the databases of the user associated to the OAuth token.

    app.post(
        "/api/uninvite_user",
        oauth.authenticateRequest,
        function (req, res) {}
    );
    //      Delete previously invited user.
};

module.exports = {
    setup: setup,
};
