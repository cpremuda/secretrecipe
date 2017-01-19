var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var auth = require('../../../src/controllers/auth_controller');


// Rewire the service class
var mockHTTP = require('../../mocks/mock_http_service');
auth.__set__("http", mockHTTP);


describe("Auth Controller", function () {

    var svc = auth.__get__("http");
    var sandbox, spy;
    var _pub = Mojo.publish;

    beforeEach(function () {
        Mojo.publish = function () {
        };
    });

    afterEach(function () {
        Mojo.publish = _pub;
    });

    describe("APIs", function () {
        it("should have a get logged in function", function () {
            assert.typeOf(auth.isLoggedIn, 'function');
        });
        it("should have a get login function", function () {
            assert.typeOf(auth.login, 'function');
        });
        it("should have a createAccount function", function () {
            assert.typeOf(auth.createAccount, 'function');
        });
        it("should have a logout function", function () {
            assert.typeOf(auth.logout, 'function');
        });
    });

    describe("Is Logged In", function () {
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            spy = sandbox.spy(svc, "get");
        });

        afterEach(function () {
            sandbox.restore();
            svc.reset();
            Mojo.clearData("authModel");
        });

        it("Should be logged in", function (done) {
            svc.mockResponse = {success : true, ticket : 132, userid : 456};
            auth.isLoggedIn().then(
                function (result) {
                    assert.typeOf(result, 'boolean');
                    expect(Mojo.getDataVal("authModel", "loggedIn")).to.equal(true);
                    done();

                },
                function err (err) {
                    done();

                });
        });

        it("Should be not logged in", function (done) {
            svc.mockError = "TestError";
            svc.mockResponse = {success : true, ticket : 132, userid : 456};
            auth.isLoggedIn().then(
                function success (result) {
                    expect(Mojo.getDataVal("authModel", "loggedIn")).to.equal(false);
                    done();
                },
                function err (err) {
                    assert(false);
                    done();
                });
        });
    });

});