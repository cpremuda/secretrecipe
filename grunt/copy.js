module.exports = {
    main : {
        files : [
            // includes files within path and its sub-directories
            //'!app/resources/webanalytics/*' excludes any files within that directory
            //the analytic files will be copied during a json merge task.
            {
                expand : true,
                src : ['app/**', '!app/resources/webanalytics/*'],
                dest : 'target/release/'
            },
            {
                expand : false,
                src : ['app/ppc.html'],
                dest : 'target/release/app/lp/ty15.html'
            }
        ]
    },
    debug : {
        // Deploy the maximized version of Mojo
        files : [
            {
                flatten : true,
                expand : false,
                dest : 'target/release/app/scripts/thirdparty/mojo.min.js',
                src : ['target/release/app/scripts/thirdparty/mojo.js']
            },
            {
                flatten : true,
                expand : false,
                dest : 'target/release/app/scripts/MY_APP.min.js',
                src : ['target/release/app/scripts/MY_APP.js']
            }

        ]
    },

    test : {
        files : [
            {
                expand : false,
                flatten : true,
                src : ['test/index.html'],
                dest : 'target/test/index.html'
            },
            {
                flatten : true,
                expand : false,
                dest : 'target/test/mojo.js',
                src : ['app/scripts/thirdparty/mojo.js']
            }
        ]
    }

};