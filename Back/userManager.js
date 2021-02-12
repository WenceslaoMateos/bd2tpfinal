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

var checkInvited = function (myName, otherID, next) {
    userModel.findOne(
        {
            username: myName,
            invitedTo: otherID
        },
        (callback = function (err, doc) {
            next(err, doc != null);
        })
    );
};

var getUsername = function (id, next) {
    userModel.findOne(
        {
            _id: id
        },
        (callback = function (err, doc) {
            if (doc) {
                next(err, doc.username);
            }
            else {
                next("USERNAME NOT FOUND", null);
            }
        })
    );
}

var getid = function (username, next) {
    userModel.findOne(
        {
            username: username
        },
        (callback = function (err, doc) {
            if (doc) {
                next(err, doc._id);
            }
            else {
                next("USERNAME NOT FOUND", null);
            }
        })
    );
}

var uninvite = function (username, usernameOther, next) {
    getid(usernameOther, (err, idOther) => {
        userModel.updateOne(
            {
                username: username
            },
            {
                $pull: { invitedTo: idOther }
            }, (err, doc) => {
                if (err) {
                    next("ERROR PULLING USER");
                }
                else {
                    next(null);
                }
            })
    })
}

var invite = function (username, usernameOther, next) {
    getid(usernameOther, (err, idOther) => {
        userModel.updateOne(
            {
                username: username
            },
            {
                $addToSet: { invitedTo: idOther }
            }, (err, doc) => {
                if (err) {
                    next("ERROR PUSHING USER");
                }
                else {
                    next(null);
                }
            })
    })
}

var getInvitedTo = function (name, next) {
    userModel.findOne(
        {
            username: name
        },
        (callback = function (err, doc) {
            if (doc) {
                var cursor = userModel.find(
                    {
                        _id: { $in: doc.invitedT }
                    },
                    {
                        _id: 1,
                        username: 1,
                    });

                cursor.toArray().then(
                    function (value) {
                        next(null, value);
                    }
                ).catch(
                    function (err) {
                        next(err, null);
                    }
                );
            }
            else {
                next("USERNAME NOT FOUND", null);
            }
        })
    );
}

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
    checkInvited: checkInvited,
    getUsername: getUsername,
    getInvitedTo: getInvitedTo,
    uninvite: uninvite,
    invite: invite
};
