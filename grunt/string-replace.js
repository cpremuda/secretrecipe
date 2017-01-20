var pkg = require('../package.json');

module.exports = {
    main : {
        files : {
            'target/' : 'target/**'
        },
        options : {
            replacements : [{
                pattern : /((<%= pkg\.)(.*?)(\s%>))/g,
                replacement : function () {
                    var key = arguments[3];
                    return pkg[key];
                }
            }]
        }
    }

}