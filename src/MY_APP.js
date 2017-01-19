/**
 * Main Javascript class that creates our namespace and provides high level application APIs
 *
 */
var logger = require('./controllers/logging_controller'),
    config = require('./controllers/config_controller'),
    auth = require('./controllers/auth_controller'),
    constants = require('./config/constants');

var app = require('./app/MY_APPApp');

module.exports = {

    // Expose controllers to the UI and Mojo flows and views.
    controllers : {
        auth : auth,
        config : config,
        logger : logger
    },

    constants : constants,


    // App APIs
    getVersions : function () {
        return config.getVersions();
    }

};

// Fire up the app
app.init();

