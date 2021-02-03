var userModel = require("./mongo/model/user");

var create = function (name, pass, next) {
    var user = new userModel({
        username: name,
        password: pass,
    });

    user.save(function (err, user) {
        if (err) {
            console.error(err);
        }

        console.log("Created user: ", user);
        next(err);
    });
};

var check = function (name, next) {
    userModel.findOne(
        {
            username: name,
        },
        callback = function (err, doc) {
            next(err, doc != null);
        }
    );
};

module.exports = {
    create: create,
    check: check,
};

/*
var getUser = function (username, password, callback) {
    userModel
        .findOne({
            username: username,
            password: password,
        })
        .lean()
        .exec(
            function (callback, err, user) {
                if (!user) {
                    console.error("User not found");
                }

                callback(err, user);
            }.bind(null, callback)
        );
};
*/
