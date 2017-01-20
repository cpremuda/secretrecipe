var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var APP = require('../../src/index');

describe("MY_APP", function () {

    beforeEach(function (){
    });

    describe("APIs", function () {
        it("should have a get version function", function () {
            assert.typeOf(APP.getVersions, 'function');
        });

    });

    describe("Get Version API", function () {
        var v = APP.getVersions();

        expect(v).to.be.a('object')
    });

    describe("Controllers", function () {
        it("should expose a set of controllers", function () {
            assert.typeOf(APP.controllers, 'object');
        });
        it("should expose a logger controller", function () {
            assert.typeOf(APP.controllers.logger, 'object');
        });
        it("should expose a auth controller", function () {
            assert.typeOf(APP.controllers.auth, 'object');
        });
        it("should expose a config controller", function () {
            assert.typeOf(APP.controllers.config, 'object');
        });
    });

    describe("Constants", function () {
        it("should expose constants", function () {
            assert.typeOf(APP.constants, 'object');
        });
    });

});