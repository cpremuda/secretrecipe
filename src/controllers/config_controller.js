var config = require('../config/constants');
var http = require('../services/http_service');
var endpoints = require('../config/constants').endpoints;

var _version = require('../config/constants').version;
var _component = "ConfigController";

/**
 * Set up a configuration module for our application to use
 *
 * We can use this for turning on/off features or functionality based on a number of conditions
 *  - browser/OS
 *  - runtime environment (dev/qa/prod)
 *  - serverside configurations which can be updated realtime
 *  - etc...
 */
var CONFIG = {
    sessionId : Mojo.utils.uuid(true),  // assign a sessionid for this session
    queryString : {},
    supports : {
        fileUpload : (typeof FileReader != 'undefined')
    },
    isProd : true,
    appVersion : "?",
    env : "?",

    /**
     * Get the versions of the application components
     *
     * @returns {{ui: *, app: *, env: *}}
     */
    getVersions : function () {
        return {
            ui : Mojo.getDataVal("configModel", "uiVersion"),
            app : Mojo.getDataVal("configModel", "appVersion"),
            env : Mojo.getDataVal("configModel", "env")
        };
    },

    /**
     * Enable QA functionality
     *  - show debug console
     *  - add debug panels
     */

    enableQA : function () {
        Mojo.options.alertOnExceptions = true;
        Mojo.enableTraceConsole(true);
        _addDebugPanels();
    }

};

module.exports = CONFIG;


//======================================
// Do any initialization here
//======================================
Mojo.setDataVal("configModel", "uiVersion", _version);


//-------------------------------------
// Set query string parameters
//-------------------------------------
CONFIG.queryString = document.location.search.replace(/(^\?)/, '').split("&").map(function (n) {
    return n = n.split("="), this[n[0]] = n[1], this;
}.bind({}))[0];


//-------------------------------------
// Set A/B test information
//-------------------------------------
if (CONFIG.queryString.abtest) {
    Mojo.setABTests(decodeURIComponent(CONFIG.queryString.abtest));
}


//-------------------------------------
// Query the server for the env that we're running in.
// when it returns, publish an event to let everyone else know
// of the env
// - execute immediately upon load of this js file
//-------------------------------------
function _getRuntimeEnv () {

    return http.get(endpoints.uiconfig, {}, function (err, results) {
        if (err) {
            Mojo.publishException(_component, err.message);
        }
        else {

            CONFIG.isProd = (results.env == 'production');
            CONFIG.env = results.env;
            CONFIG.appVersion = results.version;

            // TODO - set any 'supports' variables here that your server configuration sets up

            Mojo.setDataVal('configModel', "isProd", CONFIG.isProd);
            Mojo.setDataVal("configModel", "appVersion", CONFIG.appVersion);
            Mojo.setDataVal("configModel", "env", CONFIG.env);

            if (!CONFIG.isProd) {
                setTimeout(CONFIG.enableQA, 500);
            }

            // Let every one else know that were ready to roll.
            Mojo.publish(config.events.init, results);

        }
    });
}
_getRuntimeEnv();

//======================================
// Private functionality
//======================================
function _addDebugPanels () {
    // Load up the debug panels
    Mojo.addDebugPanel(
        {
            label : "Versions",
            id : "_versions",
            htmlpage : "debug/panels/version.html"
        });

    // TODO if you want additional panels in the debug tab
    //... add more....
}