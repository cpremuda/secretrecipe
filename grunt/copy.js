
module.exports = {
    main : {
        files : [
            {
                expand : true,
                src : ['app/**'],
                dest : 'target/release/'
            }
        ],
        options: { // we'll handle this in the string-replace grunt task
            //process : function (content, srcpath) {
            //    if ( (srcpath.indexOf('img') > 0) || (srcpath.indexOf('css') > 0) )
            //        return content;
            //
            //    try {
            //        // replace <%= pkg.xxx %> in the source code with value from the package.json file
            //        return content.replace(/((<%= pkg\.)(.*?)(\s%>))/g, function () {
            //            var key = arguments[3];
            //            return pkg[key];
            //        });
            //    }
            //    catch(ex) {
            //        console.log(ex.message)
            //    }
            //}
        }
    },
    debug : {
        // Deploy the maximized version of Mojo and APP
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
                dest : 'target/release/app/scripts/<%= pkg.name %>.min.js',
                src : ['target/release/app/scripts/<%= pkg.name %>.js']
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
