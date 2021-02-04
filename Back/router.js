//  Used to generate random usernames and passwords
var crypto = require("crypto");
var dbManager = require("./dbManager.js");
var userManager = require("./userManager.js");

var app = null;

var setup = function (server, oauth) {
    app = server;

    dbManager.setup();

    // Generate a new username and password at random.
    app.post("/api/autoregister", function (req, res) {
        var randomName = function () {
            return crypto.randomBytes(8).toString("hex");
        };

        var pass = crypto.randomBytes(8).toString("hex");

        var createUser = function (name, dbName) {
            userManager.create(name, pass, dbName, function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        username: name,
                        password: pass,
                    });
                }
            });
        };

        var recursiveCheckUser = function (name, dbName) {
            userManager.check(name, function (err, exists) {
                if (exists) {
                    name = randomName();
                    recursiveCheckUser(name, dbName);
                } else {
                    createUser(name, dbName);
                }
            });
        };

        var createDb = function (dbName) {
            dbManager.create(dbName, function (err, result) {
                if (err) {
                    res.send(err);
                }

                recursiveCheckUser(randomName(), dbName);
            });
        };

        var recursiveCheckDb = function (dbName) {
            dbManager.check(dbName, function (err, exists) {
                if (exists) {
                    dbName = randomName();
                    recursiveCheckDb(dbName);
                } else {
                    createDb(dbName);
                }
            });
        };

        recursiveCheckDb(randomName());
    });

    // Renames the user associated to the OAuth token.
    // newName: The new username.
    // newPassword: The new password.
    app.post("/api/register", oauth.authenticateRequest, function (req, res) {
        userManager.check(req.body.newName, function (err, exists) {
            if (exists) {
                res.status(500).send("USUARIO YA EXISTE");
            } else {
                userManager.rename(req.username, req.body.newName, req.body.newPassword, function(err, renamed) {
                    if (err) {
                        res.status(err.code || 500).json(err);
                    }
                    else if (!renamed) {
                        res.status(500).send("ERROR");
                    }
                    else {
                        res.send("OK");
                    }
                });
            }
        });
    });

    // Runs the query for the authenticated user on their database.
    // query: The Javascript code that will be evaluated by MongoDB.
    app.post(
        "/api/run_query",
        oauth.authenticateRequest,
        function (req, res) {
            userManager.getDbName(req.username, function(err, dbName) {
                if (err) {
                    res.status(err.code || 500).json(err);
                }
                else if (dbName == null) {
                    res.status(500).send("ERROR");
                }
                else {
                    dbManager.run(dbName, req.body.query, function(err, queryRes) {
                        if (err) {
                            res.status(err.code || 500).json("SYNTAX ERROR");
                        }
                        else {
                            res.send(queryRes);
                        }
                    });
                }
            });
        }
    );

    // Run the specified query on the user's database.
    app.get(
        "/api/query_history",
        oauth.authenticateRequest,
        function (req, res) {
            userManager.getDbName(req.username, function(err, dbName) {
                if (err) {
                    res.status(err.code || 500).json(err);
                }
                else if (dbName == null) {
                    res.status(500).send("ERROR");
                }
                else {
                    dbManager.getHistory(dbName, function(err, history) {
                        if (err) {
                            res.status(err.code || 500).json(err);
                        }
                        else {
                            res.send(history);
                        }
                    });
                }
            });
        }
    );

    // Retrieve all queries and their results.
    app.post(
        "/api/invite_user",
        oauth.authenticateRequest,
        function (req, res) {}
    );

    // Give access to another user to the databases of the user associated to the OAuth token.
    app.post(
        "/api/uninvite_user",
        oauth.authenticateRequest,
        function (req, res) {}
    );

    // Delete previously invited user.
};

module.exports = {
    setup: setup,
};
