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
    var _pub = Mojo.publishEvent;

    beforeEach(function () {
        Mojo.publishEvent = function () {
        };
    });

    afterEach(function () {
        Mojo.publishEvent = _pub;
    });

    describe("APIs", function () {
        it("should have a get logged in function", function () {
            assert.typeOf(auth.isLoggedIn, 'function');
        });
        it("should have a get initWidget function", function () {
            assert.typeOf(auth.initWidget, 'function');
        });
        it("should have a loadIUSScript function", function () {
            assert.typeOf(auth.loadIUSScript, 'function');
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
            Mojo.clearData("APPLICATION_SCOPE");
        });

        it("Should be logged in", function (done) {
            svc.mockResponse = {success : true, ticket : 132, userid : 456};
            auth.isLoggedIn().then(
                function (result) {
                    assert.typeOf(result, 'boolean');
                    expect(Mojo.getDataVal("APPLICATION_SCOPE", "isAuth")).to.equal(true);
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
                    expect(Mojo.getDataVal("APPLICATION_SCOPE", "isAuth")).to.equal(false);
                    done();
                },
                function err (err) {
                    assert(false);
                    done();
                });
        });
    });


    describe("Load Script", function () {
        var sandbox, spy1, spy2, spy3;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });


        it("Should load the IUS script", function (done) {

            auth.loadIUSScript().then(
                function success() {
                    done();
                },
                function error() {
                    done();
                }
            );

        });

    });

    describe("Init Widget", function () {
        var sandbox, spy1, spy2, spy3;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            spy1 = sandbox.spy(intuit.ius.signIn, "setup");
            spy2 = sandbox.spy(intuit.ius.accountRecovery, "setup");
            spy3 = sandbox.spy(intuit.ius.signUp, "setup");
        });

        afterEach(function () {
            sandbox.restore();
        });


        it("Should set up the IUS widget", function (done) {

            auth.initWidget();

            expect(spy1.called).to.equal(true);
            expect(spy2.called).to.equal(true);
            expect(spy3.called).to.equal(true);
            done();
        });

    });
});