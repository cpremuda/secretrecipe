module.exports = {
    standalone : {
        src : 'src/index.js',
        dest : 'target/release/app/scripts/<%= pkg.name %>.js',
        options : {
            browserifyOptions : {
                _comment_ : "build source maps",
                debug : true,
                standalone : '<%= pkg.name %>'
            }
        }
    },

    istanbul : {
        src : 'src/index.js',
        dest : 'target/browserify/<%= pkg.name %>-istanbul.js',
        transform : [
            'browserify-istanbul'
        ],
        options : {
            browserifyOptions : {
                _comment_ : "build source maps",
                debug : true,
                standalone : '<%= pkg.name %>'
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
            external : ['<%= pkg.name %>.js'],
            // Embed source map for tests
            debug : true
        }
    }
};