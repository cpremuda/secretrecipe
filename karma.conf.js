module.exports = function (config) {
    //noinspection KarmaConfigFile
    config.set({
        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['browserify', 'mocha', 'chai', 'sinon-chai', 'phantomjs-shim' ],

        // web server port
        port: 18080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        reporters: ['dots', 'coverage', 'junit'],

        junitReporter: {
            outputDir: 'target/junit/' // results will be saved as $outputDir/$browserName.xml
        },

        coverageReporter: {
            reporters: [
                {type: 'html', dir: 'target/coverage/'},
                {type: 'text-summary'},
                {type: 'cobertura', dir: 'target/coverage/'}
            ]
        },

        files: [
            // 'app/scripts/config/mojo_config.js',
             'app/scripts/thirdparty/mojo.js',
            // 'app/scripts/TODO.js',
            'src/TODO.js',
            //            'app/scripts/thirdparty/mojo-dev.js',
            'test/tests/**/*.test.js'
            //            'app/scripts/**/*.js',
            //            'target/test/browserified_tests.js'
        ],

        exclude: [
            /*
               'src/main/webapp/backbone/app/base/ui-interactions.js'
               */

            //'**/templates/**/*.js'
        ],

        preprocessors: {
            //          'test/suite.js': ['commonjs']
            'src/TODO.js': ['browserify'],
            'test/tests/**/*.test.js': ['browserify']
            // source files for coverage (these files will be instrumented by Istanbul)
            //'src/main/webapp/backbone/app/**/*.js': ['coverage']
        },
        browserify: {
            debug : true,
            transform : [ 'browserify-istanbul', 'rewireify']
        },

        plugin: [
            'karma-mocha',
            'karma-jquery',
            'karma-js-coverage',
            'karma-commonjs',
            'karma-browserify',
            'karma-chai-plugins',
            'karma-sinon',
            'karma-notify-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-junit-reporter',
            //            'karma-phantomjs-launcher',
            'karma-phantomjs-launcher'
        ],

        //when running karma outside of grunt (probably for debugging), set to false keep server running
        singleRun: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS']
        //browsers: ['Chrome', 'Firefox']
    });
};
