/**
 * Main Javascript class that creates our namespace and provides high level application APIs
 *
 */
var logger = require('./controllers/logging_controller'),
    config = require('./controllers/config_controller'),
    auth = require('./controllers/auth_controller'),
    constants = require('./config/constants');


module.exports = {

    // Expose controllers to the UI and Mojo flows and UI.
    controllers : {
        auth : auth,
        config : config
    },

    constants : constants,


    // Expose any controller functionality to top level
    getVersions : function () {
        return config.getVersions();
    }

};

