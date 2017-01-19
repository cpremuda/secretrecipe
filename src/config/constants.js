module.exports = {
    version : "0.0.1",
    server: 'http://'+location.hostname.toLowerCase()+'/app/',
    appName : "MY_APP",

    events : {
        init : "init",
        auth : {
            loggedIn : "auth.loggedIn",
            loggedOut : "auth.loggedOut"
        }
    },

    ui : {
        maxUploadSize : 5000000 // 5m
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