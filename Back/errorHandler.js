var error = function (err, res, status, message) {
    logError(err);
    res.status(status).send(message)
}

var logError = function (err, code) {
    console.error(err.stack);
}

module.exports = {
    error: error
};
