var dbs = db.getMongo().getDBNames()
for (var i in dbs) {
    db = db.getMongo().getDB(dbs[i]);
    var dbName = db.getName();
    if ((dbName !== "admin") && (dbName !== "config") && (dbName !== "local")) {
        print("Dropping db " + dbName);
        db.dropDatabase();
    }
    else {
        print("Skipping db " + dbName);
    }
}
