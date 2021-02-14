var tokenModel = require("./mongo/model/token");
var userModel = require("./mongo/model/user");
var invitationModel = require("./mongo/model/invitation");

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
                next("ID NOT FOUND", null);
            }
        })
    );
}

var getId = function (username, next) {
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

var invite = function (fromName, toName, next) {
    getId(fromName, function(err, fromId) {
        if (err) {
            next("From username not found");
        }
        else {
            getId(toName, function(err, toId) {
                if (err) {
                    next("To username not found");
                }
                else {
                    var invitation = { 
                        from: fromId,
                        to: toId
                    };

                    invitationModel.findOneAndUpdate(
                        invitation,
                        invitation, 
                        {
                            upsert: true, 
                            useFindAndModify: false 
                        }, 
                        function (err, doc) {
                            next(err);
                        }
                    );
                }
            });
        }
    });
}

var uninvite = function (fromName, toId, next) {
    getId(fromName, function(err, fromId) {
        if (err) {
            next("From username not found");
        }
        else {
            var invitation = { 
                from: fromId,
                to: toId
            };

            invitationModel.deleteOne(
                invitation, 
                callback = next
            );
        }
    });
}

var getInvitedFrom = function (fromName, next) {
    getId(fromName, function(err, fromId) {
        if (err) {
            next("From username not found", false);
        }
        else {
            invitationModel.find(
                { 
                    from: fromId
                },
                callback = function(err, docs) {
                    if (err) {
                        next(err, null);
                    }
                    else if (!docs) {
                        next("No invitations found", null);
                    }
                    else {
                        var toIds = [];
                        for (const doc of docs) {
                            toIds.push(doc.to);
                        }

                        userModel.find(
                            {
                                _id: { $in: toIds }
                            },
                            {
                                _id: 1,
                                username: 1,
                            },
                            callback = function(err, docs) {
                                if (err) {
                                    next(err, null);
                                }
                                else if (!docs) {
                                    next("No matching users found", null);
                                }
                                else {
                                    next(null, docs);
                                }
                            }
                        );
                    }
                }
            );
        }
    });
}

var getInvitedTo = function (toName, next) {
    getId(toName, function(err, toId) {
        if (err) {
            next("To username not found", false);
        }
        else {
            invitationModel.find(
                { 
                    to: toId
                },
                callback = function(err, docs) {
                    if (err) {
                        next(err, null);
                    }
                    else if (!docs) {
                        next("No invitations found", null);
                    }
                    else {
                        var fromIds = [];
                        for (const doc of docs) {
                            fromIds.push(doc.from);
                        }

                        userModel.find(
                            {
                                _id: { $in: fromIds }
                            },
                            {
                                _id: 1,
                                username: 1,
                            },
                            callback = function(err, docs) {
                                if (err) {
                                    next(err, null);
                                }
                                else if (!docs) {
                                    next("No matching users found", null);
                                }
                                else {
                                    next(null, docs);
                                }
                            }
                        );
                    }
                }
            );
        }
    });
}

var checkInvitation = function(fromId, toName, next) {
    getId(toName, function(err, toId) {
        if (err) {
            next("To username not found");
        }
        else {
            invitationModel.findOne(
                {
                    from: fromId,
                    to: toId
                },
                callback = function(err, doc) {
                    if (err) {
                        next(err);
                    }
                    else if (!doc) {
                        next("No invitation found");
                    }
                    else {
                        next(null);
                    }
                }
            );
        }
    });
}

module.exports = {
    create: create,
    check: check,
    rename: rename,
    getDbName: getDbName,
    isRegistered: isRegistered,
    getUsername: getUsername,
    getId: getId,
    invite: invite,
    uninvite: uninvite,
    getInvitedFrom: getInvitedFrom,
    getInvitedTo: getInvitedTo,
    checkInvitation: checkInvitation
};
