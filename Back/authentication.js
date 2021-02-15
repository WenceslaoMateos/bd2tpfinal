var modelo = require("./model.js"),
    mongoose = require("mongoose"),
    OAuth2Server = require("oauth2-server"),
    Request = OAuth2Server.Request,
    Response = OAuth2Server.Response;

var dbUri = require("./dbUri.js");
var app = null;

var setup = function (server) {
    app = server;

    app.oauth = new OAuth2Server({
        model: modelo,
        accessTokenLifetime: 60 * 60,
        allowBearerTokensInQueryString: true,
    });

    // OAuth2 entrypoint.
    app.all("/oauth/token", obtainToken);

    var tryConnection = function() {
        var uri = dbUri.get("oauth");
        console.log("mongoose uri: " + uri);
        mongoose.connect(
            uri,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                reconnectTries: 10,
                reconnectInterval: 500,
                connectTimeoutMS: 10000,
            },
            function (err, res) {
                if (err) {
                    console.error(
                        'Error connecting to "%s":',
                        uri,
                        err
                    );

                    console.log("Retrying connection to OAuth");
                }
                else {
                    modelo.loadBaseData();
                    console.log("Conectado con OAuth");
                }
            }
        );
    };

    tryConnection();
};

var obtainToken = function (req, res) {
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
};

var authenticateRequest = function (req, res, next) {
    var request = new Request(req);
    var response = new Response(res);

    return app.oauth
        .authenticate(request, response)
        .then(function (token) {
            req.username = token.user.username;
            next();
        })
        .catch(function (err) {
            res.status(err.code || 500).json(err);
        });
};

module.exports = {
    setup: setup,
    obtainToken: obtainToken,
    authenticateRequest: authenticateRequest,
};
