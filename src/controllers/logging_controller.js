var http = require('../services/http_service');
var constants = require('../config/constants');
var config_controller = require('./config_controller');

/**
 * Log errors from the UI to the server so we have context into what's going on our customer's computers
 */
var lc = {

    /**
     * Errors must be of the Mojo.Exception
     * @param error
     */
    logException : function (error) {
        if (error instanceof Mojo.Exception) {
            // Suppress any exception publishing when logging so that we don't get caught
            // in an endless loop of logging/throwing/logging/throwing/logging/throwing/logging/throwing/logging,
            // you get the idea
            http.suppressExceptions = true;
            http.post(constants.endpoints.log + error.logType,
                {
                    logger : "uiLogger",
                    uiVersion : constants.version,
                    authId : Mojo.getDataVal("authModel", "authId"),
                    sessionId : config_controller.sessionId,
                    logType : error.logType,
                    component : error.component,
                    message : error.msg,
                    browser : navigator.userAgent,
                    exception : error.exeptionObj ? error.exeptionObj.message : "",
                    stack : error.exeptionObj ? error.exeptionObj.stack : ""
                }, {}, function () {
                    http.suppressExceptions = false;
                });
        }
    },

    /**
     *
     * @param msg
     * @param component
     * @param errorType
     * @param ex
     */
    logError : function (msg, component, errorType, ex) {
        if (!msg) {
            return;
        }
        if (msg instanceof Mojo.Exception) {
            lc.logException(msg);
        }
        lc.logException(new Mojo.Exception(component || constants.appName, msg, errorType || Mojo.log.INFO, ex));
    }
};
module.exports = lc;


//======================================
// Do any initialization here
//======================================
Mojo.subscribe(Mojo.constants.events.kException, lc.logException, lc);

