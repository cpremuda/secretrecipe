var dataController = require('../controllers/data_controller');

var KBBApp = {

    init : function () {
        var self = this;

        // TODO - Set up our models
        Mojo.addModels(["authModel", "configModel", "dataModel"]);

        // Load data
        dataController.loadData()
            .then(function () {

                // TODO - any initialization of other controllers


                // Initialize Mojo
                //navigationController.gotoPage(0);

            })
            .fail(function () {
                Mojo.trace("ERROR loading data", Mojo.log.ERROR);
            });
    }

};
module.exports = KBBApp;
