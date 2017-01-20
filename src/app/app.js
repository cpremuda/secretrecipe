var authSchema = require('../schemas/authSchema.json');
var dataSchema = require('../schemas/dataSchema.json');

var MyApp = {

    init : function () {
        var self = this;

        // TODO - Set up our models
        Mojo.addModel("authModel", {schema : authSchema});
        Mojo.addModel("dataModel", {schema :dataSchema});
        Mojo.addModels(["configModel"]); // other schemaless models
    }

};
module.exports = MyApp;
