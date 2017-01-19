var should = require('chai').should;
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var config = require('../../../src/controllers/config_controller');

// Rewire the service class
var mockHTTP = require('../../mocks/mock_http_service');
config.__set__("http", mockHTTP);

describe("Config Controller", function () {
    var svc = config.__get__("http");
    var sandbox, spy;

    afterEach(function () {
        Mojo.options.alertOnExceptions = false;
        Mojo.enableTraceConsole(false);
    });

    describe("APIs", function () {
        var setTimeout = config.__get__("setTimeout");
        it("should have a get Version function", function () {
            assert.typeOf(config.getVersions, 'function');
            assert.typeOf(config.enableQA, 'function');
            assert.typeOf(config.queryString, 'object');
            assert.typeOf(setTimeout, 'function');
        });
    });

    describe("Get Node Versions", function () {
        var _privateGetNV = config.__get__("_getRuntimeEnv");

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            spy = sandbox.spy(svc, "get");
        });

        afterEach(function () {
            svc.reset();
            sandbox.restore();
            Mojo.clearData("configModel");

        });

        it("should have a get Version function", function () {
            assert.typeOf(_privateGetNV, 'function');
        });

        // Error conditions
        //==============================
        it("Should NOT set versions in the model with promise", function (done) {
            svc.mockError = "version error";

            _privateGetNV().then(
                function success () {
                    assert(true)
                },
                function err (error) {
                    assert(error instanceof Error);
                    expect(Mojo.getDataVal("configModel", "appVersion")).to.equal(undefined);
                    expect(Mojo.getDataVal("configModel", "env")).to.equal(undefined);

                }
            );
            expect(spy.called).to.equal(true);
            done();
        });

        it("Should NOT set versions in the model with callback", function (done) {
            svc.mockError = "version error";

            _privateGetNV(function (err, results) {

                assert.typeOf(results, 'undefined');
                assert(err instanceof Error);

                expect(Mojo.getDataVal("configModel", "appVersion")).to.equal(undefined);
                expect(Mojo.getDataVal("configModel", "env")).to.equal(undefined);

            });
            expect(spy.called).to.equal(true);
            done();
        });

        // Success conditions
        //==============================
        it("Should set versions in the model with promise", function (done) {
            svc.mockResponse = {env : "test", version : "1.0.1", uiConfigurables : {UISavingUserDataEnabled : true, UIRetrievingUserDataEnabled: true, capAssistEnabled:true}};

            _privateGetNV().then(
                function success () {
                    expect(Mojo.getDataVal("configModel", "appVersion")).to.equal("1.0.1");
                    expect(Mojo.getDataVal("configModel", "env")).to.equal("test");
                    expect(config.supports.saveUserData).to.equal(true);
                    expect(config.supports.retrieveUserData).to.equal(true);
                    expect(config.supports.capAssist).to.equal(true);
                },
                function err (error) {
                    assert(true)
                }
            );
            expect(spy.called).to.equal(true);
            done();
        });

        it("Should set versions in the model with callback", function (done) {
            svc.mockResponse = {_env : "test", _version : "1.0.2", uiConfigurables : {UISavingUserDataEnabled : true, UIRetrievingUserDataEnabled: true, capAssistEnabled:true}};

            _privateGetNV(function (err, results) {

                assert.typeOf(err, 'null');

                expect(Mojo.getDataVal("configModel", "appVersion")).to.equal("1.0.2");
                expect(Mojo.getDataVal("configModel", "env")).to.equal("test");
                expect(config.supports.saveUserData).to.equal(true);
                expect(config.supports.retrieveUserData).to.equal(true);
                expect(config.supports.capAssist).to.equal(true);

            });
            expect(spy.called).to.equal(true);
            done();
        });

        // Unexpected Response data
        it("Should not set data for unexpected response data", function (done) {
            svc.mockResponse = {_env : "test", _version : "1.0.2", uiConfigurables : {UISavingUserDataEnabled : true, UIRetrievingUserDataEnabled: true, capAssistEnabled:true}};

            _privateGetNV(function (err, results) {

                assert.typeOf(err, 'null');

                expect(Mojo.getDataVal("configModel", "appVersion")).to.equal(undefined);
                expect(Mojo.getDataVal("configModel", "env")).to.equal(undefined);
                expect(config.supports.saveUserData).to.equal(undefined);
                expect(config.supports.retrieveUserData).to.equal(undefined);
                expect(config.supports.capAssist).to.equal(undefined);

            });
            expect(spy.called).to.equal(true);
            done();
        });


    });


    describe("Get Versions", function () {
        Mojo.setDataVal("configModel", "env", "test")
        Mojo.setDataVal("configModel", "uiVersion", "1")
        Mojo.setDataVal("configModel", "appVersion", "2");

        var rtn = config.getVersions();

        it("should return an object", function () {
            expect(rtn).to.be.a("object")
        });
        it("should have a env", function () {
            expect(rtn.env).to.equal("test")
        })
        it("should have a uiVersion", function () {
            expect(rtn.ui).to.equal("1")
        })
        it("should have a app Version", function () {
            expect(rtn.app).to.equal("2")
        })
    });


    describe("Enable QA", function () {


        var TraceSpy = sinon.spy(Mojo, "enableTraceConsole");
        var PanelSpy = sinon.spy(Mojo, "addDebugPanel");

        config.enableQA();


        it("should have a debug panel", function () {
            expect(TraceSpy.called).to.equal(true);
        });
        it("should have a 2 added panels", function () {
            expect(PanelSpy.called).to.equal(true);
        });


    });

    describe("Get Starting Flow", function () {
        var flow;
        config.queryString = {};


        flow = config.getStartingFlow();
        expect(flow).to.equal('mainflow');

        config.queryString = {startpage : 'learnmore'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt');

        config.queryString = {startpage : 'hub'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt~FLOW_authentication');

        config.queryString = {startpage : 'foobar'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mainflow');

        config.queryString = {benefit : 'snap'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt~FLOW_snap');

        config.queryString = {benefit : 'unclaimedfunds'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt~FLOW_unclaimed');

        config.queryString = {benefit : 'lifeline'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt~FLOW_lifeline');

        config.queryString = {benefit : 'fafsa'};
        flow = config.getStartingFlow();
        expect(flow).to.equal('mytt~FLOW_fafsa');

    });

    describe("Set Current Benefit Model", function () {

        config.queryString = {benefit : 'snap', name : 'FOO'};

        config.setCurrentBenefitModel();
        var cbm = Mojo.getAllDataInModel('currentBenefitModel');

        it("should return an object", function () {
            expect(cbm).to.be.a("object")
        });
        it("should have a benefit", function () {
            expect(cbm.benefit).to.equal("snap")
        });
        it("should have a name", function () {
            expect(cbm.name).to.equal("FOO")
        });


    });

    describe("Set Current Benefit Model with info", function () {

        var info = {benefit : 'snap', name : 'FOO'};

        config.setCurrentBenefitModel(info);
        var cbm = Mojo.getAllDataInModel('currentBenefitModel');

        it("should return an object", function () {
            expect(cbm).to.be.a("object")
        });
        it("should have a benefit", function () {
            expect(cbm.benefit).to.equal("snap")
        });
        it("should have a name", function () {
            expect(cbm.name).to.equal("FOO")
        });

    });

    describe("Clear Current Benefit Model", function () {

        config.queryString = {benefit : 'snap', name : 'FOO'};

        config.setCurrentBenefitModel();
        var cbm = Mojo.getAllDataInModel('currentBenefitModel');

        it("should return an object", function () {
            expect(cbm).to.be.a("object")
        });

        it("should have a name", function () {
            config.clearCurrentBenefitModel();
            expect(cbm.name).to.be.a("undefined")
        });

    });



});