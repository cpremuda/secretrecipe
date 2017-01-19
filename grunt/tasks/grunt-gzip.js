var fs = require('fs');
var zLib = require('zlib');

module.exports = function(grunt) {
    grunt.registerMultiTask('gzip', 'Gzip files', function() {
        var done = this.async();
        var files = this.data;

        function process() {
            if (files.length <= 0) {
                done();
                return;
            }
            var file = files.pop();

            grunt.log.writeln("Gzipping " + file );


            var gzipper = zLib.createGzip();
            var input = fs.createReadStream(file);
            var output = fs.createWriteStream(file + '.gz');
            input.pipe(gzipper).pipe(output);
        }

        process();

    });
};