var rewireify = require('rewireify');

module.exports = function (grunt) {

    //require('load-grunt-tasks')(grunt);
    // Each plugin must be loaded following this pattern
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-minjson');
    grunt.loadNpmTasks('grunt-merge-json');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.loadTasks('./grunt/tasks');


    //loads the various task configuration files found in the grunt directory
    var options = {
        config : {
            src : "grunt/*.js"
        },
        pkg : grunt.file.readJSON('package.json')

    };
    var configs = require('load-grunt-configs')(grunt, options);


    grunt.initConfig(configs);


    grunt.registerTask('lessToCSS', ['less']);
    grunt.registerTask('mojo-flowcheck', ['flowcheck']);
    //grunt.registerTask('phantomJSTests', ['browserify', 'phantom']);
    //grunt.registerTask('phantom', ['mocha_phantomjs']);
    grunt.registerTask('js-hint', ['jshint:all']);
    grunt.registerTask('release', ['jshint', 'clean:targets', 'copy:main', 'browserify:standalone', 'string-replace', 'uglify', 'less', 'karma', 'flowcheck', 'gzip']);
    grunt.registerTask('build', ['jshint', 'clean:targets', 'copy:main', 'browserify:standalone', 'string-replace', 'uglify', 'copy:debug', 'less', 'flowcheck']);
    grunt.registerTask('run-tests', ['jshint', 'clean:coverage', 'browserify:tests', 'copy:test', 'string-replace', 'karma']);
    grunt.registerTask('run-browsers', ['browserSync']);
};
