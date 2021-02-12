var error = function (err, res, status, message) {
    logError(err);
    res.status(status).send(message)
}

var logError = function (err) {
    if (err && err.stack) {
        console.error(err.stack);
    }
}

module.exports = {
    error: error
};
