var service = require('../../../../src/services/http_service');
var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

describe("Service", function () {


    describe("APIs", function () {
        it("should have a GET function", function () {
            assert.typeOf(service.get, 'function');
        });
    });

    describe("GET", function (err, results) {
        var xhr;
        var requests;
        var url = "gettest/foo/bar";

        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();

            requests = [];
            xhr.onCreate = function (xhr) {
                requests.push(xhr);
            }.bind(this);
        });

        afterEach(function () {
            xhr.restore();
        });


        //===========================================
        //  Success and Error callback responses
        //===========================================
        it("GET success callback should return data", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, {}, function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                expect(parts[0]).to.contain(url);
                expect(params).to.equal("");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        it("GET response callback error should return message", function (done) {
            var data = {status : "error", message : "Dude, your GET failed!"};
            service.get("/gettest", {}, function (err, result) {
                assert.typeOf(result, 'undefined');
                assert(err instanceof Error);
                expect(err.message).to.equal("Dude, your GET failed!");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });

        it("GET callback server error should return server message", function (done) {
            var data = {status : "error", message : "Dude, your GET failed!"};
            service.get(url, {}, function (err, result) {
                assert.typeOf(result, 'undefined');
                assert(err instanceof Error);
                expect(err.message).not.to.equal("Dude, your GET failed!");

                done();

            });
            requests[0].respond(404, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        //===========================================
        //  Success and Error promise responses
        //===========================================
        it("GET success promise should return data", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, {}).then(
                function success (result) {
                    assert.typeOf(result, 'object');
                    expect(result).to.deep.equal({foo : 'bar'});

                    // Check the request
                    var parts = requests[0].url.split('?');
                    var params = parts[1] || "";
                    expect(parts[0]).to.contain(url);
                    expect(params).to.equal("");

                    done();
                },
                function err (error) {
                    assert(true);
                    done()
                }
            );

            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        it("GET response promise error should return message", function (done) {
            var data = {status : "error", message : "Dude, your GET failed!"};

            service.get(url, {}).then(
                function success (result) {
                    assert(true);
                    done();
                },
                function err (error) {
                    assert(error instanceof Error);
                    expect(error.message).to.equal("Dude, your GET failed!");
                    done()
                }
            );
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });

        it("GET promise server error should return server message", function (done) {
            var data = {status : "error", message : "Dude, your GET failed!"};
            service.get(url, {}).then(
                function success (result) {
                    assert(true);
                    done();
                },
                function err (error) {
                    assert(error instanceof Error);
                    expect(error.message).not.to.equal("Dude, your GET failed!");
                    done()
                }
            );
            requests[0].respond(404, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        //===========================================
        //  Invalid URL
        //===========================================

        it("GET call with invalid URL with params", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            var url = undefined;
            service.get(url, {foo : 'bar', bar : 'foo'}, function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                assert.typeOf(requests[0].url, 'string');
                expect(params).to.contain("foo=bar");
                expect(params).to.contain("bar=foo");

                done();


            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        //===========================================
        //  Parameter passing
        //===========================================

        it("GET call with parameters", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, {foo : 'bar', bar : 'foo'}, function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                expect(parts[0]).to.contain(url);
                expect(params).to.contain("foo=bar");
                expect(params).to.contain("bar=foo");

                done();


            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));

        });


        it("GET call with 2 arguments gets converted to null parameters", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                expect(parts[0]).to.contain(url);
                expect(parts[1]).to.equal("");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));


        });

        it("GET call with invalid parameters argument (string) gets ignored", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, "foobar", function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                expect(parts[0]).to.contain(url);
                expect(params).to.equal("");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));


        });

        it("GET call with invalid parameters argument (array) gets ignored", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, ["foo", "bar"], function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                expect(parts[0]).to.contain(url);
                expect(params).to.equal("");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));


        });

        it("GET call with invalid parameters argument (null) gets ignored", function (done) {
            var data = {status : "success", data : {foo : 'bar'}};
            service.get(url, null, function (err, result) {
                // Check the response
                assert.typeOf(err, 'null');
                assert.typeOf(result, 'object');
                expect(result).to.deep.equal({foo : 'bar'});

                // Check the request
                var parts = requests[0].url.split('?');
                var params = parts[1] || "";
                expect(parts[0]).to.contain(url);
                expect(params).to.equal("");

                done();

            });
            requests[0].respond(200, {'Content-Type' : 'application/json'}, JSON.stringify(data));


        });


    })
});