const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT
} = process.env;

var get = function(dbName) {
    var uri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}`;
    if (dbName) {
        uri += `/${dbName}`;
    }

    uri += `?authSource=admin`;
    return uri;
}

module.exports = {
    get: get
};