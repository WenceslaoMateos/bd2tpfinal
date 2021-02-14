var dbs = db.getMongo().getDBNames()
for (var i in dbs){
    if (db.getName() !== "admin") {
        db = db.getMongo().getDB(dbs[i]);
        print("Dropping db " + db.getName());
        db.dropDatabase();
    }
    else {
        print("Skipping admin Db");
    }
}