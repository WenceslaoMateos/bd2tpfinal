var userModel = require("./mongo/model/user");

var create = function (name, pass, databaseName, next) {
    var user = new userModel({
        username: name,
        password: pass,
        dbName: databaseName,
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
        (callback = function (err, doc) {
            next(err, doc != null);
        })
    );
};

var rename = function (oldName, newName, next) {
    userModel.updateOne(
        { username: oldName },
        { username: newName },
        function (err, result) {
            if (err) {
                next(err, false);
            }
            else {
                console.log(result);
                next(err, result.n > 0);
            }
        }
    );
};

module.exports = {
    create: create,
    check: check,
    rename: rename,
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
