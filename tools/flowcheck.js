/**
 * About :
 *
 * This script will validate the the flow exists and verifies that referenced states, flows, actions, and views exist.
 * It will recursively traverse the flow tree validating that all data-nav references in Views have corresponding transitions in the flow defintion.
 *
 *
 * Usage :
 *      Fill out the modules/config file with your application specific information.
 *      And then populate the 'flows' option.  It is not necessary to populate the 'pages' option
 */


var core = require('./modules/core');
var config = require('./modules/config');

var flows = config.flows;

var _totalError = 0;
var _totalNav = 0;
var _totalWarn = 0;

if (!flows || !(typeof flows == 'string' || Array.isArray(flows) )) {
    console.error("Invalid flow specification in config file. Must be string or array of Strings");
    process.exit(1)
}
if (flows && typeof flows == 'string'){
    flows = [flows];
}

for (var i=0; i< flows.length; i++){
    var rtn = core.checkFlow(flows[i]);
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
