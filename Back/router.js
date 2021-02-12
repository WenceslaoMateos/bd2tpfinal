//  Used to generate random usernames and passwords
var crypto = require("crypto");
var dbManager = require("./dbManager.js");
var userManager = require("./userManager.js");
var errorHandler = require("./errorHandler.js");
const rateLimit = require("express-rate-limit");

var app = null;

var setup = function (server, oauth) {
    app = server;

    // Limit running queries to 1 every 10 seconds.
    const apiLimiter = rateLimit({ windowMs: 10 * 1000, max: 1 });
    app.use("/api/run_query", apiLimiter);

    dbManager.setup();

    // Generate a new username and password at random.
    app.post("/api/autoregister", function (req, res) {
        console.log("Pidio autoregister");
        var randomName = function () {
            return crypto.randomBytes(8).toString("hex");
        };

        var pass = crypto.randomBytes(8).toString("hex");

        var createUser = function (name, dbName) {
            userManager.create(name, pass, dbName, function (err) {
                if (err) {
                    errorHandler.error(err, res, 500, "Can't create user");
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
                    errorHandler.error(err, res, 500, "Can't create DB");
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

    // Checks if the user is registered. Returns an object with the username if it is.
    app.get("/api/is_registered", oauth.authenticateRequest, function (req, res) {
        userManager.isRegistered(req.username, function (err, reg) {
            if (err) {
                errorHandler.error(err, res, 500, "Can't find user");
            } else {
                res.send({ username: req.username, registered: reg });
            }
        });
    });

    // Renames the user associated to the OAuth token.
    // newName: The new username.
    // newPassword: The new password.
    app.post("/api/register", oauth.authenticateRequest, function (req, res) {
        // TODO: Check empty parameters
        userManager.check(req.body.newName, function (err, exists) {
            if (exists) {
                errorHandler.error(err, res, 500, "User already exists");
            } else {
                userManager.rename(req.username, req.body.newName, req.body.newPassword, function (err, renamed) {
                    if (err) {
                        errorHandler.error(err, res, 500, "Error Unknown");
                    }
                    else if (!renamed) {
                        errorHandler.error(err, res, 500, "User can't be renamed");
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
            // TODO: Check empty parameters
            userManager.getDbName(req.username, function (err, dbName) {
                if (err) {
                    errorHandler.error(err, res, 500, "MongoDB Error");
                }
                else if (dbName == null) {
                    errorHandler.error(err, res, 500, "DB doesn't exist");
                }
                else {
                    dbManager.run(dbName, req.body.query, function (err, queryRes) {
                        if (err) {
                            errorHandler.error(err, res, 500, "Can't run the specified query: " + err);
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
            userManager.getDbName(req.username, function (err, dbName) {
                if (err) {
                    errorHandler.error(err, res, 500, "MongoDB Error");
                }
                else if (dbName == null) {
                    errorHandler.error(err, res, 500, "DB doesn't exist");
                }
                else {
                    dbManager.getHistory(dbName, function (err, history) {
                        if (err) {
                            errorHandler.error(err, res, 500, "Collection doesn't exist");
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
        function (req, res) { }
    );

    // Give access to another user to the databases of the user associated to the OAuth token.
    app.post(
        "/api/uninvite_user",
        oauth.authenticateRequest,
        function (req, res) { }
    );

    // Delete previously invited user.
};

module.exports = {
    setup: setup,
};
