var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var logger = require('../../../src/controllers/logging_controller');

// Rewire the service class
var mockHTTP = require('../../mocks/mock_http_service');
logger.__set__("http", mockHTTP);

describe("Logger Controller", function () {
    var svc = logger.__get__("http");
    var sandbox, spy;


    describe("APIs", function () {
        it("should have a Log Error function", function () {
            assert.typeOf(logger.logError, 'function');
            assert.typeOf(logger.logException, 'function');
        });
    });

    describe("LogException", function () {

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            spy = sandbox.spy(svc, "post");
        });

        afterEach(function () {
            svc.reset();
            sandbox.restore();
        });

        it("Should NOT log an error", function (done) {
            logger.logException("foo");
            expect(spy.called).to.equal(false);
            done();
        });

        it("Should log an error", function (done) {
            logger.logException(new Mojo.Exception("test", "test"));
            expect(spy.called).to.equal(true);
            done();
        })
    });

    describe("LogError", function () {

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            spy = sandbox.spy(svc, "post");
        });

        afterEach(function () {
            svc.reset();
            sandbox.restore();
        });

        it("Should NOT log an error", function (done) {
            logger.logError();
            expect(spy.called).to.equal(false);
            done();
        });

        it("Should log an error if passed an exception", function (done) {
            logger.logError(new Mojo.Exception("test", "test"));
            expect(spy.called).to.equal(true);
            done();
        })

        it("Should log an error if passed a string", function (done) {
            logger.logError("test");
            expect(spy.called).to.equal(true);
            done();
        })
    });


});