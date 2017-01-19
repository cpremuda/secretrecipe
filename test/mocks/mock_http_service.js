module.exports = {

    mockResponse : {},
    mockError : null,

    reset : function () {
        this.mockError = null;
        this.mockResponse = {};
    },

    get : function (uri, queryParams, callback) {
        var promise = Mojo.$.Deferred();

        // Normalize if caller did not pass queryParams
        if (arguments.length == 2 && Mojo._.isFunction(arguments[1])) {
            callback = queryParams;
            queryParams = {};
        }
        if (this.mockError) {
            promise.reject(new Error(this.mockError));
            if (callback) {
                callback(new Error(this.mockError));
            }
        }
        else {
            promise.resolve(this.mockResponse);
            if (callback) {
                callback(null, this.mockResponse)
            }
        }

        return promise.promise();
    },

    post : function (uri, data, queryParams, callback) {
        var promise = Mojo.$.Deferred();

        // Normalize if caller did not pass queryParams
        if (arguments.length == 3 && Mojo._.isFunction(arguments[2])) {
            callback = queryParams;
            queryParams = {};
        }

        if (this.mockError) {
            promise.reject(new Error(this.mockError));
            if (callback) {
                callback(new Error(this.mockError));
            }
        }
        else {
            promise.resolve(this.mockResponse);
            if (callback) {
                callback(null, this.mockResponse)
            }
        }

        return promise.promise();

    },

    delete : function (uri, queryParams, callback) {
        var promise = Mojo.$.Deferred();

        // Normalize if caller did not pass queryParams
        if (arguments.length == 2 && Mojo._.isFunction(arguments[1])) {
            callback = queryParams;
            queryParams = {};
        }
        if (this.mockError) {
            promise.reject(new Error(this.mockError));
            if (callback) {
                callback(new Error(this.mockError));
            }
        }
        else {
            promise.resolve(this.mockResponse);
            if (callback) {
                callback(null, this.mockResponse)
            }
        }

        return promise.promise();
    },

    fileUpload : function (uri, file, queryParams, callback) {
        var promise = Mojo.$.Deferred();

        // Normalize if caller did not pass queryParams
        if (arguments.length == 3 && Mojo._.isFunction(arguments[2])) {
            callback = queryParams;
            queryParams = {};
        }

        if (this.mockError) {
            promise.reject(new Error(this.mockError));
            if (callback) {
                callback(new Error(this.mockError));
            }
        }
        else {
            promise.resolve(this.mockResponse);
            if (callback) {
                callback(null, this.mockResponse)
            }
        }

        return promise.promise();

    }
};