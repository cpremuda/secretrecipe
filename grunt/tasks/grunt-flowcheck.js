var core = require('../../tools/modules/core');

module.exports = function (grunt) {
    grunt.registerMultiTask('flowcheck', 'Check Mojo flows', function () {
        var done = this.async(),
            flows = this.data,
            _totalError = 0,
            _totalWarn = 0,
            _totalNav = 0;

        function process (callback) {
            if (flows.length <= 0) {
                if (_totalWarn > 0) {
                    grunt.log.writeln("Flow check has (" + _totalWarn + ") warnings! Just sayin'.");
                }
                if (_totalError > 0) {
                    grunt.log.error("Flow check failed with (" + _totalError + ") errors! Fix above issues and run the script again.");
                    return callback(false);
                }
                grunt.log.writeln(_totalNav + " data-nav links checked");
                grunt.log.writeln("Flow check passed.");

                return callback(true);
            }
            var flow = flows.pop();

            grunt.log.writeln("Flow Checking " + flow);


            var rtn = core.checkFlow(flow);
            _totalError += rtn.errorCount;
            _totalWarn += rtn.warnCount;
            _totalNav += rtn.navCount;

            process(callback);

        }

        process(function (result) {

            if (result) {
                done();

            }
            else {
                done(false);
            }
        });

    });
};