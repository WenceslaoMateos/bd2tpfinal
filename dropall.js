var dbs = db.getMongo().getDBNames()
for (var i in dbs){
    var dbName = db.getName();
    if ((dbName !== "admin") && (dbName !== "config") && (dbName !== "local")) {
        db = db.getMongo().getDB(dbs[i]);
        print("Dropping db " + dbName);
        db.dropDatabase();
    }
    else {
        print("Skipping db " + dbName);
    }
}
