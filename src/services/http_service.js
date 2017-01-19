var constants = require('../config/constants');

var Service = {

    suppressExceptions : false,

    /**
     * Make a GET request to the server
     *
     * @param uri
     * @param queryParams - object containing name/value pairs of parameters
     * @param callback - optional
     * @returns {promise}
     *
     */
    get : function (uri, queryParams, callback) {
        // Normalize if caller did not pass queryParams
        if (arguments.length == 2 && Mojo._.isFunction(arguments[1])) {
            callback = queryParams;
            queryParams = {};
        }
        return _getFromServer(uri, queryParams, callback);
    },

    /**
     * Make a POST request to the server
     *
     * @param uri
     * @param data
     * @param queryParams
     * @param callback - optional
     * @returns {promise}
     *
     * */
    post : function (uri, data, queryParams, callback) {

        // Normalize if caller did not pass queryParams
        if (arguments.length == 3 && Mojo._.isFunction(arguments[2])) {
            callback = queryParams;
            queryParams = {};
        }
        return _postToServer(uri, data, queryParams, callback);
    },


    /**
     * Make a DELETE request to the server
     *
     * @param uri
     * @param queryParams
     * @param callback - optional
     * @returns {promise}
     *
     * */

    delete : function (uri, queryParams, callback) {
        // Normalize if caller did not pass queryParams
        if (arguments.length == 2 && Mojo._.isFunction(arguments[1])) {
            callback = queryParams;
            queryParams = {};
        }

        return _deleteFromServer(uri, queryParams, callback);
    },

    /**
     * Make a File upload request to the server to do a multipart file upload
     *
     * @param uri
     * @param file - the file
     * @param queryParams
     * @param callback - optional
     * @returns {promise}
     *
     * */
    fileUpload : function (uri, file, queryParams, callback) {
        // Normalize if caller did not pass queryParams
        if (arguments.length == 3 && Mojo._.isFunction(arguments[2])) {
            callback = queryParams;
            queryParams = {};
        }
        return _uploadToServer(uri, file, queryParams, callback);
    }
};
module.exports = Service;

//--------------------------------------------------------
// Private
//--------------------------------------------------------

var server = constants.server;
var _component = "Server";

/**
 * Execute a GET and return a promise as well as execute a callback (if supplied)
 *
 * @param action
 * @param queryParams
 * @param callback
 * @returns Promise
 * @private
 */
function _getFromServer (action, queryParams, callback) {
    var params = _createParams(queryParams),
        promise = Mojo.$.Deferred(),
        url = server + (action || "") + params,
        suppress = Service.suppressExceptions;

    Mojo.$.ajax({
        type : "GET",
        url : url,
        success : function (result) {
            if (result.status == 'success') {
                promise.resolve(result.data);
                if (callback) {
                    callback(null, result.data);
                }
            }
            else {
                promise.reject(new Error(result.message));
                if (callback) {
                    callback(new Error(result.message));
                }

            }
        },
        error : function (xhr, textstatus, err) {
            if (!suppress) {
                Mojo.publishException(_component, "URL: " + url + ", HTTP Status: " + xhr.status + " , Error: " + err);
            }
            promise.reject(new Error(err));
            if (callback) {
                callback(new Error(err));
            }
        }
    });

    return promise.promise();
}

/**
 * Execute a POST and return a promise as well as execute a callback (if supplied)
 *
 * @param action
 * @param data
 * @param queryParams
 * @param callback
 * @returns Promise
 * @private
 */
function _postToServer (action, data, queryParams, callback) {
    data = Mojo.utils.jsonSerializer.toString(data);
    var params = _createParams(queryParams),
        promise = Mojo.$.Deferred(),
        url = server + (action || "") + params,
        suppress = Service.suppressExceptions;

    Mojo.$.ajax({
        type : "POST",
        url : url,
        data : data,
        contentType : "application/json; charset=utf-8",
        dataType : 'json',
        success : function (result) {
            if (result.status == 'success') {
                promise.resolve(result.data);
                if (callback) {
                    callback(null, result.data);
                }
            }
            else {
                promise.reject(new Error(result.message));
                if (callback) {
                    callback(new Error(result.message));
                }
            }
        },
        error : function (xhr, textstatus, err) {
            if (!suppress) {
                Mojo.publishException(_component, "URL: " + url + ", HTTP Status: " + xhr.status + " , Error: " + err);
            }
            promise.reject(new Error(err));
            if (callback) {
                callback(new Error(err));
            }
        }
    });

    return promise.promise();
}


/**
 * Execute a DELETE and return a promise as well as execute a callback (if supplied)
 *
 * @param action
 * @param queryParams
 * @param callback
 * @returns Promise
 * @private
 */
function _deleteFromServer (action, queryParams, callback) {
    var params = _createParams(queryParams),
        promise = Mojo.$.Deferred(),
        url = server + (action || "") + params,
        suppress = Service.suppressExceptions;

    Mojo.$.ajax({
        type : 'delete',
        url : url,
        success : function (result) {
            if (result.status === 'success') {
                promise.resolve(result.data);

                if (callback) {
                    callback(null, result.data);
                }
            }
            else {
                promise.reject(new Error(result.message));
                if (callback) {
                    callback(new Error(result.message));
                }

            }
        },
        error : function (xhr, textstatus, err) {
            if (!suppress) {
                Mojo.publishException(_component, "URL: " + url + ", HTTP Status: " + xhr.status + " , Error: " + err);
            }
            promise.reject(new Error(err));
            if (callback) {
                callback(new Error(err));
            }
        }
    });

    return promise.promise();
}

/**
 * Execute a POST and return a promise as well as execute a callback (if supplied)
 *
 * @param action
 * @param file - file to upload
 * @param queryParams
 * @param callback
 * @returns Promise
 * @private
 */
function _uploadToServer (action, file, queryParams, callback) {
    var params = _createParams(queryParams),
        promise = Mojo.$.Deferred(),
        url = server + (action || "") + params,
        suppress = Service.suppressExceptions;

    // verify that the file is not humungo.
    if (!file || file.size > constants.ui.maxUploadSize) {
        var err = "File: " + file.name + " exceeds maximum file size";
        if (callback) {
            callback(err);
        }
        return promise.reject(new Error(err));
    }

    Mojo.$.ajax({
        type : "POST",
        url : url,
        data : file,
        cache : false,
        contentType : false,
        processData : false,
        success : function (result) {
            if (result.status == 'success') {
                promise.resolve(result.data);
                if (callback) {
                    callback(null, result.data);
                }
            }
            else {
                promise.reject(new Error(result.message));
                if (callback) {
                    callback(new Error(result.message));
                }
            }
        },
        error : function (xhr, textstatus, err) {
            if (!suppress) {
                Mojo.publishException(_component, "URL: " + url + ", HTTP Status: " + xhr.status + " , Error: " + err);
            }
            promise.reject(new Error(err));
            if (callback) {
                callback(new Error(err));
            }
        }
    });

    return promise.promise();
}

function _createParams (paramObj) {
    if (!Mojo._.isObject(paramObj) || Mojo._.isArray(paramObj)) {
        return "";
    }
    var params = "?";
    Mojo._.each(paramObj, function (val, key) {
        if (val === 0 || val) {
            params += "&" + key + "=" + val;
        }
    });
    return params;
}



