module.exports = {
    version : "<%= pkg.version %>",
    server: 'http://'+location.hostname.toLowerCase()+'/app/',
    appName : "<%= pkg.name %>",

    events : {
        init : "init",
        auth : {
            loggedIn : "auth.loggedIn",
            loggedOut : "auth.loggedOut"
        }
    },

    endpoints : {
        "log" : "log/",
        "uiconfig" : "ping/uiconfig",
        "auth" : {
            "loggedin" : "auth/loggedin",
            "signin" : "auth/signin",
            "createaccount" : "auth/createaccount",
            "logout" : "auth/logout"
        }

    }


};