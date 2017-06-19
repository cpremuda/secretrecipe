var http = require('../services/http_service');
var endpoints = require('../config/constants').endpoints.auth;
var _component = "AuthController";

module.exports = {
    isLoggedIn : function () {
        var promise = Mojo.$.Deferred();

        http.get(endpoints.loggedin, function (err, results) {
            if (results) {
                Mojo.setDataVal("authModel", "isLoggedIn", true);
                Mojo.setDataVal("authModel", "authId", results.userId);
                promise.resolve(true);
            }
            else {
                Mojo.setDataVal("authModel", "isLoggedIn", false);
                Mojo.setDataVal("authModel", "authId", null);
                promise.resolve(false);
            }
        });

        return promise.promise();
    },

    createAccount : function(username, password) {
        var promise = Mojo.$.Deferred();
        var data = {
            username : Mojo.getDataVal("authModel", "username"),
            password : Mojo.getDataVal("authModel", "password"),
            phone : Mojo.getDataVal("authModel", "phone")
        };
        Mojo.remove("authModel", "errorMsg");

        http.post(endpoints.signin, data, function (err, results) {
            if (err) {
                Mojo.setDataVal("authModel", "isLoggedIn", false);
                Mojo.setDataVal("authModel", "authId", null);
                Mojo.setDataVal("authModel", "errorMsg", err.message);
                promise.resolve(false);
            }
            else {
                Mojo.setDataVal("authModel", "isLoggedIn", true);
                Mojo.setDataVal("authModel", "authId", results.userId);
                promise.resolve(true);
            }
        });

        return promise.promise();
    },
    login : function (username, password) {
        var promise = Mojo.$.Deferred();
        var data = {
            username : Mojo.getDataVal("authModel", "username"),
            password : Mojo.getDataVal("authModel", "password")
        };
        //Mojo.remove("authModel", "errorMsg");

        http.post(endpoints.login, data, function (err, results) {
            if (err) {
                Mojo.setDataVal("authModel", "isLoggedIn", false);
                Mojo.setDataVal("authModel", "authId", null);
                Mojo.setDataVal("authModel", "errorMsg", err.message);
                promise.resolve(false);
            }
            else {
                Mojo.setDataVal("authModel", "isLoggedIn", true);
                Mojo.setDataVal("authModel", "authId", results.userId);
                promise.resolve(true);
            }
        });

        return promise.promise();
    },
    logout : function () {
        var promise = Mojo.$.Deferred();
        http.get(endpoints.logout, function (err, results) {
            if (err) {
                promise.resolve(false);
            }
            else {
                Mojo.remove("authModel", "authId");
                promise.resolve(true);
            }

        });
        return promise.promise();
    }


};





