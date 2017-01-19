/**
 * About :
 *
 * This script will validate the data-loadPage, data-loadFlow, and data-viewport-options specifications in an HTML page
 * The validation will verify the following :
 *
 *      data-loadPage : The page exists
 *      data-loadFlow :
 *      data-viewport-options : The flow exists and verifies that referenced states, flows, actions, and views exist.
 *          It will recursively traverse the flow tree validating that all data-nav references in Views have corresponding transitions in the flow defintion.
 *
 * Usage :
 *      Fill out the modules/config file with your application specific information.
 *      And then populate the 'pages' option.  It is not necessary to populate the 'flows' option
 */
var core = require('./modules/core');
var config = require('./modules/config');

var pages = config.pages;

var _totalError = 0;
var _totalWarn = 0;
var _totalNav = 0;

if (!pages || !(typeof pages == 'string' || Array.isArray(pages) )) {
    console.error("Invalid page specification in config file. Must be string or array of Strings");
    process.exit(1)
}
if (pages && typeof pages == 'string'){
    pages = [pages];
}

for (var i=0; i< pages.length; i++){
    var rtn = core.checkHTMLLinks(pages[i]);
    _totalError += rtn.errorCount;
    _totalWarn += rtn.warnCount;
    _totalNav += rtn.navCount;
}

if (_totalWarn > 0) {
    console.warn("Flow check has (" + _totalWarn + ") warnings! Just sayin'.");
    process.exit(1);
}
if (_totalError > 0) {
    console.warn("Flow check failed with (" + _totalError + ") errors! Fix above issues and run the script again.");
    process.exit(1);
}
else {
    console.log(_totalNav + " data-nav links checked");
    console.log("Flow check passed.");
    process.exit(0);
}