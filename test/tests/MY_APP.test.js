var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var APP = require('../../src/MY_APP');

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
        it("should have a set of controllers", function () {
            assert.typeOf(APP.controllers, 'object');
        });
        it("should have a data controller", function () {
            assert.typeOf(APP.controllers.data, 'object');
        });
        it("should have a logger controller", function () {
            assert.typeOf(APP.controllers.logger, 'object');
        });
        it("should have a search controller", function () {
            assert.typeOf(APP.controllers.search, 'object');
        });
        it("should have a config controller", function () {
            assert.typeOf(APP.controllers.config, 'object');
        });
    });



    //describe("Pre-Init", function () {
    //    it("Should have created a search Model" , function () {
    //        expect(Mojo.getModels()).not.to.contain("searchModel");
    //    });
    //    it("Should have created a search results Model" , function () {
    //        expect(Mojo.getModels()).not.to.contain("searchResultsModel");
    //    });
    //});
    //
    //describe("Init", function () {
    //    it("Should have created a search Model" , function () {
    //        APP.init();
    //        expect(Mojo.getModels()).to.contain("searchModel");
    //        expect(Mojo.getModels()).to.contain("searchResultsModel");
    //    });
    //    it("Should NOT have created a search results Model due to double init" , function () {
    //        APP.init();
    //        expect(Mojo.getModels()).not.to.contain("searchModel");
    //        expect(Mojo.getModels()).not.to.contain("searchResultsModel");
    //    });
    //});
});