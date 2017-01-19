module.exports = {
    standalone : {
        src : 'src/MY_APP.js',
        dest : 'target/release/app/scripts/MY_APP.js',
        options : {
            browserifyOptions : {
                _comment_ : "build source maps",
                debug : true,
                standalone : 'MY_APP'
            }
        }
    },

    istanbul : {
        src : 'src/MY_APP.js',
        dest : 'target/browserify/MY_APP-istanbul.js',
        transform : [
            'browserify-istanbul'
        ],
        options : {
            browserifyOptions : {
                _comment_ : "build source maps",
                debug : true,
                standalone : 'MY_APP'
            }
        }
    },

    tests : {
        src : ['test/tests/**/*.test.js'],
        dest : 'target/test/browserified_tests.js',
        options : {
            transform : [
                'rewireify'
            ],
            external : ['MY_APP.js'],
            // Embed source map for tests
            debug : true
        }
    }
};