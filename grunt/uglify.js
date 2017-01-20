module.exports = {
    my_target : {
        files : {
            'target/release/app/scripts/<%= pkg.name %>.min.js' : ['target/release/app/scripts/<%= pkg.name %>.js']
        }
    },
    options : {
        sourceMap : true
    }
};