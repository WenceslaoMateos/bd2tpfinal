var mongoose = require('mongoose'),
	modelName = 'invitation',
	schemaDefinition = require('../schema/' + modelName),
	schemaInstance = mongoose.Schema(schemaDefinition),
	modelInstance = mongoose.model(modelName, schemaInstance);

module.exports = modelInstance;
