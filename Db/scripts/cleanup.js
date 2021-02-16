function cleanUnregisteredUsers() {
    // Drop all databases of unregistered users.
    db = db.getMongo().getDB("oauth");
    userCursor = db.users.find(
        { },
        {
            registered: 1,
            username: 1,
            dbName: 1
        });

    var regUsers = [];
    while (userCursor.hasNext()) {
        var user = userCursor.next();
        if (user.registered) {
            regUsers.push(user.username);
        }
        else {
            var dbName = user.dbName;
            db = db.getMongo().getDB(dbName);
            db.dropDatabase();
        }
    }

    // Erase all unregistered users.
    db = db.getMongo().getDB("oauth");
    db.users.deleteMany({
        registered: false
    });

    // Erase all tokens associated to the erased users.
    db.tokens.deleteMany({
        "user.username": { $nin: regUsers }
    });
}

function cleanExpiredTokens() {
    db = db.getMongo().getDB("oauth");
    db.tokens.deleteMany({
        refreshTokenExpiresAt: {
            $lt: new Date()
        }
    });
}

// Run cleanup functions.
cleanUnregisteredUsers();
cleanExpiredTokens();