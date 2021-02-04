var modelo = require("./model.js"),
    mongoose = require("mongoose"),
    OAuth2Server = require("oauth2-server"),
    Request = OAuth2Server.Request,
    Response = OAuth2Server.Response;

var mongoOAuthUri = "mongodb://localhost/oauth";

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
            //modelo.loadExampleData(); //comentado por que el user y contraseña andan
        }
    );
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
