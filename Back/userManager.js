var tokenModel = require("./mongo/model/token");
var userModel = require("./mongo/model/user");

var create = function (name, pass, databaseName, next) {
    var user = new userModel({
        username: name,
        password: pass,
        dbName: databaseName,
        registered: false
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

var rename = function (oldName, newName, newPassword, next) {
    userModel.updateOne(
        {
            username: oldName
        },
        {
            username: newName,
            password: newPassword,
            registered: true
        },
        function (err, result) {
            if (err) {
                next(err, false);
            }
            else if (result.n == 0) {
                next(err, false);
            }
            else {
                tokenModel.updateMany(
                    {
                        user: {
                            username: oldName
                        }
                    },
                    {
                        user: {
                            username: newName
                        }
                    },
                    function (err, result) {
                        console.log(result);
                        if (err) {
                            next(err, false);
                        }
                        else {
                            next(err, true);
                        }
                    }
                );
            }
        }
    );
};

var getDbName = function (name, next) {
    userModel.findOne(
        {
            username: name,
        },
        (callback = function (err, doc) {
            if (doc != null) {
                next(err, doc.dbName);
            }
            else {
                next(err, null);
            }
        })
    );
}

var isRegistered = function (name, next) {
    userModel.findOne(
        {
            username: name,
        },
        (callback = function (err, doc) {
            if (doc != null) {
                next(err, doc.registered);
            }
            else {
                next(err, false);
            }
        })
    );
}

module.exports = {
    create: create,
    check: check,
    rename: rename,
    getDbName: getDbName,
    isRegistered: isRegistered,
};
