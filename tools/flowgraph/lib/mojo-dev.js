/**
 * @developers Greg Miller, Larry Buzi, Larry Xu, Jon Helsten, Mike O'Neill, Dianne Bautista
 *
 * When working on a web application that involves a lot of JavaScript, one of the first things you learn is to stop tying your data to the DOM.
 * It's all too easy to create JavaScript applications that end up as tangled piles of jQuery selectors and callbacks, all trying frantically to
 * keep data in sync between the HTML UI, your JavaScript logic, and the database on your server. For rich client-side applications,
 * a more structured approach is often helpful.
 *
 * With Mojo, you represent your data as Models, which can be created, validated, destroyed, and saved to the server.
 * Whenever a UI action causes an attribute of a model to change, the model triggers a "change" event; all the Views that display the model's
 * state can be notified of the change, so that they are able to respond accordingly, re-rendering themselves with the new information.
 * In a finished Mojo app, you don't have to write the glue code that looks into the DOM to find an element with a specific id,
 * and update the HTML manually — when the model changes, the views simply update themselves.
 *
 * In Mojo, you define your views in simple HTML and add Mojo specific attributes to DOM elements to hook up feature rich functionality such as data-binding,
 * input formatting and validation, and navigation. No special tools are required to create your views. You can hand-code them if you are so inclined,
 * or use some off the shelf tool for development or templating.
 *
 * Hooking it all together is the Mojo Flow Controller. A configuration driven state machine that take references to your views and strings them together
 * in a page to page flow. You provide the transition logic in a configuration file, and Mojo handles the rest.
 *
 *
 * Mojo JavaScript MVC Framework v0.9.23
 *
 * (c) 2012 Intuit, Inc.
 *     - http://mojo.intuit.com/
 *
 **/
//TODO: make it work with "use strict";

(function (window) {
    var Mojo = window["Mojo"] = {};
    Mojo.version = "0.9.23";

// ===============================================================
// Set up for exporting aliases to internal functionality
// ===============================================================
    Mojo.exportSymbol = function (publicPath, object) {
        var tokens = publicPath.split(".");
        var target = window;
        for (var i = 0; i < tokens.length - 1; i++)
            target = target[tokens[i]];
        target[tokens[tokens.length - 1]] = object;
    };
    Mojo.exportProperty = function (owner, publicName, object) {
        owner[publicName] = object;
    };

// ===============================================================
// Define Namespaces
// ===============================================================
    Mojo.application = {};
    Mojo.interfaces = {};
    Mojo.utils = {};
    Mojo.formatter = {};
    Mojo.events = {};
    Mojo.inputStrategies = {};
    Mojo.inputStrategies.validator = {};
    Mojo.flow = {};
    Mojo.model = {};
    Mojo.components = {};
    Mojo.uiComponents = {};
    Mojo.constants = {};

// ===============================================================
// Group : API
// Mojo API
// ===============================================================
Mojo.getVersion = function () { return Mojo.version; };

//------------------------------------------------------------
//    Function : init
//    Initialize the Mojo framework with a set of configuration parameters
//
//    Parameters : config - name value pairs that match Mojo.application.options
//------------------------------------------------------------
    Mojo.init = function (config) {
        if (config.enableTraceConsole) Mojo.enableTraceConsole();
        // load up the default strategies
        if(config.useValidator || config.useFormatter)
            Mojo.inputStrategies.strategies.addStrategies(Mojo.inputStrategies.defaultStrategies);

        // Copy the properties into the Mojo.options
        // It will filter out all the crap
        for (var name in config) {
            MojoOptions.setOption(name, config[name])
        }
        MojoOptions.validate();

        config = null;

        if (MojoOptions.modelDefConfig && !Mojo.components.registry.has("modelDefResolver"))
            Mojo.registerComponent(new Mojo.components.modelDefResolver(MojoOptions.modelDefConfig));
        if (!Mojo.components.registry.has("expressionEvaluator"))
            Mojo.registerComponent(new Mojo.components.expressionEvaluator());
        if (!Mojo.components.registry.has("viewResolver"))
            Mojo.registerComponent(new Mojo.components.viewResolver(MojoOptions.viewResolverOptions));
        if (!Mojo.components.registry.has("flowResolver"))
            Mojo.registerComponent(new Mojo.components.flowResolver(MojoOptions.flowResolverOptions));
        if (!Mojo.components.registry.has("actionExecutor"))
            Mojo.registerComponent(new Mojo.components.actionExecutor(MojoOptions.actionOptions));
        if(!Mojo.components.registry.has("screenTransitioner"))
            Mojo.registerComponent(new Mojo.components.screenTransitioner());
        if(!Mojo.components.registry.has("modalwindow"))
            Mojo.registerComponent(new Mojo.components.ModalWindow());
        if(!Mojo.components.registry.has("abTestResolver"))
            Mojo.registerComponent(new Mojo.components.abTestResolver(MojoOptions.ABTestConfig));
        Mojo.application.applicationController.init();
    };

//----------------------------------------------
// Dependency Injection Strategy
//----------------------------------------------

    // Register a custom component that implements a Mojo interface. 
    // Will be used in the application instead of the default Mojo one.
    Mojo.registerComponent = function (component) {
        Mojo.components.registry.registerComponent(component);
    };
    // Return a registered component
    Mojo.getComponent = function (interfaceType) {
        return Mojo.components.registry.get(interfaceType);
    };

//----------------------------------------------
// Fire up the state machine
//----------------------------------------------
    Mojo.setViewport = function (containerId) {
        Mojo.application.applicationController.setViewPort(containerId);
    };
    Mojo.getSome = function (flowName, options, inputVars, endCallback) {
         Mojo.application.applicationController.startflow(flowName, options, inputVars, endCallback);
    };

    Mojo.loadPage = function (pgAlias, options, endCallback) {
        Mojo.application.applicationController.loadPage(pgAlias, options, endCallback);
    };


    Mojo.addDAO = function (name, DAOImpl) {
        Mojo.model.DAOManager.addDAO(name, DAOImpl);
    };

    /**
     * Add a model, optionally from a model definition file, and call a callback when done
     * @param args object containing one or more optional properties:
     *       modelName:   string name of model
     *       className:   string that is the class of the model to create - defaults to "Mojo.model.dataModel"
     *       daoName:     name of DAO
     *       groupId:     name of a group to associate this model with (can be an array)
     *       defFileName: string of JSON file containing the model definition
     *       model:       an instance of Mojo.DataModel, if this is passed then modelName and defFileName are ignored
     *       callback:    function called when model is added and (optionally) its data is loaded
     *
     * @returns model that was created
     */
    Mojo.addModel = function (args) {
        var model;

        //================= START DEPRECATED ====================

        // handle the old, deprecated usage first (modelName, daoName, defFileName)
        if (typeof args === "string") {
            var modelName = args;
            var daoName = arguments[1];
            var defFileName = arguments[2];
            TRACE("Mojo.addModel() now takes an object", ["Mojo", "addModel"], Mojo.utils.trace.WARN);
            if (Mojo.model.registry.has(modelName)) {
                TRACE("addModel: Model '" + modelName + "' already exists. Not adding model");
                return null;
            }

            model = new Mojo.DataModel({name:modelName, defName:defFileName});
            Mojo.model.registry.addModel(model);
            if (daoName) {
                Mojo.model.registry.associateWithDAO(model, daoName);
            }
            return model;
        }
        // adding a model that's already been created.  this usage is kept for backwards compatibility.
        else if (args instanceof Mojo.DataModel) {
            model = args;
            var modelName = model.getName();
            if (Mojo.model.registry.has(modelName)) {
                TRACE("addModel: Model '" + modelName + "' already exists. Not adding model");
                return null;
            }
            Mojo.model.registry.addModel(model);
            if (arguments.length !== 1) {
                TRACE("When passing in a model, no other parameters are accepted", ["Mojo", "addModel"], Mojo.utils.trace.WARN);
            }
            return model;
        }
        //================= END DEPRECATED ====================

        else if(typeof args === "object") {
            if (typeof args.model === "string") {
                TRACE("Pass in model name as modelName property", ["Mojo", "addModel"], Mojo.utils.trace.WARN);
                args.modelName = args.model;
            }
            // adding a model that's already been created
            if(args.model instanceof Mojo.DataModel) {

                // If the model already exists, get out cheap
                if (!args.autoLoad && Mojo.model.registry.has(arg.model.getName())) {
                    TRACE("addModel: Model '" + arg.model.getName() + "' already exists. Not adding model.");
                    model = Mojo.getModel(args.model.getName());
                    if(args.callback) {
                        args.callback(model);
                    }
                    return model;
                }

                Mojo.model.registry.addModel(args.model);

                if (args.daoName) {
                    Mojo.model.registry.associateWithDAO(args.model, args.daoName);
                }
                // autoLoad is not supported when a model is passed in to addModel
                if(args.callback) {
                    args.callback(args.model);
                }
                return args.model;
            }
            else if (typeof args.modelName === "string") {
                if (!args.autoLoad && Mojo.model.registry.has(args.modelName)) {
                    TRACE("addModel: Model '" + args.modelName + "' already exists. Not adding model.");
                    if(args.callback) {
                        args.callback(Mojo.getModel(args.modelName));
                    }
                    return null;
                }

                var className =  args.className || MojoOptions.defaultModelClass || "Mojo.model.dataModel";
                var mdlConstrucor = Mojo.utils.stringToFunction(className);
                model = new mdlConstrucor({
                    name:args.modelName,
                    defName:args.defFileName,
                    groupId : args.groupId,
                    async: true,
                    callback: function(model) {
                        Mojo.model.registry.addModel(model);

                        if (args.daoName) {
                            Mojo.model.registry.associateWithDAO(model, args.daoName);
                        }
                        //================= START DEPRECATED ====================
                        if(args.autoLoad) {
                            TRACE("autoLoad is deprecated.  use Mojo.loadData with an array of model names instead.", ["Mojo", "addModel"], Mojo.utils.trace.WARN);
                            Mojo.loadData(model.getName(), null, function(success) {
                                if(args.callback) {
                                    var result = success ? model : null;
                                    args.callback(result);
                                }
                            });
                        }
                        //================= END DEPRECATED ====================
                        else {
                            if(args.callback) {
                                args.callback(model);
                            }
                        }
                    }
                });
            }
            else {
                TRACE("Mojo.addModel() called with invalid parameters", ["Mojo", "addModel"], Mojo.utils.trace.ERROR);
            }

            return model;
        }
    };

    /**
     * Add an array of models asynchronously, optionally loading the data for each
     * @param models  array of models, each item is an object with one or more of these properties:
     *       modelName:   string name of model
     *       className:   string that is the class of the model to create - defaults to "Mojo.model.dataModel"
     *       daoName:     name of DAO
     *       defFileName: string of JSON file containing the model definition
     *       model:       an instance of Mojo.DataModel, if this is passed then modelName and defFileName are ignored
     *       autoLoad:    boolean indicating whether to asynchronously load the model's data from the DAO before calling the callback
     * @param success callback function to call when the loading completes successfully
     * @param error   callback function to call if there are errors
     */
    Mojo.addModels = function(models, success, error) {
        var modelsToLoad = models.length;
        var modelsLoaded = 0;
        var hasErrors = false;

        var modelLoaded = function(model) {
            modelsLoaded += 1;
            if(!model) {
                TRACE("Error loading model ", ["Mojo.addModels", ""], Mojo.utils.trace.ERROR);
                hasErrors = true;
            }
            if(modelsLoaded === modelsToLoad) {
                if(hasErrors && error) {
                    error();
                }
                else if(!hasErrors && success) {
                    success();
                }
            }
        };
        for(var i = 0; i < modelsToLoad; i++) {
            jQuery.extend(models[i], {callback:modelLoaded});
            Mojo.addModel(models[i]);
        }
    };

    Mojo.removeModel = function (name) {
        Mojo.model.registry.removeModel(name);
    };

    Mojo.getModel = function (name) {
        return Mojo.model.registry.getModel(name);
    };

    Mojo.getModelNamesinSystem = function () {
        return Mojo.model.registry.getModelNamesinSystem();
    };

    /**
     * Load a combined model definition file asynchronously, and cache the individual definitions
     * @param defsFile - path to combined model definition file
     * @param callback - called when loaded
     */
    Mojo.loadModelDefinitions = function(defsFile, callback) {
        var resolver = Mojo.getComponent("modelDefResolver");
        resolver.loadModelDefinitions(defsFile, callback);
    };

    /**
     * return the model definition as a JSON object
     * @param name - the name of the model
     */
    Mojo.getModelDef = function (name) {
        TRACE("Deprecated useage.  Use getModelDefinition to get an instance of Mojo.model.ModelDefinition", ["Mojo", "getModelDef"], Mojo.utils.trace.WARN);
        return Mojo.model.registry.getModelDef(name);
    };

    /**
     * return the model definition as an instance of Mojo.model.ModelDefinition
     * @param name - the name of the model
     */
    Mojo.getModelDefinition = function(name) {
        return Mojo.model.registry.getModelDefinition(name);
    };

    /**
     * Set a single data value
     * @param modelName - the name of the model
     * @param key - the name of the model's property to set
     * @param val - the value for the name/value pair
     * @param options - optional object with one or more of the following properties:
     *          silent - boolean to specify that event should not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     */
    Mojo.setData = function (modelName, key, val, options) {
        Mojo.model.registry.setData(modelName, key, val, options);
    };

    /**
     * Set a single data value value within a collection
     * @param modelName - the name of the model
     * @param key - the name of the model's property to set
     * @param index - the index within the collection
     * @param val - the value for the name/value pair
     * @param options - optional object with one or more of the following properties:
     *          silent - boolean to specify that event should not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     */
    Mojo.setDataInCollection = function (modelName, key, index, val, options) {
        Mojo.model.registry.setDataInCollection(modelName, key, index, val, options);
    };

    /**
     * Get a model property value
     * @param modelName - the name of the model
     * @param key - the name of the model's property
     * @return {*} - the value of the model's property
     */
    Mojo.getData = function (modelName, key) {
        return Mojo.model.registry.getData(modelName, key);
    };

    Mojo.getDataVal = function (name) {
        return Mojo.model.registry.getDataVal(name);
    };

    /**
     * Set a single data value
     * @param name - the name or key for the name/value pair
     * @param val - the value for the name/value pair
     * @param options - optional object with one or more of the following properties:
     *          silent - boolean to specify that event should not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     */
    Mojo.setDataVal = function (name, val, options) {
        Mojo.model.registry.setDataVal(name, val, options);
    };

    /*
     If no model name is specified, it will apply to ALL models
     If not strategy name, it will use the default strategy assigned when the model was created
     modelNames can be an array, in which case callback is required and the loading is async,
        or it can be a string with a single model name, in which case the callback is optional
     */
    Mojo.loadData = function (modelNames, strategyName, callback) {
        Mojo.model.DAOManager.load(modelNames, strategyName, callback);
    };
    Mojo.saveData = function (modelName, strategyName, callback) {
        Mojo.model.DAOManager.save(modelName, strategyName, callback);
    };
    Mojo.clearData = function (bIncludePersistedData, modelName) {
        if (bIncludePersistedData) {
            Mojo.model.DAOManager.destroy(modelName);
        }
        Mojo.model.registry.clear(modelName);
    };
    Mojo.addValidationStrategy = function (strategyName, strategyObj) {
        Mojo.inputStrategies.validator.engine.addValidationStrategy(strategyName, strategyObj);
    };
    Mojo.addValidationStrategies = function (strategies) {
        Mojo.inputStrategies.validator.engine.addValidationStrategies(strategies);
    };
    Mojo.setABTests = function (testVals) {
        var abtestResolver = Mojo.getComponent(Mojo.interfaces.abTestResolver);
        abtestResolver.setABTests(testVals);
    };

    /*********************************************************
     // Bind to an any loaded data models and set up 2 way binding of values set from other elements
     // Bind events to "a" tags
     // Set up formatters and validators
     //
     // Parameters:
     //    containerId - the dom element identifier
     //                  or a jQuery element
     **********************************************************/
    Mojo.applyBindings = function (containerId) {
        var $container = (containerId instanceof jQuery)?containerId:jQuery("#" + containerId);

        Mojo.bindings.resolveText($container);
        Mojo.bindings.bindIterators($container);
        Mojo.bindings.bindLayout($container);
        Mojo.bindings.bindComponents($container);
        Mojo.bindings.bindData($container);
        Mojo.bindings.bindEvents($container);

        // Set formatters to elements that need them - 
        //     do this after bind data will so we can auto format if there is a formatter
        // Give control back to the browser for a split second so that functionality from the 
        //     bindData is acknowledged by the DOM
        if (MojoOptions.useFormatter) {
            setTimeout(function () {Mojo.bindings.bindFormatters($container);}, 0);
        }

        Mojo.publishEvent(Mojo.constants.events.kBindingsApplied);
    };

    /*********************************************************
     // Unbind from jQuery and internal events so that memory can be cleaned up
     **********************************************************/
    Mojo.unbind = function (domElementId) {
        Mojo.bindings.unbindAll(domElementId);

        Mojo.publishEvent(Mojo.constants.events.kBindingsRemoved);
    };

    /*********************************************************
    // Enable screen validation
    **********************************************************/
    Mojo.validateSection = function (containerID, displayError){
        return Mojo.application.applicationController.validateSection(containerID, displayError);
    };

// Exports 
//  - to be uncommented when file is compiled into one large js file
//======================================   
// Console.js
//  Mojo.exportProperty(Mojo, 'enableTraceConsole', Mojo.utils.trace.enable);    
//  Mojo.exportProperty(Mojo, 'disableTraceConsole', Mojo.utils.trace.disable);    
//  Mojo.exportProperty(Mojo, 'openConsole', Mojo.utils.trace.openWindow);    
//  Mojo.exportProperty(Mojo, 'closeConsole', Mojo.utils.trace.closeWindow);    
//  Mojo.exportProperty(window, 'TRACE', Mojo.utils.trace.send);    

// RemoteStorageModel.js
//Mojo.exportSymbol('Mojo.RemoteStorageModel', Mojo.model.remoteStorageModel);        

// LocalStorageModel.js
//Mojo.exportSymbol('Mojo.LocalStorageModel', Mojo.model.localStorageModel);      

// DataModel.js
//Mojo.exportSymbol('Mojo.InMemoryModel', Mojo.model.modelBaseClass);     


})(window);
Mojo.constants.components = {
    EVENT : "Event",
    FLOW_RESOLVER : "FLOW RESOLVER",
    VIEW_RESOLVER : "VIEW RESOLVER",
    ACTION_EXECUTOR : "ACTION EXECUTOR",
    MODELDEF_RESOLVER : "MODLE DEF RESOLVER",
    FLOW : "FLOW",
    MODEL : "MODEL"
};

Mojo.constants.events = {
    kValidationFailed : "validationFailed",
    kException : "exception",
    kDataChange : "dataChange",
    kNavigation : "navigation",
    kBeforePageLoad : "beforePageLoad", /* new page is about to be loaded */
    kPageLoaded : "pageLoaded", /* new page is loaded */
    kPageFinalized : "pagefinal", /* new page is completed loading and all processing is done */
    kBeforePageUnload : "endPage", /* page is about to be blown away */
    kBindingsApplied : "bindingsApplied", /* bindings have been applied to the new page*/
    kBindingsRemoved : "bindingsRemoved",
    kProfile : "profile", /* profiling is finished  - publishers should publish the Mojo.utils.profiler object */
    kModelCreated : "modelCreated",
    kModelRegistered : "modelRegistered",
    kFlowStart : "startFlow",
    kFlowTransition : "flowTransition",
    kFlowEnd : "endFlow",
    kStartModalFlow : "startModalFlow",
    kEndModalFlow : "endModalFlow",
    kEndMojo : "endMojo"
};

Mojo.constants.scopes = {
    kApplicationScope : "APPLICATION_SCOPE",
    kFlowScope : "FLOW_SCOPE",
    kViewScope : "VIEW_SCOPE"
};

Mojo.constants.validateWhenEmpty = ["required", "groupRequired", "groupRequiredMultiple"];
Mojo.constants.functionResolutionRegex = /\$\[fn:(.*?)(\((.*?)\))?\]/g;
Mojo.constants.functionRegex = /^(.*?)(\((.*?)\))?$/;

Mojo.constants.nameSpaceRegex = /^([^\s\r\n\'\"]+)\.([^\s\r\n\'\"]+)$/;
Mojo.constants.modelNameRegex = /(^[^\s\r\n\'\"]+)$/;

Mojo.constants.modelRegexStr = "\\[(([^\\s\\r\\n\'\"]+)\\.([^\\s\\r\\n\'\"]+))\\]";   // the default regex, can contain nested model references
Mojo.constants.modelRegexNonGreedyStr = "\\[(([^\\s\\r\\n\'\"\\]\\$\\[]+)\\.([^\\s\\r\\n\'\"\\]\\$\\[]+))\\]";  // excludes the possibility of nested model references
Mojo.constants.modelDollarRegex = new RegExp("\\$" + Mojo.constants.modelRegexStr);
Mojo.constants.modelDollarRegexGlobal = new RegExp("\\$" + Mojo.constants.modelRegexStr, "g");
Mojo.constants.modelRegex = new RegExp("[@\\$]" + Mojo.constants.modelRegexStr);
Mojo.constants.modelRegexGlobal = new RegExp("[@\\$]" + Mojo.constants.modelRegexStr, "g");
Mojo.constants.flowscopeRefGlobal = /FLOW_SCOPE\.([^\s\r\n\'\"]+)/g;
//Mojo.constants.modelResolutionRegex = /\$\[(([^\s\r\n\'\"]+)\.([^\s\r\n\'\"]+))\]/;
//Mojo.constants.modelAttributeRegex = /@\[(([^\s\r\n\'\"]+)\.([^\s\r\n\'\"]+))\]/;


Mojo.exportSymbol('MojoConstant', Mojo.constants.events);
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
    var initializing = false, fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.construct)
                this.construct.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();
//============================================================================
// class: Exception
// about:	
//  Object to encapsulate Errors generated in the Mojo Framwork	
//
// Copyright <c> 2012 Intuit, Inc. All rights reserved
//============================================================================
var LOG_INFO = "info";
var LOG_WARNING = "warning";
var LOG_ERROR = "error";

Mojo.events.exception = Class.extend({
    // -------------------------------
    // Function: construct
    // construct the exception
    //
    // Parameters:
    //   component - a string to identify the component
    //   msg - the string error message
    //   type - the string error type
    //   ex - the optional exception to be thrown
    // -------------------------------
    construct:function (component/*string*/, msg /*string*/, type/*string*/, ex /*optional - exception thrown*/) {
        this.component = component;
        this.msg = msg;
        this.logType = type ? type : LOG_ERROR;
        this.exeptionObj = ex;
        this.context = new Array();
    },

    // -------------------------------
    // Function: addContext
    // set the context
    //
    // Parameters:
    //   ctx - the context to set
    // -------------------------------
    addContext:function (ctx) {
        this.context.push(ctx);
    }
});

Mojo.exportSymbol('MojoException', Mojo.events.exception);		


/* class: EventPubSub
 *
 * about:
 * 	This is a singleton javascript class that
 *  provides functionality for managing the publication/subscription model for UI related events
 *
 *	Implementation notes:
 * 	This basically is creating an anonymous function and executing it on the spot;
 *		(notice the extra two pairs of open-close parentheses around the Mojo function and the semi-colon at the end.)
 *
 *	Copyright <c> 2012 Intuit, Inc. All rights reserved
 */
Mojo.events.pubsub = (function () {

    var _instance = {

//--------------------------------------------------------------------
// Function: subscribeForEvent
// subscribe to the event; sign up for notification that an event has occurred
//
// Parameters:
//   evt - the event to subscribe to
//   cb - the callback function
//   o - the callback object
//--------------------------------------------------------------------
        subscribeForEvent : function (evt, cb /*function callback*/, o /*callback object*/) {
            if (!_notificationList[evt]) {
                _notificationList[evt] = new Array();
            }
            if (!o) {
                TRACE("Callback object is needed in order to be able to unsubscribe and avoid memory leaks.  evt = " + evt, ["pubsub", "subscribeForEvent"], Mojo.utils.trace.WARN);
                //debugger;
                o = window;
            }

            // Only add the subscription if the object is not already subscribed to the event
            if (!isSubscribed(evt, o, cb)) {
                var evtObj = new Object();
                evtObj.object = o;
                evtObj.callback = cb;
                _notificationList[evt].push(evtObj);
                // Garbage collection in JS is reference counted so a JS object wont get collected if there is a reference to it here in the pub/sub
                // We have to unsubscribe it so it removes the reference and it can be collected.
                // Therefore we need to set an attribute on the object so that it knows that it has subscribed and
                // then the subscribing class we can programatically unsubscribe to events when the object is about to be deleted
                o.subscribedForEvent = true;
            }
        },


//--------------------------------------------------------------------
// Function: unSubscribe
// unsubscribe; remove the object/callback from ALL events
//
// Parameters:
//   o - the callback object
//--------------------------------------------------------------------
        unSubscribe : function (o /*calling object*/) {
            for (var n in _notificationList) {
                this.unSubscribeForEvent(n, o);
            }
        },


//--------------------------------------------------------------------
// Function: unSubscribeForEvent
// unsubscribe for Event; remove the object/callback from the callback list
//
// Parameters:
//   evt - the event to unsubscribe from
//   o - the callback object
//--------------------------------------------------------------------
        unSubscribeForEvent : function (evt, o /*calling object*/) {
            var list = _notificationList[evt];
            if (!list) return;

            for (var i = 0; i < list.length; i++) {
                var evtObj = list[i].object;
                if (o == evtObj) {
                    _notificationList[evt].splice(i, 1);  // Remove the object from the callback array.
                    break;
                }
            }

        },


//--------------------------------------------------------------------
// Function: publishEvent
// publish Event; notify all subscribers that an event has happened
//
// Parameters:
//   evt - the event to publish
//   args - the array of arguments
//--------------------------------------------------------------------
        publishEvent : function (evt, args /*array*/) {
            TRACE("Publishing Event: " + evt, [Mojo.constants.components.EVENT]);
            var list = _notificationList[evt];
            if (!list) return;

            for (var i = 0; i < list.length; i++) {
                var evtObj = list[i].object;
                var evtCB = list[i].callback;
                if (evtCB && evtObj) {
                    try {
                        evtCB.call(evtObj, args);
                    }
                    catch (ex) {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.pubsub", "exception thrown in call for event: " + evt, LOG_ERROR, ex));
                    }
                }
            }
        }
    };

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
// Group: Private
// PRIVATE STUFF  - dont look below this line for your API!
//		- not included in the public API returned in the _instance Object
//-------------------------------------------------------------------------------------
    var _notificationList = new Object();

    // -------------------------------
    // Function: isSubscribed
    // is the event in the notification list
    //
    // Parameters:
    //   evt - the event
    //   obj - the callback object or window
    //   cb  - the callback function
    // -------------------------------
    var isSubscribed = function (evt, obj, cb) {
        if (!_notificationList[evt]) {
            return false;
        }

        var i = 0, len = _notificationList[evt].length;
        for ( ; i < len; i++) {
            var item = _notificationList[evt][i];
            if (item.object === obj && item.callback === cb) {
                return true;
            }
        }
        return false;
    }

// Return our Singleton
    return _instance;
})();

Mojo.exportProperty(Mojo, 'publishEvent', Mojo.events.pubsub.publishEvent);
Mojo.exportProperty(Mojo, 'subscribeForEvent', Mojo.events.pubsub.subscribeForEvent);
Mojo.exportProperty(Mojo, 'unSubscribe', Mojo.events.pubsub.unSubscribe);
Mojo.exportProperty(Mojo, 'unSubscribeForEvent', Mojo.events.pubsub.unSubscribeForEvent);    
	
/* 
 * class: DataModel
 * Mojo.model.modelBaseClass
 *
 * about:
 * 	This is a baseclass javascript class that
 *   provides functionality for handling an In memory data model
 *
 *
 *   Constructor takes the following arguments:
 *       name : REQUIRED - the name of the mode (name CANNOT contain spaces, single, or double quotes)
 *       modelDef : OPTIONAL - a predefined defintion of the allowed names (keys) in the model.
 *                  If null or empty, the model can be created ad-hoc with any names
 *       mutable : OPTIONAL - allow names (keys) to be added to a predifined model definition.
 *
 *   Events : Mojo.constants.events.kModelCreated -- published when a model is constructed
 *           { "name" : name of the model,
 *             "id" : uuid of the model,
 *             "def" : the model definition object that this model uses (may be null)
 *             "groups" : array of groups that this model is associated with
 *           };
 *
 *           Mojo.constants.events.kDataChange - published whenever a data value is changed due to a setVal call
 *           {
 *             "name" : name of the model,
 *             "id" : uuid of the model,
 *             "groupdId" : the group that this model belongs to based on the defiition (may be null),
 *             "def" : the model definition for the key that is being changed
 *             modelName.key : value being set on the model
 *           }
 *
 *
 *   Note : if no model definition is passed in, or the model definition is empty
 *          the model will be set as mutable.  If a model definition is passed in with values in it,
 *          mutable will be false unless otherwise specified.
 *
 *   Note : Persistence of models is defined outside of this class.  When a model is added to the system,
 *          it is done so with the Mojo.addModel(model, <persistence strategy name>)  The persistence strategy is
 *          bound to the model and when a save/load is invoked on the strategy, it should query the this models
 *          'serialize' or 'deserialize' methods to get/set the internal data.
 *
 *
 *   Note : ModelDef definition
 *          Model definitions are objects created outside this class that describe the constraints of the attributes of model
 *
 *          {
 *              _metaData : { // describe
 *                    version : <int>
 *                    mutable : <boolean>, // can elements be dynamically added to this model definition,
 *                                         // If no model definition is found, it will default to true,
 *                                         // If a model definition is found, it will default to false
 *                    groupId: <string>,   // Mojo will group models that are based on this groupId for iterating.
 *                                         // Can be used for multiple copy functionality
 *                },
 *                <model element> : {
 *                     defaultValue: <value to be auto-assigned to this element>
 *                                   syntax is $[model.property] if you want to default to another models value
 *                                   or just a string value otherwise,
 *                     validate: <array> list of validators to be applied to this element,
 *                     format: <string> formatter to be applied to this element,
 *                     type: <STRING | BOOLEAN | NUMBER | DATE | COLLECTION>,
 *                     accessibility : <string> reader text for the element
 *                     placeholderText : <string> default text showing in HTML5 compliant browsers
 *                     mapping : <desciptions of how this element is mapped to persistent storage>,
 *                },
 *
 *                ....
 *
 *          }
 *
 *	Copyright <c> 2012 Intuit, Inc. All rights reserved
 */
Mojo.model.dataModel = Class.extend({

// -------------------------------
// Function: construct
// construct a new data model
//
// Parameters:
//    name - the name of the data model (required).  Name CANNOT contain spaces, single, or double quotes
//    defName - the name of the model definition file to base this model off
//              If no defName is supplied, Mojo will try and look it up out of a mapping configuration file.
//              If no definition can be found, the model will be created where anything can be added to it (mutable).
//    groupId - a group to associate this model to (a groupId can be specifed in the model Def as well) and a model can be associated with multiple groups
//
//
// Member Variable
//    _name - name of the data model
//    _id - a UUID that uniquely Identifies this model in the system
//    _modelDef - the external definition that defines this model (optional)
//    _mutable - can properties be added to this model, or is is hard defined by the model definition
//    _model   - the internal map of key/values
//    _attributes - a map of random attributes that can be assigned to this instance that do not get added to the internal model representation
//
//
// Note: default values are assigned in the uiBinder when the screen loads.  We do it there so clients can either specify it in HTML markup OR in the model definition
//       this way we can use a single place apply functionality to this code.
//
// -------------------------------
    //construct:function (name, defName) {
    construct : function (args) {
        var t=this;

        if (typeof args !== "object" || arguments.length !== 1) {
            //throw  new MojoException("Mojo.model", "Constructor takes exactly 1 object argument", LOG_ERROR);
            TRACE("Deprecated usage.  Constructor now takes exactly 1 object argument.", [Mojo.constants.components.MODEL, this._name], Mojo.utils.trace.WARN);
            args = {name : arguments[0], defName : arguments[1], async : false};
        }
        else {
            _.defaults(args, {async : true});
        }
        if (!args.name) {
            throw new MojoException("Mojo.model", "Constructor : 'name' parameter is required to create a model", LOG_ERROR);
        }
        if (!args.name.match(Mojo.constants.modelNameRegex)) {
            throw new MojoException("Mojo.model", "Constructor : 'name' is invalid, cannot contain spaces, single or double quotes", LOG_ERROR);
        }

        this._id = Mojo.utils.uuid();
        this._name = args.name;
        this._model = {};
        this._attributes = {};
        this._groups = [];
        this._definition = new Mojo.model.ModelDefinition();
        if (args.groupId) {
            _addGroup(args.groupId);
        }

        if (args.async) {
            _loadDefNonBlocking(args.name, args.defName, function (def) {
                //console.log("callback for ", this._name);
                this._modelDef = def;
                this._definition = new Mojo.model.ModelDefinition(def);
                // Mutable - can the client add more properties to this model, or is it rigid basded on the model definition
                this._mutable = this._definition.mutable();
                if(this._definition.groupId()) {
                    _addGroup(this._definition.groupId());
                }

                // Default values are not assigned here they happen at page load time when it binds to the model.  See note in header.
                if (!this._modelDef) {
                    TRACE("Definition for model '" + args.name + "' does not exist - creating a free form model", "Mojo.dataModel", LOG_INFO);
                }
                if (args.callback) {
                    args.callback(this);
                }
            }, this);
        }
        else {
            this._modelDef = _loadDefBlocking(args.name, args.defName);
            this._definition = new Mojo.model.ModelDefinition(this._modelDef);
            // Mutable - can the client add more properties to this model, or is it rigid basded on the model definition
            this._mutable = this._definition.mutable();
            if(this._definition.groupId()) {
                _addGroup(this._definition.groupId());
            }

            // Default values are not assigned here they happen at page load time when it binds to the model.  See note in header.
            if (!this._modelDef) {
                TRACE("Definition for model '" + args.name + "' does not exist - creating a free form model", "Mojo.dataModel");
            }
            if (args.callback) {
                args.callback(this);
            }
        }

        Mojo.publishEvent(Mojo.constants.events.kModelCreated, {"name" : this._name, "id" : this._id, "def" : this._modelDef, "groups" : this._groups});


        // inner function to set up group associations
        //--------------------------------------------
        function _addGroup(groupId) {
            if (groupId) {
                if (typeof groupId === "string")
                    t._groups.push(groupId);
                else if (jQuery.isArray(groupId))
                jQuery.each(groupId, function (idx, val) {
                    t._groups.push(val);
                });
            }
        }

        // Closure to load the model definition dynamically off the server based on the resolver mapping
        //----------------------------------------------------------------------------------------------
        function _loadDefBlocking(name, defName) {
            var reslvr = Mojo.getComponent("modelDefResolver");
            if (!reslvr) {
                TRACE("Model Definition Resolver does not exist - not loading def file for model '" + name + "'", "Mojo.dataModel", LOG_WARNING);
                return;
            }
            var def = reslvr.getDef(name, defName);

            return def;
        }

        function _loadDefNonBlocking(name, defName, callback, context) {
            var reslvr = Mojo.getComponent("modelDefResolver");
            if (!reslvr) {
                TRACE("Model Definition Resolver does not exist - not loading def file for model '" + name + "'", "Mojo.dataModel", LOG_WARNING);
                callback.call(context, null);
                return;
            }

            reslvr.getDef(name, defName, function (def) {
                callback.call(context, def);
            });
        }
    },


// -------------------------------
// Function: getName
// return the name of the data model
// -------------------------------
    getName : function () {
        return this._name;
    },

// -------------------------------
// Function: getGroupIds
// return the groupIds if this model is associated with a common group of models
// -------------------------------
    getGroupIds : function () {
        return this._groups;
    },

// -------------------------------
// Function: getDef
// returns the model definition as a JSON object
// -------------------------------
    getDef : function () {
        return this._modelDef;
    },

    // -------------------------------
// Function: getDefinition
// returns the model definition as an instance of ModelDefinition
// -------------------------------
    getDefinition : function () {
        return this._definition;
    },

// -------------------------------
// Function: getDefinitionforKey
// return the defintion for this element in this model
// -------------------------------
    getDefinitionforKey : function (key) {
        if (this._modelDef)
            return this._modelDef[key];
        return null;
    },

// -------------------------------
// Function: setAttribute
// attach a random attribute on a model (i.e. description)
// -------------------------------
    setAttribute : function (name, val) {
        this._attributes[name] = val;
    },

// -------------------------------
// Function: getAttribute
// retrieve a random attribute on a model
//  may return null or undefined
// -------------------------------
    getAttribute : function (name) {
        return this._attributes[name];
    },

// --------------------------------
// Function: setDataVal
// Set a single data value
//
// Parameters:
//    n - the name or key for the name/value pair
//    v - the value for the name/value pair
//    options - optional object with one or more of the following properties:
//          silent - boolean to allow event not to be sent (default = false)
//          force  - boolean to set the data even if it's readOnly (default = false)
// --------------------------------
    setDataVal : function (n, v, options) {

        // If we're not allowed to extend this model definition and the
        // passed in name is not in our model
        if (!this._mutable && (this._modelDef && !this._modelDef[n])) {
            TRACE("Model: " + this._name + " is not mutable.  Cannot add '" + n + "' to the definition", "Mojo.dataModel", LOG_WARNING);
            return;
        }

        // unless options specify otherwise, do dispatch change event, and respect readOnly flag
        var defaults = {
            silent : false,
            force : false
        };
        options = jQuery.extend(defaults, options);

        var propertyDefinition = this.getDefinitionforKey(n);
        var type = null,
            val = v;

        if (propertyDefinition && propertyDefinition.readOnly) {
            if (!options.force) {
                // return without setting the readOnly property
                TRACE("Not setting read-only property'" + n + "' of " + this._name, "Mojo.dataModel", LOG_WARNING);
                return;
            }
        }

        // make sure the value matches the model definition type(if it is defined), try converting it, if something goes wrong
        // log the error
        if (propertyDefinition && propertyDefinition.type) {
            type = propertyDefinition.type;

            switch (type) {
                case "int":
                    if (typeof v !== "number") {
                        val = parseInt(v);
                        if (isNaN(val)) {
                            TRACE("failed to convert a non-int value " + v + " into property " + n, ["Mojo.model.dataModel"], Mojo.utils.trace.ERROR);
                            val = v;
                        }
                    }
                    break;
                case "bool":
                    if (typeof v !== "boolean") {
                        val = (v && typeof v === "string" && v.toLowerCase() === "true") ? true : false;
                    }
                    break;
                case "string":
                    if (typeof v !== "string") {
                        val = v ? v.toString() : v;
                    }
                    break;
                default:
                    break;
            }
        }

        // Update if it is different 
        if (this._model[n] !== val) {
            var _oldVal = this._model[n];
            this._model[n] = val;

            if (!options.silent) {
                // broadcast a message that this data has changed
                var obj = {
                    "def" : this.getDefinitionforKey(n),
                    "groupId" : this._groupId,
                    "modelName" : this._name,
                    "key" : n,
                    "val" : val,
                    "oldval": _oldVal,
                    "id" : this._id
                };
                obj[this._name + '.' + n] = val;
                Mojo.publishEvent(Mojo.constants.events.kDataChange, obj);
            }

            TRACE("setDataVal: '" + n + " = " + v + "'", [Mojo.constants.components.MODEL, this._name]);
        }
    },

// --------------------------------
// Function: setDataInCollection
// Set a single value within a collection
//
// Parameters:
//    key - the name or key of the collection
//    index - the index within the collection
//    value - the value for the name/value pair
//    options - optional object with one or more of the following properties:
//          silent - boolean to allow event not to be sent (default = false)
//          force  - boolean to set the data even if it's readOnly (default = false)
// --------------------------------
    setDataInCollection : function (key, index, value, options) {

        var propertyDefinition = this.getDefinitionforKey(key);

        if(!propertyDefinition || !propertyDefinition.type || propertyDefinition.type.toLowerCase() !== "collection") {
            TRACE("Model: " + this._name + " has no collection named '" + key + "' ", ["DataModel","setDataInCollection"], LOG_WARNING);
            return;
        }
        // unless options specify otherwise, do dispatch change event, and respect readOnly flag
        var defaults = {
            silent : false,
            force : false
        };
        options = jQuery.extend(defaults, options);

        if (propertyDefinition.readOnly && !options.force) {
            // return without setting the readOnly property
            TRACE("Not setting read-only property'" + key + "' of " + this._name, "Mojo.dataModel", LOG_WARNING);
            return;
        }

        if(this._model[key][index] != value) {
            this._model[key][index] = value;

            if (!options.silent) {
                // broadcast a message that this data has changed
                var obj = {
                    "def" : this.getDefinitionforKey(key),
                    "groupId" : this._groupId,
                    "modelName" : this._name,
                    "key" : key,
                    "val" : this._model[key],
                    "index" : index,
                    "id" : this._id
                };
                obj[this._name + '.' + key] = value;
                Mojo.publishEvent(Mojo.constants.events.kDataChange, obj);
            }

            TRACE("setDataInCollection: '" + key + "[" + index + "] = " + value + "'", [Mojo.constants.components.MODEL, this._name]);

        }
    },

//---------------------------------------------
// Function: getDataInCollection
// Will return null the property doesn't exist or isn't a collection
//
// Parameters:
//    key - the key or name of the collection
//    index - the index within the collection
//---------------------------------------------
    getDataInCollection : function (key, index) {
        var property = this._model[key];
        if(_.isArray(property) || _.isObject(property)) {
            return property[index];
        }
        else {
            return null;
        }
    },

//---------------------------------------------
// Function: getDataVal
// Will return null if no name is in the model
//
// Parameters:
//    name - the name or key for the name/value pair
//---------------------------------------------
    getDataVal : function (name) {
        return (this.has(name)) ? this._model[name] : null;
    },

//---------------------------------------------
// Function: update
// Will update the model with passed in javascript object (of name value pairs), if the new object contains properties
// that the old one doesn't have, these properties will be added to the old object only if the old object is mutable.
//
// Parameters:
//    obj - where we want to get the new properties from
//    options - optional object with one or more of the following properties:
//          silent - boolean to allow event not to be sent (default = false)
//          force  - boolean to set the data even if it's readOnly (default = false)
//---------------------------------------------
    update : function (obj, options) {
        // if obj is null or undefined, throw exception
        // cannot use typeof, because typeof null or object are both equal to "object"
        if (obj === null || obj === undefined) {
            TRACE("Trying to update model '" + name + "' with a null/undefined object", "Mojo.dataModel", LOG_ERROR);
            return;
        }

        for (var key in obj) {
            this.setDataVal(key, obj[key], options);
        }
    },


//---------------------------------------------
// Function: unsetDataVal
// Will remove an attribute from the in memory model 
//
// Parameters:
//    name - the name or key for the name/value pair
//    bSilent - boolean to allow event not to be sent
//---------------------------------------------
    unsetDataVal : function (name, bSilent) {
        this.setDataVal(name, null, {silent : bSilent});
    },

//---------------------------------------------
// Function: has
// Does a value exist in the model
//
// Parameters:
//    name - the name or key for the name/value pair
//---------------------------------------------
    has : function (name) {
        return (typeof this._model[name] != 'undefined');
    },

//---------------------------------------------
// Function: clear
// Removes all attributes from the model (by setting them to null). 
//   Fires a "change" event unless silent is passed as an option.
//
// Parameters:
//    bSilent - boolean to allow event not to be sent
//---------------------------------------------
    clear : function (bSilent) {
        for (var n in this._model) {
            this.unsetDataVal(n, bSilent);
        }
    },

//---------------------------------------------
// Function: serialize
// Return a string representation of the innerModel JSON
//---------------------------------------------
    serialize : function () {
        try {
            return Mojo.utils.jsonSerializer.toString(this._model);
        }
        catch (ex) {
            if (ex instanceof MojoException) {
                ex.addContext("Mojo.model.modelBaseClass - Could not serialize data");
                throw ex;
            }
            else
                throw new MojoException("Mojo.model.modelBaseClass", "Could not serialize data", LOG_ERROR, ex);
        }
    },

//---------------------------------------------
// Function: deserialize
// Convert a string representation of the model into the actual model
//
// Parameters:
//    jsonString - the string to be deserialized into an object
//---------------------------------------------
    deserialize : function (jsonString) {
        try {
            var obj = Mojo.utils.jsonSerializer.toJSON(jsonString);
            if (obj) {
                for (var key in obj) {
                    this.setDataVal(key, obj[key], {force : true});
                }
            }
        }
        catch (ex) {
            if (ex instanceof MojoException) {
                ex.addContext("Mojo.model.modelBaseClass - Could not deserialize data");
                throw ex;
            }
            else
                throw new MojoException("Mojo.model.modelBaseClass", "Could not deserialize data", LOG_ERROR, ex);
        }
    }

});

// Export
Mojo.exportSymbol('Mojo.DataModel', Mojo.model.dataModel);



/**
 * class: I_DAO
 * @Interface:
 * Mojo.interfaces.DAO
 *
 *  about:
 *  Define a way that models will persist themselves
 *
 *  Implementing classes must override all methods
 *  All methods take an array of <Mojo.DataModel derived> model objects that need persisting.
 *
 *  The reason for passing in a list of models is to support the notion of aggregated persistence for remote storage.
 *  This way the implementing a DAO can make one remote call with data from all the models instead of multiple ones.
 *
 *  Since all models in the list derive from Mojo.DataModel, the DAO can call serialize/deserialize to get a JSON representation of the model.
 *
 *  Copyright <c> 2012 Intuit, Inc. All rights reserved
 */
Mojo.interfaces.DAO = Class.extend({
    interfaceType:"DAO", // Don't override

    // Function: save
    // Save the data to storage
    //
    // Parameters:
    //    listofSubscribedModels - the list of models
    save:function (listofSubscribedModels) {
        throw new MojoException("Mojo.interfaces.DAO", "must implement 'save' function: ", LOG_ERROR);
    },

    // Function: load
    // Load data from storage
    //
    // Parameters:
    //    listOfModels - the list of models
    //    optionalSuccessCallback - success callback for async loading
    //    optionalErrorCallback - error callback for async loading
    load:function (listOfModels, optionalSuccessCallback, optionalErrorCallback) {
        throw new MojoException("Mojo.interfaces.DAO", "must implement 'load' function: ", LOG_ERROR);
    },

    // Function: refresh
    // refresh the in memory model with data from storage
    //
    // Parameters:
    //    listofSubscribedModels - the list of models
    refresh:function (listofSubscribedModels) {
        throw new MojoException("Mojo.interfaces.DAO", "must implement 'refresh' function: ", LOG_ERROR);
    },

    // Function: destroy
    // destroy the model in storage
    //
    // Parameters:
    //    listofSubscribedModels - the list of models
    destroy:function (listofSubscribedModels) {
        throw new MojoException("Mojo.interfaces.DAO", "must implement 'destroy' function: ", LOG_ERROR);
    }


});
/**
 * Interface:
 * Mojo.interfaces.abTestResolver
 *
 * @interface
 */
Mojo.interfaces.abTestResolver = Class.extend({
    interfaceType:"abTestResolver", // Dont override

    // sets the current set of tests and recipe for each
    setABTests : function(values) {
        throw new MojoException("Mojo.interfaces.abTestResolver", "must implement 'setABTests' function: ", LOG_ERROR);
    },

    // return the path to the page under the current test conditions
    getABTestPage : function(pageRef, defaultPagePath) {
        throw new MojoException("Mojo.interfaces.abTestResolver", "must implement 'getABTestPage' function: ", LOG_ERROR);
    },

    // return the path to the flow definition file, given the current set of active tests
    getABTestFlow : function(flowRef) {
        throw new MojoException("Mojo.interfaces.abTestResolver", "must implement 'getABTestFlow' function: ", LOG_ERROR);
    }
});
/**
 * Interface:
 * Mojo.interfaces.actionExecutor
 *
 * @interface
 */
Mojo.interfaces.actionExecutor = Class.extend({
    interfaceType:"actionExecutor", // Don't override

    // Constructor
    construct:function (options) {
        throw new MojoException("Mojo.interfaces.actionExecutor", "must implement 'init' function: ", LOG_ERROR);
    },

    // execute the action and return a response.
    execute:function (act, params /*array*/) {
        throw new MojoException("Mojo.interfaces.actionExecutor", "must implement 'execute' function: ", LOG_ERROR);
    }
});   

/**
 * Interface:
 * Mojo.interfaces.expressionEvaluator
 *
 * @interface
 *
 * Implementing classes will override the 'evaluate' function
 * which takes a common language string and evaluates it to a return value
 *
 */
Mojo.interfaces.expressionEvaluator = Class.extend({
    interfaceType:"expressionEvaluator", // Don't override

    // parse the passed in string to arguments and then evaluate them
    parseAndEvaluate:function (expString) {
        throw new MojoException("Mojo.interfaces.expressionEvaluator", "must implement 'parseAndEvaluate' function: ", LOG_ERROR);
    },

    // run the equation expressed by the arguments.
    evaluate:function (args /*array*/) {
        throw new MojoException("Mojo.interfaces.expressionEvaluator", "must implement 'evaluate' function: ", LOG_ERROR);
    }
});
/**
 * Interface:
 * Mojo.interfaces.flowResolver
 *
 * @interface
 */
Mojo.interfaces.flowResolver = Class.extend({
    interfaceType:"flowResolver", // Dont override

    // Constructor
    construct:function (options) {
        throw new MojoException("Mojo.interfaces.flowResolver", "must implement 'init' function: ", LOG_ERROR);
    },

    // resolve a reference to an actual implementation.
    resolve:function (ref) {
        throw new MojoException("Mojo.interfaces.flowResolver", "must implement 'reslove' function: ", LOG_ERROR);
    },

    // is the resolver busy resolving the request
    isBusy : function () {
        throw new MojoException("Mojo.interfaces.flowResolver", "must implement 'isBusy' function: ", LOG_ERROR);
    }
});   

/**
 * Interface:
 * Mojo.interfaces.modalwindow
 *
 * @interface
 */
Mojo.interfaces.modalwindow = Class.extend({
    interfaceType:"modalwindow", // Dont override

    // Constructor
    construct:function (options) {
        throw new MojoException("Mojo.interfaces.modalwindow", "must implement 'init' function: ", LOG_ERROR);
    },

    // resolve a reference to an actual implementation.
    show:function () {
        throw new MojoException("Mojo.interfaces.modalwindow", "must implement 'show' function: ", LOG_ERROR);
    },

    // is the resolver busy resolving the request
    hide : function () {
        throw new MojoException("Mojo.interfaces.modalwindow", "must implement 'hide' function: ", LOG_ERROR);
    },

    getViewPortId : function () {
        throw new MojoException("Mojo.interfaces.modalwindow", "must implement 'getViewPortId' function: ", LOG_ERROR);

    }
});/**
 * Interface:
 * Mojo.interfaces.modelDefResolver
 *
 * @interface
 */
Mojo.interfaces.modelDefResolver = Class.extend({
    interfaceType:"modelDefResolver", // Dont override

    // Constructor
    construct:function (options) {
        throw new MojoException("Mojo.interfaces.modelDefResolver", "must implement 'init' function: ", LOG_ERROR);
    },

    // get the model definition based on the model name passed in.
    getDef:function (modelName) {
        throw new MojoException("Mojo.interfaces.modelDefResolver", "must implement 'resolve' function: ", LOG_ERROR);
    },

    // is the resolver busy resolving the request
    isBusy : function () {
        throw new MojoException("Mojo.interfaces.modelDefResolver", "must implement 'isBusy' function: ", LOG_ERROR);
    }
});
/**
 * Interface:
 * Mojo.interfaces.screenTransitioner
 *
 * @interface
 */
Mojo.interfaces.screenTransitioner = Class.extend({
    interfaceType:"screenTransitioner", // Don't override

    // Constructor
    construct:function (options) {
    },

    // transition the screen and call the callback
    transitionScreen:function (params /*{targetId, bShow, options, callback}*/) {
        throw new MojoException("Mojo.interfaces.screenTransitioner", "must implement 'transitionScreen' function: ", LOG_ERROR);
    }
});   

/**
 * Interface:
 * Mojo.interfaces.uiComponent
 *
 * @interface
 *
 * Implementing classes will override the 'create' function
 * which knows how to render the control and returns the jQuery element
 *
 * Note : The create function MUST return a jQuery element that represents the widget
 *
 */
Mojo.interfaces.uiComponent = Class.extend({
    interfaceType : "uiComponent", // Don't override

    // create a jquery DOM element that represents the component
    // Return the jQuery element
    create : function ($component, data) {
        throw new MojoException("Mojo.interfaces.uiComponent", "must implement 'create' function: ", LOG_ERROR);
    },

    // run the equation expressed by the arguments.
    update : function (data) {
        throw new MojoException("Mojo.interfaces.uiComponent", "must implement 'update' function: ", LOG_ERROR);
    },

    // copy the data attributes from one jQuery element to another
    // Also copy some key attributes like ID and Name
    _copyDataAttributes : function ($from, $to) {
        for (var i = 0; i < $from[0].attributes.length; i++) {
            var a = $from[0].attributes[i];
            // IE 7 has trouble setting the following attributes. Skip them!
            if ( a.name !== "dataFormatAs" && a.name !== "implementation"){
                $to.attr(a.name, a.value);
            }
        }
        //IE 7 also seems to like to disable input attributes that have attributes copied over in this fashion.
        //so remove the disabled attr if it's not on the source element
        if ( !($from.attr("disabled") === "disabled") ){
            $to.removeAttr('disabled');
        }
    }
});
/**
 * Interface:
 * Mojo.interfaces.viewResolver
 *
 * @interface
 */
Mojo.interfaces.viewResolver = Class.extend({
    interfaceType:"viewResolver", // Don't override

    // Constructor
    construct:function (options) {
        throw new MojoException("Mojo.interfaces.viewResolver", "must implement 'init' function: ", LOG_ERROR);
    },

    // resolve a reference to an actual implementation.
    resolve:function (ref) {
        throw new MojoException("Mojo.interfaces.viewResolver", "must implement 'reslove' function: ", LOG_ERROR);
    },

    // is the resolver busy resolving the request
    isBusy : function () {
        throw new MojoException("Mojo.interfaces.viewResolver", "must implement 'isBusy' function: ", LOG_ERROR);
    }


});   

/*************************************************************************************
 * class:
 * Console
 *
 * about:
 * public APIs
 *    - enable()  // the first method that should be called to initialize the debug console
 *                // need a path to a css file so the console won't look ugly and messed up
 *    - disable()
 *    - openWindow()   // opens the debug console
 *    - closeWindow()  // closes the debug console
 *    - toggleWindow() // toggles the debug console on and off
 *    - send()    // logs a user message, can contain an array of components/classnames
 *                // which will get shown in different colors. Also these components will
 *                // be added an internal list of components, which the user can use to turn
 *                // on and off
 *    - addPanel()     // adds a DOM element into the debug window, the newly added DOM element
 *                     // will have its own tab
 *    - clearWindow()  // clear all of the existing logs
 *    - sendDelimeter()   // adds a delimiter in the logs window(aka viewport)
 *
 *************************************************************************************/
Mojo.utils.trace = (function () {
    var _commands = {};

    var _impl = {

        // -------------------------------
        // Function: enable
        // initialize the debug console
        // -------------------------------
        enable : function () {
            _enabled = true;

            Mojo.utils.trace.attach();
            Mojo.publishEvent(Mojo.constants.events.kConsoleEnabled);
        },

        // -------------------------------
        // Function: disable
        // disable the debug console
        // -------------------------------
        disable : function () {
            _enabled = false;
            Mojo.publishEvent(Mojo.constants.events.kConsoleDisabled);
        },

        // -------------------------------
        // Function: attach
        // attach the console to the current document body
        // -------------------------------
        attach : function () {
            if (!_created) {
                jQuery('body').append(_window);
                _viewport = jQuery('#debug_console_viewport')[0];
                _created = true;
            }
        },

        // -------------------------------
        // Function: openWindow
        // open the window
        // -------------------------------
        openWindow : function () {
            if (!_enabled) return;

            jQuery('#debug_console_wrapper').animate({
                height : 366
            }, 120);

            _open = true;
            jQuery("#debug_console_toggle_button").text("close");
        },

        // -------------------------------
        // Function: closeWindow
        // kill the window
        // -------------------------------
        closeWindow : function () {
            if (!_enabled || !_created) return;
            jQuery('#debug_console_wrapper').animate({
                height : 0
            }, 100);

            _open = false;
            jQuery("#debug_console_toggle_button").text("open");
        },

        // -------------------------------
        // Function: toggleWindow
        // open/close the window
        // -------------------------------
        toggleWindow : function () {
            if (_open) {
                this.closeWindow();
            }
            else {
                this.openWindow();
            }
        },

        // -------------------------------
        // Function: addCommand
        // add a command
        //
        // Parameters:
        //    cmdName - the name of the command
        //    cmdFunc - the function for the command
        // -------------------------------
        addCommand : function (cmdName, cmdFunc) {
            _commands[cmdName] = cmdFunc;
        },

        // -------------------------------
        // Function: removeCommand
        // delete the command
        //
        // Parameters:
        //    cmdName - the name of the command
        // -------------------------------
        removeCommand : function (cmdName) {
            delete _commands[cmdName];
        },

        // -------------------------------
        // Function: send
        // send data to the window
        //
        // Parameters:
        //    text - the string data
        //    components - optional, array of components
        //    logLevel - optional log level
        // -------------------------------
        send : function (text, components, logLevel) {
            if (!_enabled) {
                return;
            }

            if (logLevel && (typeof console != "undefined") && console.log) {
                switch (logLevel) {
                    case Mojo.utils.trace.WARN:
                    case LOG_WARNING:
                        //console.warn(text, components);
                        break;
                    case Mojo.utils.trace.ERROR:
                    case LOG_ERROR:
                        console.error(text, components);
                        break;
                    case Mojo.utils.trace.DEBUG:
                    case LOG_INFO:
//                        console.log(text, components);
                        break;
                    default:
                        //console.info(text);  // gets chatty if enabled
                        break;
                }
            }

            text = text + "<br />";

            if (components && components.length > 0) {
                if (typeof components === "string") {
                    components = components.split(",");
                }

                if (jQuery.inArray(components[0], _allComponents) == -1) {
                    var currentComponent = components[0];
                    var formattedComponentId = currentComponent.replace(/ /g, "_");
                    // this component doesn't exist in our registered components list, add it
                    _allComponents.push(components[0]);

                    // add it to the COMPONENT_LIST
                    jQuery("<div style='padding:4px 10px;border-width:0 0 1px;border-style:solid;border-color:#222;background-color:#333;margin-top:1px;'><input type='checkbox' id='" + formattedComponentId + "_checkbox' data-component-name='" + currentComponent + "' checked /><label for='" + formattedComponentId + "_checkbox' style='padding-left:5px;'>" + currentComponent + "</label></div>").appendTo("#debug_console_component_list");

                    // when the component checkbox's value changes, update _disallowedComponents array
                    jQuery("#" + formattedComponentId + "_checkbox").change(function () {
                        var checked = jQuery(this).prop("checked");
                        var componentName = jQuery(this).attr("data-component-name");

                        if (checked) {
                            // allow this component to be logged
                            _allowLoggingForComponent(componentName);
                        }
                        else {
                            // don't allow this component to be logged
                            _disallowLoggingForComponent(componentName);
                        }
                    });
                }

                // check to see if trace should be allowed (the components array are matched against the _allowedComponents array)
                if (_isTraceAllowed(components)) {
                    // append the prefixes if it's defined
                    text = '<span style="color:green;">[' + components.join("][") + ']</span> ' + text;
                }
                else {
                    // trace is not allowed because the component is not in the allowed list
                    return;
                }
            }

            if (logLevel) {
                // if logLevel is specified, indicate it in the UI by displaying different colors
                switch (logLevel) {
                    case Mojo.utils.trace.WARN:
                    case LOG_WARNING:
                        text = '<span style="color:orange;">- WARN -</span> ' + text;
                        break;
                    case Mojo.utils.trace.ERROR:
                    case LOG_ERROR:
                        text = '<span style="color:red;">- Error -</span> ' + text;
                        break;
                    case Mojo.utils.trace.DEBUG:
                    case LOG_INFO:
                        text = '<span style="color:blue;">- Info -</span> ' + text;
                        break;
                    default:
                        break;

                }
            }

            /* for performance reasons, buffer the text and output it to the console at most once every 500 ms */

            _buffer = text + _buffer;

            if (_viewport != null) {  /* just keep in the buffer if the viewport has not yet been built */
                if (_delayedPrint === -1) {   // if timer is not already set set
                    _delayedPrint = setTimeout(function () {
                        _viewport.innerHTML = _buffer + _viewport.innerHTML;
                        _buffer = "";   // clear the buffer
                        _delayedPrint = -1;  // set flag indicating the timer is no longer set
                    }, 500);
                }
            }
        },

        // -------------------------------
        // Function: clearWindow
        // clear the window
        // -------------------------------
        clearWindow : function () {
            _clearWindow();
        },

        // -------------------------------
        // Function: sendDelimeter
        // send the delimeter (line of dashes)
        // -------------------------------
        sendDelimeter : function () {
            _sendDelimeter();
        },

        /************************************************
         * Function: addPanel
         * append new panel
         *
         * Parameters:
         * domElement - the dom element
         * options - can have the following properties
         *     - label (display name of the panel, required)
         *     - id (id of the panel, required)
         *
         ************************************************/
        addPanel : function (domElement, options) {
            if (!options)
                throw new MojoException("Mojo.utils.trace.Console", "cannot add panel without options", LOG_WARNING);

            var label = options.label,
                id = options.id,
                htmlpage = options.htmlpage;

            if (!label || !id) {
                throw new MojoException("Mojo.utils.trace.Console", "cannot add panel without label and id", LOG_WARNING);
            }
            if (!htmlpage && !domElement)
                throw new MojoException("Mojo.utils.trace.Console", "cannot add panel without a dom element or fileName", LOG_WARNING);

            // if this dom element already exists don't add it again
            if (jQuery("#" + id).length > 0) return;

            // append the new menu button
            var newPanelButton = jQuery('<div id="' + id + '_button" class="debug_console_menu_toggle_button_off">' + label + '</div>').appendTo("#debug_menu_bar");
            newPanelButton.bind("click", _impl.onMenuButtonClick);

            // append the dom element to the debug_content div
            if (domElement)
                jQuery('<div id="' + id + '"></div>').append(domElement).appendTo("#debug_content").hide();
            else {
                var $newPanel = jQuery('<div id="' + id + '"></div>').appendTo("#debug_content").hide();
                jQuery($newPanel).load(htmlpage);
            }
        },


        // -------------------------------
        // Function: onMenuButtonClick
        // handles the event where the user clicks on one of the menu buttons inside the console
        //
        // Parameters:
        //     event - the event to trigger
        // -------------------------------
        onMenuButtonClick : function (event) {
            var target = event.target
            var buttonId = jQuery(target).attr("id");
            var panelId = buttonId.replace(/_button/g, "");

            // toggle the css styles for the selected and unselected buttons
            jQuery(target).attr("class", "debug_console_menu_toggle_button_on");
            jQuery("#debug_menu_bar div[id!='" + buttonId + "']").attr("class", "debug_console_menu_toggle_button_off");

            // toggle the css
            jQuery("#" + panelId).show();
            jQuery("#debug_content > div[id!='" + panelId + "']").hide();
        }

    }

    /****************************************************************
     * Group: Private
     * Private API
     ***************************************************************/
    var _enabled = false,
        _created = false,
        _open = false,
        _window = null,
        _viewport = null,
        _buffer = '',
        _delayedPrint = -1;   // timer ID for delayed printing.  use -1 to mean it's not set.

    // list of all components we have logged so far,
    // and a list of allowed components (only allowed components will be shown in the console)
    var _allComponents = [],
        _disallowedComponents = [];

    // -------------------------------
    // Function: _stopAllTrace
    // do not trace any data
    // -------------------------------
    function _stopAllTrace() {
        _disallowedComponents = ["*"];
    }

    // -------------------------------
    // Function: enableResize
    // allow window to be resized; adds click events to window
    // -------------------------------
    function enableResize() {
        var clicking = false;

        jQuery(document).on('mousedown', "#debug_menu_bar", function (e) {
            clicking = true;
            e.preventDefault();
        });

        jQuery(document).on('mouseup', function () {
            clicking = false;
        });

        jQuery(window).on('mousemove', function (e) {
            if (clicking == false) return;
            //window.getSelection().removeAllRanges();

            // Mouse click + moving logic//
            // Browser Viewport
            var winHeight = jQuery(window).height();
            // Height of mouse from bottom
            var mousePosnY = winHeight - e.clientY;

            jQuery('#debug_console_wrapper').height(mousePosnY);
            jQuery('#debug_console_viewport').height(mousePosnY - 80);
        });
    }

    enableResize();

    // -------------------------------
    // Function: _showAllTrace
    // trace all data
    // -------------------------------
    function _showAllTrace() {
        _disallowedComponents = [];
    }

    // -------------------------------
    // Function: _disallowLoggingForComponent
    // do not log data for component
    //
    // Parameters:
    //    component - the component
    // -------------------------------
    function _disallowLoggingForComponent(component) {
        _disallowedComponents.push(component);
    }

    // -------------------------------
    // Function: _allowLoggingForComponent
    // allow data to be logged for component
    //
    // Parameters:
    //    component - the component
    // -------------------------------
    function _allowLoggingForComponent(component) {
        var index = jQuery.inArray(component, _disallowedComponents);
        if (index != -1) {
            _disallowedComponents.splice(index, 1);
        }
    }

    // -------------------------------
    // Function: _isTraceAllowed
    // checks to see if this trace with the specified components is allowed
    //
    // Parameters:
    //    components - the array of components
    // -------------------------------
    function _isTraceAllowed(components) {
        var allowed = true;
        for (var i = 0; i < _disallowedComponents.length; i++) {
            if (_disallowedComponents[i] === "*" || jQuery.inArray(_disallowedComponents[i], components) != -1) {
                // this component is in the allowed list, show it
                return false;
            }
        }

        return true;
    }

    // -------------------------------
    // Function: _createWindow
    // ttoDebugTrace window creation
    // -------------------------------
    function _createWindow() {

        var html = '<div id="debug_console_wrapper">' +
            '<span id="debug_console_toggle_button" title="Toggle" onclick="Mojo.utils.trace.toggleWindow()">open</span>' +
            '<div id="debug_menu_bar">' +
            '<div id="debugconsole_menu_button" class="debug_console_menu_toggle_button_on" onclick="Mojo.utils.trace.onMenuButtonClick(event)">Mojo Trace</div>' +
            '</div>' +
            '<div id="debug_content">' +
            '<div id="debugconsole_menu">' +
            '<pre id="debug_console_viewport"> ' +
            '</pre>' +

            '<pre id="debug_help">' +
            '<div id="debug_help_inner_container">' +
            '<b>Top-level Components:</b>' +
            '<div id="debug_console_component_list">' +
            '</div>' +
            '</div>' +
            '</pre>' +
            '<div class="debug_clear"></div>' +
            '<div id="debug_console_tools">' +
            '<span class="debug_console_button" title="Add a Delimeter" onclick="Mojo.utils.trace.sendDelimeter()">Delimit</span>' +
            '<span class="debug_console_button" title="Add a Delimeter" onclick="Mojo.utils.trace.clearWindow()">Clear</span>' +
            '<div class="debug_clear"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        _window = jQuery(html)[0]
    }

    // -------------------------------
    // Function: _sendDelimeter
    // send a delimeter to the window
    // -------------------------------
    function _sendDelimeter() {
        _impl.send('<span style="color: #2F4F4F">----------------------------------------------</span>');
    }

    // -------------------------------
    // Function: _clearWindow
    // send a delimeter to the window
    // -------------------------------
    function _clearWindow() {
        _viewport.innerHTML = '';
    }

    _createWindow();
    return _impl;

})();
Mojo.utils.trace.WARN = "warn";
Mojo.utils.trace.DEBUG = "debug";
Mojo.utils.trace.ERROR = "error";

Mojo.exportProperty(Mojo, 'enableTraceConsole', Mojo.utils.trace.enable);
Mojo.exportProperty(Mojo, 'disableTraceConsole', Mojo.utils.trace.disable);
Mojo.exportProperty(Mojo, 'openConsole', Mojo.utils.trace.openWindow);
Mojo.exportProperty(Mojo, 'closeConsole', Mojo.utils.trace.closeWindow);
Mojo.exportProperty(Mojo, 'addDebugPanel', Mojo.utils.trace.addPanel);
Mojo.exportProperty(window, 'TRACE', Mojo.utils.trace.send);    


/*
 * class: HTMLAttrParser
 * Mojo.utils.parseHTMLAttrToJSON
 * 
 * about:
 * The Mojo framework uses a lot of functionality that is semantically defined in the HTML markup
 * This utility function takes html attributes specified in the markup and converts them to
 * Javascript Objects for use in the application.
 * 
 * Note : Guaranteed to return an object (but it may be empty)
 */
Mojo.utils.htmlAttrParser = {
    
    // -------------------------------
    // Function: toJSON
    // convert the HTML attribute to JSON
    //
    // Parameters:
    //    htmlAttr - the HTML attribute
    // -------------------------------
    toJSON : function(htmlAttr) {
    
        if ( typeof htmlAttr !== "string" || !htmlAttr ) {
                return {};
        }
                
        var obj = null;
        var str = htmlAttr.trim();
    
        // Add object notation if it doesn't exist
        if (str.charAt(0) !== "{") 
            str = '{' + str + '}'
    
        // Do a non-strict conversion to allow for limited way to express 
        // values in HTML without generating parsing errors
        //   - allows for single quotes around names and values
        obj = Mojo.utils.jsonSerializer.toJSON(str, true);
        return obj || {};
    },

    // -------------------------------
    // Function: toArray
    // Split attribute into an array of values/
    // Data inside of parentheses will be treated as one element
    // This allows to have comma separated values in parentheses that wont get divided up.
    //
    // Parameters:
    //    htmlAttr - the HTML attribute
    // -------------------------------
    toArray : function(htmlAttr) {
        // we need to remove spaces around commas that are used to separate some parameters
        // but leave other spaces, which could occur within a custom message (as in regex validation)
        htmlAttr = htmlAttr.replace(/(^\s*)|(\s*$)/g,"");  // remove leading and trailing spaces
        htmlAttr = htmlAttr.replace(/(\s*,\s*)/g,","); // remove spaces around commas
        // Encode stuff between parens (so we can split on commas)
        htmlAttr = Mojo.utils.replaceCharWithinParenthesis(htmlAttr, ",", "_comma_");

        // now get the comma deliniated list
        var items = htmlAttr.split(',');
        jQuery.each(items, function (idx, value)  {
            // replace foo(something) with foo=something
            value = value.replace(/([a-zA-Z]+\(.+\))+/g, function(str) {
                return str.replace(/\(/,"=").replace(/\)$/,"");
            });
            // restore commas within individual arguments
            items[idx] = value.replace(/_comma_/g,",");
        });
        return items;
    }

};

// class: JSONSerializer
// about:
// Convert a javascript object to a string for sending over the wire as a message
Mojo.utils.jsonSerializer = (function () {
    var _impl = {

// -------------------------------
// Function: toString
// Convert Object to String
//
// Parameters:
//    obj - the object
// -------------------------------
        toString:function (obj) {

            if (window.JSON && window.JSON.stringify) {
                return JSON.stringify(obj);
            }

            var t = typeof (obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';
                return String(obj);
            }
            else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (t == "string") v = '"' + v + '"';
                    else if (t == "object" && v !== null) v = this.toString(v);
                    else if (t == "function") continue;
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }

                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },

// -------------------------------
// Function: toJSON
// Convert String to Object
//  - nonstrict allows for input that does not conform strictly to the JSON standard
//    i.e. single quotes or no quotes around names
//
// Parameters:
//    jsonString - the JSON string
//    nonStrict - boolean value to allow for non-strict parsing
// -------------------------------
        toJSON:function (jsonString, nonStrict) {

            if (typeof jsonString !== "string" || !jsonString) {
                return jsonString;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            // For some odd reaon, the app returns a null character at the end of a request, (Mozilla barf on it)
            // This'll need to be fixed, but in the interum we'll just strip it.
            jsonString.trim();
            jsonString = jsonString.replace(/\0$/, "");

            try {
                // Attempt to parse using the native JSON parser first
                if (window.JSON && window.JSON.parse && !nonStrict) {
                    return window.JSON.parse(jsonString);
                }

                return ( new Function("return " + jsonString) )();
            }
            catch (ex) {
                throw new MojoException("Mojo.utils.jsonSerializer", "Invalid JSON\n" + jsonString, LOG_ERROR, ex);
            }

        }
    }
    return _impl;
})();
	
   
//---------------------------------------
// class: ObjectExtensions
// about:
// Extend existing javascript primitives
//
//  !!NOTE : Do me a favor and dont extend the Array object
//           It adds enumerable properties to the array that get processed in 'for in' loops
//           Using Object.defineProperty wont work in all IE versions, so lets just stay away from extending the Array class.
//---------------------------------------
Mojo.utils.extensions = (function () {

    //------------------------------------------------
    // Function:  Date.prototype.yyyymmdd
    // add additional attributes to the Date
    //------------------------------------------------
    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
    };

//------------------------------------------------
// Function: String.prototype.toNum
// String: converts a string to num 
//
// Parameters:
//    bEmptyAsValid - boolean to treat null and empty as 0
//------------------------------------------------
    String.prototype.toNum = function (/*treat null+empty as 0*/bEmptyAsValid) {
        if (this && this.length > 0) {
            // remove all crap
            var isNeg = this.charAt(0) === "-";
            var nVal = this.replace(/[^0-9.]/gi, "");
            var nVal = parseFloat(nVal);
            if (isNaN(nVal)) return null;
            else return (isNeg) ? 0 - nVal : nVal;
        }

        return bEmptyAsValid ? 0 : null;
    };


//------------------------------------------------
// Function: String.prototype.toDate
// String: try and convert a formatted string to a Date object
// Use the mask to figure out how the value is formatted
// Can return an invalid date if not formatted properly
//------------------------------------------------
    String.prototype.toDate = function () {
        // MM/DD/YYYY or MM-DD-YYYY
        var parts = this.match(/(\d{2})[\/|\-](\d{2})[\/|\-](\d{4})/);
        if (parts) {
            return new Date(parts[3], parts[1] - 1, parts[2]);
        }
        // YYYY-MM-DD or YYYY/MM/DD
        parts = this.match(/(\d{4})[\/|\-](\d{2})[\/|\-](\d{4})/);
        if (parts) {
            return new Date(parts[1], parts[2] - 1, parts[3]);
        }
        // MM/YYYY or MM-YYYY
        parts = this.match(/(\d{2})[\/|\-](\d{4})/);
        if (parts) {
            return new Date(parts[2], parts[1] - 1, 1);
        }
        // YYYY
        if (this.match(/\d{4}/)) {
            return new Date(this, 0, 1);
        }

        return new Date(this); // Try and convert, may be invalid

    }

//------------------------------------------------
// If trim is not supported
    if (!String.trim) {
        // Function: String.prototype.trim
        // String: gets rid of leading and trailing spaces
        String.prototype.trim = function () {

            if (this && this.length > 0) {
                return this.replace(/^[\s]+|[\s]+$/g, "");
//			return this.replace(/^[\s]+/, "").replace(/[\s]+$/, "");
            }

            return "";
        };
    }

//------------------------------------------------
// Function: String.prototype.removeQuotes
// String: remove surrounding quote marks
//------------------------------------------------
    String.prototype.removeQuotes = function () {
        if (this.length == 0) return;
        return this.replace(/^["|'](.*?)["|']$/, "$1");
    }


    //-----------------------------------------------
    String.prototype.toBoolean = function () {
        var val = this + "";
        switch (val.toLowerCase()) {
            case "true":
            case "1":
            case "yes":
                return true;

            case "false":
            case "0":
            case "no":
                return false;
        }
        return false;
    }

    String.prototype.startsWith = function(str) {
        return (this.match("^"+str)==str)
    }

    String.prototype.endsWith = function(str) {
        return (this.match(str+"$")==str)
    }
    
    String.prototype.replaceLastInstance = function (srch,repl) {
		var n = this.lastIndexOf(srch);
		return this.substr(0, n) + repl + this.substr(n+srch.length);
	}

//------------------------------------------------
// Function: Number.prototype.toFormattedInt
// Number: converts the number to a integer string with thousand commas
//
// Parameters:
//    bKeepPrecision - boolean to keep the precision
//------------------------------------------------
    Number.prototype.toFormattedInt = function (bKeepPrecision) {
        if (!this) return "0";

        var num = this;
        var bNeg = false;
        var s, precision;
        if (this < 0) {
            bNeg = true;
            num = -num;
        }

        if (bKeepPrecision) {
            var dec = new String(num).split(".")[1];
            precision = dec ? dec : 0
        }
        s = new String(num.floatToInt());

        // Dont add commas
        for (var i = 0; i < Math.floor((s.length - (1 + i)) / 3); ++i) {
            s = s.substring(0, s.length - (4 * i + 3)) + ',' + s.substring(s.length - (4 * i + 3));
        }

        if (bNeg) s = "-" + s;
        if (precision) s += "." + precision;

        return s;
    };

//------------------------------------------------
// Function: Number.prototype.floatToInt
// Number: truncates a float to an integer with no rounding
//------------------------------------------------
    Number.prototype.floatToInt = function () {
        if (!this) return 0;

        var num = this;
        var bNeg = false;
        if (this < 0) {
            bNeg = true;
            num = -num;
        }

        num = Math.floor(num); // truncate fraction...needs to be positive num
        if (bNeg) num = -num;

        return num;
    };

//------------------------------------------------
// Function: Number.prototype.roundToPrecision
// Number: rounds the number to the specific precision.
//
// Parameters:
//    fractionDigits - the number of fraction digits
//------------------------------------------------
    Number.prototype.roundToPrecision = function (fractionDigits) {
        if (!fractionDigits)
            throw new zException("invalid param", "roundToPrecision");

        var base = Math.pow(10, fractionDigits);
        return Math.round(this * base) / base;
    };
})();

Mojo.utils.profiler = function (profileName) {

    var _instance = {

        reset : function () {
            _start = new Date();
            _marks = {};
            _data = {};
        },

        mark : function (markName, inTime /*if passed in, use it instead of new date */) {
            _marks[markName] = inTime ? inTime : new Date();
        },

        captureTimeFromMark : function (captureName, markName) {
            if (markName)
                _data[captureName] = new Date() - _marks[markName];
            else
                _data[captureName] = new Date() - _start;
        },

        getCapture : function (captureName) {
            return _data[captureName];
        },

        setName : function (name) {
            _profileName = name;
        },

        getName : function () {
            return _profileName;
        },

        serialize : function () {
            return _profileName + " : " + Mojo.utils.jsonSerializer.toString(_data);
        }
    }

    var _profileName = profileName,
        _marks = {},
        _data = {},
        _start = null;

    return _instance;
}
// This blows in IE (of course) but not consistently (of course)
// Mojo.utils.uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

Mojo.utils.uuid = function () {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}//------------------------------------------------------
// Utility function to covert a string into an
// existing class function
// May return null if no function exists in the namespace
//------------------------------------------------------
Mojo.utils.stringToFunction = function (str) {
    var arr = str.split(".");

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
        if(!fn) {
            return null;
        }
    }
    return  fn;
};


//------------------------------------------------------
// Utility function to resolve any model references within a string, array, or object
// Note : will convert booleans to strings
// Note2: will resolve nested model references such as $[$[FLOW_SCOPE.modelName].propertyName]
//------------------------------------------------------
Mojo.utils.resolveModelRefs = function (inRef) {
    if (null == inRef || typeof inRef === "undefined") return inRef;

    var resolvedVal = inRef;
    // Handle Arrays and Objects (recursively if necessary)
    if (typeof inRef === "object") {
        var resolvedObj = _.isArray(inRef)?new Array():new Object();
        jQuery.each(inRef, function (idx, val) {
            resolvedObj[idx] = Mojo.utils.resolveModelRefs(val);
        });

        return resolvedObj;
    }

    // Handle strings
    if (typeof inRef === "string") {
        // Resolve in HTML markup
        var v = inRef.match(Mojo.constants.modelRegex);
        if (v) {
            var resolvedModelVal = _resolve(v[1]);
            if(inRef === v[0]) {
                // return the resolved value, which may no longer be a string
                resolvedVal = resolvedModelVal;
            }
            else {
                // replace the model ref, but leave the rest of the string intact
                resolvedVal = inRef.replace(v[0], resolvedModelVal);
            }
        }
    }

    // Inner function to get the value out of the model
    function _resolve(modelVal) {
        // if the model name contains references to other models, resolve those first
        while(_containsModelRef(modelVal)) {
            modelVal = _resolveInnerModel(modelVal);
        }
        var _v = Mojo.getDataVal(modelVal);

        if (typeof _v == "object")
            _v = Mojo.utils.resolveModelRefs(_v);
        if (typeof _v === "undefined" || null == _v)
            return "";
        return  _v;
    }

    function _containsModelRef(str) {
        var leftIndex = str.indexOf("$[");
        if(leftIndex >= 0) {
            var rightIndex = str.indexOf("]", leftIndex);
            return rightIndex > 0;
        }
        else {
            return false;
        }
    }

    function _resolveInnerModel(str) {
        var i0 = str.lastIndexOf('$[');  // in case of nested references, resolve innermost first
        var i1 = str.indexOf(']',i0);
        var modelRef = str.substring(i0, i1 + 1);
        var modelNameDotProp = str.substring(i0 + 2, i1);
        var innerValue = _resolve(modelNameDotProp);
        return str.replace(modelRef, innerValue);
    }

    return resolvedVal;
};

// Resolve all the model references in a string
//-------------------------------------------------------
Mojo.utils.resolveModelRefsInString = function (inString, skipHTMLAttributes) {
    if (null == inString || typeof inString !== "string") {
        return inString;
    }
    var resolvedStr = inString;
    var prefix = skipHTMLAttributes ? "\\$" : "[@\\$]";
    var rgx = new RegExp(prefix + Mojo.constants.modelRegexNonGreedyStr, "g");

    var loopCount = 0;
    while(resolvedStr.match(rgx) && loopCount < 8) {
        loopCount += 1;  // prevent endless looping, even though it's extremely unlikely
        resolvedStr = resolvedStr.replace(rgx, function () {
            var v = Mojo.getDataVal(arguments[1]);
            if(!v) {
                TRACE("No data value found for " + arguments[1], ["utils", "resolveModelRefsInString"], LOG_INFO);
            }
            return v;
        });
    }
    return resolvedStr;
};

//------------------------------------------------------
// Utility function to resolve any function references within a string, array, or object
// If inHTML is true, then the result of any function calls will be converted to a string and replaced in the return string
// If inHTML is false (or undefined) then the inObj will be evaluated as a function call and the actual value will be returned (not converted to a string)
//------------------------------------------------------
Mojo.utils.resolveFunctionRefs = function (inObj, inHTML, $el) {
    if (null == inObj || typeof inObj === "undefined") {
        return inObj;
    }

    // Handle Arrays and Objects (recursively if necessary)
    if (typeof inObj === "object") {
        jQuery.each(inObj, function (idx, val) {
            inObj[idx] = Mojo.utils.resolveFunctionRefs(val, inHTML);
        });

        return inObj;
    }

    // Handle strings
    if (typeof inObj === "string") {
        // Resolve in HTML markup and replace the result of the function directly in the string
        if (inHTML) {
            var resolvedVal = inObj.replace(Mojo.constants.functionResolutionRegex, function () {
                var functionName = arguments[1];
                var args = _getArgs(arguments[3]) || [];
                if($el) {
                    args.push($el);
                }
                return _resolve(functionName, args);
            });
            return resolvedVal;
        }
        // Create a function out of the passed in string and run it
        // returning its value
        else {
            var parts = Mojo.constants.functionRegex.exec(inObj);
            if (parts) {
                var functionName = parts[1];
                var args = _getArgs(parts[3]) || [];
                if($el) {
                    args.push($el);
                }
                return _resolve(functionName, args);
            }
            else {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("resolveFunctionRefs", "invalid string to evaluate: " + inObj, LOG_ERROR));
                return null;
            }

        }


    }

    // replace commas within single or double quotes, so we can split arguments on remaining commas
    //---------------------------------------------------------------------------------------------
    function _replaceCommasWithinQuotes(str) {
        var newStr = "";
        var quoteCount = 0;
        var dblQuoteCount = 0;
        for(var i=0; i<str.length; i++) {
            var currChar = str.charAt(i);
            if(currChar === "'" && dblQuoteCount === 0) {
                quoteCount = 1 - quoteCount;
            }
            else if(currChar === '"' && quoteCount === 0) {
                dblQuoteCount = 1 - dblQuoteCount;
            }
            if(currChar === "," && (quoteCount > 0 || dblQuoteCount > 0)) {
                newStr += "_comma_";
            }
            else {
                newStr += currChar;
            }
        }
        return newStr;
    }

    // extract an array of arguments form comma separated values within parenthesis
    //-----------------------------------------------------------------------------
    function _getArgs(argsStr) {
        if(!argsStr || argsStr.length === 0) {
            return null;
        }
        // ensure commas within quotes are treated as part of the string, not as arg separators
        argsStr = _replaceCommasWithinQuotes(argsStr);

        // remove spaces around commas, and leading & trailing spaces
        argsStr = argsStr.replace(/\s*,\s*/g,",").replace(/^\s*/,"").replace(/\s*$/,"");
        if(argsStr.length === 0) {
            return null;
        }
        var args = argsStr.split(",");

        // evaluate each argument to get into its native form (array, string, number, or another expression)
        for (var i = 0; i < args.length; i++) {
            args[i] = args[i].replace(/_comma_/g,",");  // restore commas that might have been replaced above
            args[i] = Mojo.utils.evaluateSimpleOperand(args[i]);
        }
        return args;
    }

    // execute the function and get the return value
    //------------------------------------------
    function _resolve (functionName, args) {
        try {
            var f = Mojo.utils.stringToFunction(functionName);
            if(f) {
                var str = args ? f.apply(document, args) :  f.apply(document);
                return str;
            }
            else {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("resolveFunctionRefs", "missing function " + functionName, LOG_ERROR));
                return null;
            }
        }
        catch(ex) {
            Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("resolveFunctionRefs", "invalid function " + functionName, LOG_ERROR));
            return null;
        }
    }

    return inObj;
};

// -------------------------------
// Function: evaluateSimpleOperand
// Figure out what type of operands we're dealing with
// This version does NOT support operands that are themselves expressions using action expression syntax
// If it is a reference to a model value, get it
// If it is an array, turn it into one,
// Otherwise
// See if we can convert it to a number, if so do it
// otherwise treat is as a string
//
// Parameters:
// operand - the argument to be evaluated to its primitive type
// -------------------------------
Mojo.utils.evaluateSimpleOperand = function (operand) {

    // Does the string represent an object
    var _isObject = function (inString) {
        return inString.match(/^\[(.*?)\]$/) || inString.match(/^\{(.*?)\}$/)
    };

    if (!operand) {
        return operand;
    }

    var v = operand; // default for object, boolean, string
    if (typeof operand === "object" || typeof operand === "boolean") {
        return v;
    }

    if (_isObject(operand)) { // Check if Array or object
        v = Mojo.utils.jsonSerializer.toJSON(operand, true);
    }

    // Resolve any model references if the operand is a string
    v = Mojo.utils.resolveModelRefs(operand);

    // turn true | false strings into booleans
    if (v === "true") {
        return true;
    }
    if (v === "false") {
        return false;
    }

    if (v && typeof v === "string") {
        // Turn the value into a number if applicable
        if(!isNaN(v.replace(/\,/, ""))) {
            var num = parseFloat(v.replace(/\,/, ""));
            return num;
        }
        else {
            // strip thr surrounding quotes, if found
            var inQuotes = v.match(/^'(.*)'$/) || v.match(/^"(.*)"$/);
            var str = inQuotes ? inQuotes[1] : v;
            return str;
        }
    }

    // if we got this far, it could be a number or an empty string
    return v;
};

/**
 * Split a model data reference into parts
 *
 * @param dataRef a fully specified Mojo data name, such as namespace.ModelName.propertyName[index]
 * @return {Object} contains properties including
 *      modelName
 *      key
 *      index (only applies to collections)
 *      isCollection - boolean
 */
Mojo.utils.splitDataRef = function(dataRef) {
    var result = {};
    var lastDot = dataRef.lastIndexOf('.');
    result.modelName = dataRef.substring(0,lastDot);
    var property = dataRef.substr(lastDot + 1);
    var matches = property.match(/^(.+)\[(.*)\]$/);
    if(matches && matches.length >= 3) {
        result.key = matches[1];
        result.index = matches[2];
        result.isCollection = true;
    }
    else {
        result.key = property;
        result.isCollection = false;
    }
    return result;
};

/**
 * Replace a character that appears within parenthesis in a given string
 * @param str - the string to search and replace within
 * @param charToReplace - the character to replace
 * @param replacement - the replacement for the character
 * @return - the new string
 */
Mojo.utils.replaceCharWithinParenthesis = function(str, charToReplace, replacement) {
    var newStr = "";
    var parenCount = 0;
    for(var i=0; i<str.length; i++) {
        var currChar = str.charAt(i);
        if(currChar === "(") {
            parenCount += 1;
        }
        else if(currChar === ")") {
            parenCount = Math.max(parenCount-1, 0);  // decrement, but not less than zero
        }
        if(currChar === charToReplace && parenCount > 0) {
            newStr += replacement;
        }
        else {
            newStr += currChar;
        }
    }
    return newStr;
};

Mojo.model.ABTestModel = Mojo.model.dataModel.extend({
    construct : function (abTestMap) {
        this._name = "ABTest";
        this._mutable = false;
        this._modelDef = null;
        this._model = abTestMap;
    }
})
/*
 * class: DAOManager
 * Mojo.model.DAOManager
 *
 * about:
 * This class is responsible for managing data persistence across the system
 *
 * DAO strategies are registered here to be used later by data models.
 *
 * When a model is added to the system, it is done so with a name reference to a DAO.
 *
 * When a persistence call is made (save, load, destroy, etc...) The strategy is invoked passing all the models
 * that have subscribed to it as an array parameter.  The persistence strategy is then responsible for knowing how
 * to save/load/etc..
 *  - The reason I chose to pass all the models to the strategy is that I wanted to have a way to aggregate remote load/save calls
 *    Now if the client has a remoteDAO strategy, it can collect the data from ALL models before sending it to the server.
 *
 *
 *	Copyright <c> 2012 Intuit, Inc. All rights reserved
 */
Mojo.model.DAOManager = (function () {

    var _impl = {

        // -------------------------------
        // Function: addDAO
        // add a new DAO implementation
        //
        // Parameters:
        //    name - the name of the DAO manager
        //    DAOImpl - the DAO implementation
        // -------------------------------
        addDAO : function (name, DAOImpl) {
            if (!(DAOImpl instanceof Mojo.interfaces.DAO)) {
                throw new MojoException("Mojo.model.DAOManager", "addStrategy: Strategy '" + name + "' does not implement Mojo.interfaces.DAO", LOG_WARNING);
            }
            _DAOMap[name] = DAOImpl;
            _subscribedModels[name] = new Array();
        },


        // -------------------------------
        // Function: associateModelToDAO
        // associate a model to the DAO
        //
        // Parameters:
        //    DAOName - the name of the DAO
        //    modelName - the name of the model
        // -------------------------------
        associateModelToDAO : function (DAOName, modelName) {
            if (!_subscribedModels[DAOName]) {
                Mojo.publishEvent(Mojo.constants.events.kException,
                    new MojoException("DAOManager", "associateModelToDAO: Strategy '" + DAOName + "' has not been added to Mojo, cannot add model '" + modelName + "'", LOG_WARNING));
                return;
            }
            _subscribedModels[DAOName].push(modelName);
            _modelToDAOMap[modelName] = DAOName;
        },

        // -------------------------------
        // Function: save
        // An empty list means save all
        // If a strategy name is passed in use that one instead of the associated one.
        //
        // Parameters:
        //    modelName - the name of the model
        //    DAOName - the name of the DAO
        // -------------------------------
        save : function (modelName, DAOName, callback) {
            if (_.isArray(modelName)) {
                this._saveMultipleAsync(modelName, DAOName, callback);
            }
            else if (_.isFunction(callback)) {
                this._saveMultipleAsync(modelName?[modelName]:null, DAOName, callback);
            }
            else if (modelName) {
                var model = Mojo.model.registry.getModel(modelName);
                if (model) {
                    var daoStrategy;
                    if (DAOName) {
                        daoStrategy = _getDAO(DAOName);
                    }
                    else {
                        daoStrategy = _getDAO(_modelToDAOMap[modelName]);
                    }
                    if (!daoStrategy) {
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("DAOManager", "save: " + modelName + "' does not have an associated strategy - could not save", LOG_WARNING));
                    }
                    else {
                        daoStrategy.save(new Array(model));
                    }
                }
            }
            else {
                for (var s in _DAOMap)
                    _DAOMap[s].save(_convertNamesToModels(_subscribedModels[s]));
            }
        },

        _saveMultipleAsync : function (modelNames, DAOName, callback) {
            var daoName = DAOName || MojoOptions.defaultDAO;
            var daoStrategy = _getDAO(daoName);

            if (!daoStrategy) {
                Mojo.publishEvent(Mojo.constants.events.kException,
                    new MojoException("DAOManager", "save: '" + modelNames[0] + "' invalid DAO name - could not save", LOG_WARNING));
                callback(false);
                return;
            }

            var modelList = null;
            if (modelNames) {
                modelList = [];
                for (var i = 0; i < modelNames.length; i++) {
                    var model = Mojo.model.registry.getModel(modelNames[i]);
                    if (!model) {
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("DAOManager", "save: " + modelNames[i] + " does not exist.  Use addModel first.", LOG_ERROR));
                        callback(false);
                        return;
                    }
                    else {
                        modelList.push(model);
                    }
                }
            }
            else {
                modelList = _convertNamesToModels(_subscribedModels[daoName])
            }


            daoStrategy.save(modelList,
                function () {
                    callback(true);
                },
                function () {
                    callback(false);
                });
        },

        // -------------------------------
        // Function: load
        // Load the model or the DAO
        //
        // Parameters:
        //    modelName - the name of the model, or an array of model names.  if an array is passed, async loading is implied and callback is required.
        //    DAOName - the name of the DAO
        //    callback - causes the models to be loaded asynchronously.  gets passed a boolean success flag.
        // -------------------------------
        load : function (modelName, DAOName, callback) {
            if (_.isArray(modelName)) {
                this._loadMultipleAsync(modelName, DAOName, callback);
            }
            else if (_.isFunction(callback)) {
                this._loadMultipleAsync([modelName], DAOName, callback);
            }
            else if (modelName) {
                var model = Mojo.model.registry.getModel(modelName);
                if (model) {
                    var daoStrategy;
                    if (DAOName) {
                        daoStrategy = _getDAO(DAOName);
                    }
                    else {
                        daoStrategy = _getDAO(_modelToDAOMap[modelName]);
                    }
                    if (!daoStrategy) {
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("DAOManager", "load: " + modelName + "' no DAO name - could not load", LOG_WARNING));
                        return;
                    }
                    daoStrategy.load(new Array(model));
                }
            }
            else {
                for (var s in _DAOMap)
                    _DAOMap[s].load(_convertNamesToModels(_subscribedModels[s]));
            }
        },

        _loadMultipleAsync : function (modelNames, DAOName, callback) {
            var modelList = [];
            for (var i = 0; i < modelNames.length; i++) {
                var model = Mojo.model.registry.getModel(modelNames[i]);
                if (!model) {
                    Mojo.publishEvent(Mojo.constants.events.kException,
                        new MojoException("DAOManager", "load: " + modelNames[i] + " does not exist.  Use addModel first.", LOG_ERROR));
                    callback(false);
                    return;
                }
                else {
                    modelList.push(model);
                }
            }
            var daoStrategy;
            if (DAOName) {
                daoStrategy = _getDAO(DAOName);
            }
            else {
                daoStrategy = _getDAO(_modelToDAOMap[modelNames[0]]);
            }
            if (!daoStrategy) {
                Mojo.publishEvent(Mojo.constants.events.kException,
                    new MojoException("DAOManager", "load: '" + modelNames[0] + "' invalid DAO name - could not load", LOG_WARNING));
                callback(false);
                return;
            }
            daoStrategy.load(modelList,
                function () {
                    callback(true);
                },
                function () {
                    callback(false);
                });
        },

        // -------------------------------
        // Function: destroy
        // Destroy the model or the DAO
        //
        // Parameters:
        //    modelName - the name of the model
        //    DAOName - the name of the DAO
        // -------------------------------
        destroy : function (modelName, DAOName) {
            if (modelName) {
                var dao;
                var m = Mojo.model.registry.getModel(modelName);
                if (m) {
                    if (DAOName) {
                        dao = _getDAO(DAOName);
                    }
                    else {
                        dao = _getDAO(_modelToDAOMap[modelName]);
                    }
                    if (dao)
                        dao.destroy(new Array(m));
                }

            }
            else {
                for (var s in _DAOMap)
                    _DAOMap[s].destroy(_convertNamesToModels(_subscribedModels[s]));
            }
        }


    };

    var _DAOMap = {},
        _subscribedModels = {},
        _modelToDAOMap = {};

    // -------------------------------
    // Group: Private
    //
    // Function: _getDAO
    // get the DAO from the map
    //
    // Parameters:
    //    name - the name of the DAO
    // -------------------------------
    function _getDAO(name) {
        return _DAOMap[name];
    }

    // -------------------------------
    // Function: _convertNamesToModels
    // create array of models
    //
    // Parameters:
    //    names - the array of model names
    // -------------------------------
    function _convertNamesToModels(names) {
        var modelArray = new Array();
        jQuery.each(names, function (idx, val) {
            var m = Mojo.model.registry.getModel(val);
            if (m) modelArray.push(m);
        });
        return modelArray;

    }

    return _impl;
})();



/**
 * class: LocalStorageDAO
 * @author Miller, Greg
 *
 * about:
 * Strategy for storing off data to HTML5 localstorage
 */
Mojo.model.localStorageDAO = Mojo.interfaces.DAO.extend({


// Function: save
// @Override
// Save data to local storage
//
// Parameters:
//    modelList - the list of models
    save : function (modelList) {
        if (!window.localStorage) return;

        try {
            jQuery.each(modelList, function (index, model) {
                var name = MojoOptions.appId + "." + model.getName();
                localStorage.setItem(name, model.serialize());
            });
        }
        catch (ex) {
            throw new MojoException("Mojo.model.localStorageStrategy", "Could not save data", LOG_ERROR, ex);
        }
    },

// Function: load
// @Override
// Load the data from local storage
//
// Parameters:
//    modelList - the list of models
    load : function (modelList, success, error) {
        if (!window.localStorage) return;

        try {
            jQuery.each(modelList, function (index, model) {
                var name = MojoOptions.appId + "." + model.getName();
                var data = localStorage.getItem(name);
                if (data) {
                    model.deserialize(data);
                }
            });
            if(typeof success === "function") {
                success();
            }
        }
        catch (ex) {
            throw new MojoException("Mojo.model.localStorageStrategy", "Could not load data", LOG_ERROR, ex);
        }
    },

// Function: destroy
// @Override
// Clear the local storage and the in memory model
//
// Parameters:
//    modelList - the list of models
    destroy : function (modelList) {
        if (!window.localStorage) return;

        jQuery.each(modelList, function (index, model) {
            var name = MojoOptions.appId + "." + model.getName();
            localStorage.removeItem(name);
        });
    },

// Function: refresh
// @Override
// refresh the in memory model with data from storage
//
// Parameters:
//    modelList - the list of models
    refresh : function (modelList) {
        this.load(modelList);
    }

});
	

Mojo.model.ModelDefinition = function(def) {
    var _def = def || {};
    var _metaData = def ? def._metaData : null;
    var _mutable = def ? (def._metaData ? def._metaData.mutable : false) : true;
    var _groupId = def ? (def._metaData ? def._metaData.groupId : null) : null;

    this.mutable = function() {
        return _mutable;
    };

    this.groupId = function() {
        return _groupId;
    };

    this.hasMetaData = function() {
        return _metaData !== null;
    };

    this.metaData = function() {
        return _metaData;
    };

    this.hasKey = function(key) {
        return _.has(def,key);
    };

    this.defForKey = function(key) {
        if(this.hasKey(key)) {
            return _def[key];  // could return a copy for better encapsulation
        }
        else {
            return null;
        }
    };

    this.keys = function() {
        return _.keys(_def);
    };
};/*
 * class: Mojo.model.registry
 * Model Registry
 * 
 * About:
 * This class is the interface into accessing any data in a model in the system.
 * It manages the lifecycle of the models and the associations between them and their DAO
 *
 * When data is set in the system it will be marshaled through this class to the appropriate model
 * We hook up to the data binding system be invoking the 'bind-data' function.  This call registers this class
 * With the data binder.
 *
 *  Copyright <c> 2012 Intuit, Inc. All rights reserved
 * 
 */
Mojo.model.registry = (function () {

    var _impl = {

// -------------------------------
// Function: addModel
// add a new model
//
// Parameters:
//    model - the data model object
//
// Returns : true | false;
//
// -------------------------------
        addModel : function (model) {
            var name = model.getName();
            if (!(model instanceof Mojo.DataModel)) {
                throw new MojoException("Model Registry", "Model '" + name + "' must extend from Mojo.DataModel", LOG_ERROR);
            }
            if (this.has(name)) {
                TRACE("addModel: Model '" + name + "' already exists. Not adding model");
                return false;
            }

            _modelMap[name] = model;
            Mojo.publishEvent(Mojo.constants.events.kModelRegistered, name);


            // Add this model to a collection if it has a group Id as part of its definition
            // If there is no groupId, it wont get associated.
            this.associateWithGroup(model, model.getGroupIds());

            return true;

        },

// -------------------------------
// Function: associateDAO
// associate a model with a persistence scheme
//
// Parameters:
//    model - the data model object
//    DAOName - a named reference to the persistence scheme this model will use
//----------------------------------------
        associateWithDAO : function (model, DAOName) {
            if (DAOName) {
                Mojo.model.DAOManager.associateModelToDAO(DAOName, model.getName());
            }

        },

// -------------------------------
// Function: associateWithGroup
// associate a model with a group (a way to associate models together, so clients can ask for a collection)
//
// Parameters:
//    model - the data model object
//    groupId - a named of the group that this model will be associated with
//----------------------------------------
        associateWithGroup : function (model, groupIds) {
            if (!groupIds) return;

            jQuery.each(groupIds, function (idx, groupId) {
                if (!_modelGroups[groupId]) _modelGroups[groupId] = {};
                _modelGroups[groupId][model.getName()] = model;
            });


        },

// -------------------------------
// Function: getModelGroup
// Get the group of models associated with a groupId
//
// Parameters:
//    groupId - a named of the group that the models are associated to
//
// Returns:
//    a hash map of models based on [modelName : modelImpl]
//    can return null if not group exists
//----------------------------------------
        getModelGroup : function (groupId) {
            return _modelGroups[groupId];
        },

// -------------------------------
// Function: removeModel
// delete the model
//
// Parameters:
//    name - the name of the model
// -------------------------------
        removeModel : function (name) {
            if (this.has(name)) {
                var m = this.getModel(name);
                groups = m.getGroupIds();
                if(groups) {
                    jQuery.each(groups, function (idx, group) {
                        delete _modelGroups[group][name];
                    });
                }
                delete _modelMap[name];
            }
        },

// -------------------------------
// Function: has
// is the model defined
//
// Parameters:
//    name - the name of the model
// -------------------------------
        has : function (name) {
            return (typeof _modelMap[name] != 'undefined');
        },

// -------------------------------
// Function: setData
// set a model property value
//
// Parameters:
//    modelName - the name of the model
//    key -   the key or model property name
//    value - the value for the name/value pair
//    options - object containing optional flags {force, silent}
// -------------------------------
        setData : function (modelName, key, value, options) {
            try {
                var model = _impl.getModel(modelName);
                model.setDataVal(key, value, options);
            }
            catch (ex) {
                _publishException("setData:" + ex.msg);
            }
        },

// -------------------------------
// Function: getData
// return a model property value
// returns null if the model does not exist AND publishes an exception
//
// Parameters:
//    modelName - the name of the model
//    key - the key or model property name
// -------------------------------
        getData : function (modelName, key) {
            try {
                var model = _impl.getModel(modelName);
                return model.getDataVal(key);
            }
            catch (ex) {
                _publishException("getData:" + ex.msg);
                return null;
            }
        },

// --------------------------------
// Function: setDataInCollection
// Set a single value within a collection
//
// Parameters:
//    modelName - the name of the model
//    key - the name or key of the collection
//    index - the index within the collection
//    value - the value for the name/value pair
//    options - optional object with one or more of the following properties:
//          silent - boolean to allow event not to be sent (default = false)
//          force  - boolean to set the data even if it's readOnly (default = false)
// --------------------------------
        setDataInCollection : function (modelName, key, index, value, options) {
            try {
                var model = _impl.getModel(modelName);
                model.setDataInCollection(key, index, value, options);
            }
            catch (ex) {
                _publishException("setDataInCollection:" + ex.msg);
            }
        },

// --------------------------------
// Function: getDataInCollection
// Set a single value within a collection
//
// Parameters:
//    modelName - the name of the model
//    key - the name or key of the collection
//    index - the index within the collection
// --------------------------------
        getDataInCollection : function (modelName, key, index) {
            try {
                var model = _impl.getModel(modelName);
                return model.getDataInCollection(key, index);
            }
            catch (ex) {
                _publishException("getDataInCollection:" + ex.msg);
            }
        },

// -------------------------------
// Function: setDataVal
// store the name/value pair
//
// Parameters:
//    n - the name or key for the name/value pair
//    v - the value for the name/value pair
//    options - object containing optional flags {force, silent}
// -------------------------------
        setDataVal : function (n, v, options) {
            try {
                var m = _parseRefToModelNV(n);
                var model = _impl.getModel(m.name);
                return model.setDataVal(m.key, v, options);
            }
            catch (ex) {
                _publishException("setDataVal:" + ex.msg);
                return null;
            }

        },

// -------------------------------
// Function: getDataVal
// return the name/value pair
// returns null if the model does not exist AND publishes an exception
//
// Parameters:
//    n - the name or key for the name/value pair
// -------------------------------
        getDataVal : function (n) {
            try {
                var m = _parseRefToModelNV(n);
                var model = _impl.getModel(m.name);
                return model.getDataVal(m.key);
            }
            catch (ex) {
                _publishException("getDataVal:" + ex.msg);
                return null;
            }

        },

// -------------------------------
// Function: getModel
// return the model
//
// Parameters:
//    name - the name of the model
// -------------------------------
        getModel : function (name) {
            return _modelMap[name];
        },


// -------------------------------
// Function: getModelNamesinSystem
// return an array names of the models currently in the system;
//
// -------------------------------
        getModelNamesinSystem : function () {
           return _.keys(_modelMap);
        },

// -------------------------------
// Function: getModelDef
// return the model definition as a JSON object
//
// Parameters:
//    name - the name of the model
// -------------------------------
        getModelDef : function (name) {
            return _modelMap[name].getDef();
        },

// -------------------------------
// Function: getModelDefinition
// return the model definition as an instance of Mojo.model.ModelDefinition
//
// Parameters:
//    name - the name of the model
// -------------------------------
        getModelDefinition : function (name) {
            return _modelMap[name].getDefinition();
        },

// -------------------------------
// Function: getDefforModelElement
// return the defintion for the element of the requested model
//   - returns null if there isn't one
//
// Parameters:
//    name - the name of the model.element
// -------------------------------
        getDefforModelElement : function (n) {
            try {
                var m = _parseRefToModelNV(n);
                var model = _impl.getModel(m.name);
                return model.getDefinitionforKey(m.key);
            }
            catch (ex) {
                _publishException("getDefforModelElement:" + ex.msg);
                return null;
            }
        },


// -------------------------------
// Function: clear
// clear the model
//
// Parameters:
//    name - the name of the model
// -------------------------------
        clear : function (name) {
            if (name && this.has(name)) {
                _impl.getModel(name).clear();
            }
            else {
                for (var m in _modelMap) {
                    _impl.getModel(m).clear();
                }
            }
        }

    };


    //////////////////////////////////////////////
    // Private
    //////////////////////////////////////////////

    // Parse the passed in qualified model query to the model name and key
    // The model name will be everything up to (not including) the last '.'
    // The model key will be everthing after the last '.'
    function _parseRefToModelNV(n) {
        var ns = Mojo.constants.nameSpaceRegex.exec(n);

        // split out the namespace of the model name
        if (!ns || ns.length != 3) throw new MojoException("Model Registry", "Invalid Model namespace definition: " + n, LOG_ERROR);

        // If we're referencing a flow scoped variable
        if (ns[1] === Mojo.constants.scopes.kFlowScope) {
            ns[1] = Mojo.application.applicationController.getCurrentFlowScopeName();
        }
        if (!_impl.getModel(ns[1])) throw new MojoException("Model Registry", "Model does not exist: " + ns[1], LOG_ERROR);

        return {name : ns[1], key : ns[2]};
    }

    function _publishException(msg) {
        TRACE(msg, "Model Registry", LOG_WARNING);

    }

    var _modelMap = {};
    var _modelGroups = {};

    return _impl;
})();
/*
 * class: JSFlow
 * Mojo.flow.flowObj
 *
 * about:
 * This class manages the state-machine within a flow definintion
 * 
 * Transmission map for JSFlows
 *
 * Events :
 *      Mojo.constants.events.kFlowStart  -- when a flow starts
 *      {
 *          "name" : flow name,
 *          "id" : uuid of the flow
 *          "def" : _flowDef,
 *          "metaData" : {
 *              path : array of flowJumpObj objects that tells the system how to statefully get to this flow
 *              nodeName : the nodename of this flow
 *          }
 *      }
 *
 *      Mojo.constants.events.kFlowEnd  -- when a flow ends
 *      {
 *          "name" : flow name,
 *          "id" : uuid of the flow
 *      }
 *
 *      Mojo.constants.events.kFlowTransition  -- on every transition of the flow
 *      {
 *         "name" : flow name,
 *         "id" : uuid of the flow,
 *         "nodeName" : name of the transition node,
 *         "stateDef" : object describing the nodename,
 *         "path" : path to the current flow
 *      }
 *
 * 
 * Note : As a bonus, this class will automatically generate a flow scoped model that will be valid for the lifetime of the flow
 *        All input variables into the flow will be added to the flow scoped model by default
 *        Data in the flow scoped model can be accessed outside of this class by referencing it in a view using on of the following notations:
 *           1) $[FLOW_VAR.<key>]  - this will immediately replace contents with the value out of flow scope
 *           2) FLOW_VAR.<key>  - these will be treated as dynamic data-binding so elements on a page can update the flow scope.
 * 
 *      : By default views states get a history attribute of 'always', flows get 'always', and actions get 'never'
 *
 * Note : By default, history attributes will be attached to each node unless otherwise specified
 *  ACTION : never
 *  VIEW : always (unless options.modal - then NEVER)
 *  FLOW : always (unless options.modal - then NEVER)
 *
 *
 * FlowDef:
 *  {
 *      model : {  // Model that this flow will need [ optional ]
 *                  name : <string>,
 *                  className : <string>,  // if not specified, will use the one in the Options file
 *                  definition : <string>
 *                  DAO : <string - name of the DAO to use for this model> if not specified, will use the one in the Options file
 *              },
 *
 *      options : { [ optional ]
 *          modal : <true | false>  // show the flow in a modal window
 *          closeButton : <true | false > // have Mojo supply a close button on the modal,
 *          navWhenDone : <true | false > // allow the content of a modal window navigate the flow controller
 *      },
 *
 *
 *      onStart : {
 *          ref : <ref> // Action to perform on flow startup (maybe populating the model) [optional]
 *          params : parameters to pass to the javascript function
 *          exp : Mojo expression
 *      }
 *
 *
 *      onEnd : {
 *          ref : <ref> // Action to perform on flow startup (maybe populating the model) [optional]
 *          params : parameters to pass to the javascript function
 *          exp : Mojo expression
 *      }
 *
 *      startState : <name>, // name of the first node in the flow to execute
 *
 *      allowRandomAccess : <true | false>  - defaults to true // Can we navigate via jump inside this flow
 *
 *
 *
 *      <name>: {
 *          history : <never | always | session >
 *          state_type:<VIEW | ACTION | FLOW | END>,
 *          ref: <string>, // reference to a VIEW, ACTION, or FLOW
 *          data : {n:v, n:v, ...} // optional if we want to associate any data with this state
 *          transitions :{
 *              <on>: <to>,
 *              <on>: <to>,
 *              etc...
 *          }
 *      },
 *      <name> : .....
 *      }
 * 
 * Constructor:
 *      name : name of the flow
 *      flowDef : JSON definition of the flow
 *
 *
 *  Notes:
 *      Action states can take an 'exp' key.  And the value of that key would be a valid action expression
 *      End states can take an 'outcomeExp' key.  And the value of that key would be a valid action expression
 */

Mojo.flow.flowObj = function (name, flowDef) {

    var _instance = {

//---------------------------------------------------------
// Function: init
// Initialize a flow
//  - initialize the flow with input parameters
//---------------------------------------------------------
        init : function (inputVars, options, metaData) {

            // Handle any options passed in
            _options = options || {};
            _metaData = metaData || {};

            // if we need to gen up any models
            if (_flowDef.model) {
                var _m = _flowDef.model;
                if (jQuery.isArray(_m)) {
                    // iterate creating models
                    for (var i = 0; i < _m.length; i++) {
                        var modelobj = _m[i];
                        _createModel(_m[i]);
                    }
                }
                else if (typeof _m === "object") {
                    _createModel(_m);
                }
            }

            // Create a flow scoped Model
            // And add the input options to the model
            _flowScopedModel = new Mojo.DataModel({name : this.getflowScopedModelName()});
            if (inputVars) {
                for (var o in inputVars) {
                    _flowScopedModel.setDataVal(o, inputVars[o]);
                }
            }
            Mojo.addModel(_flowScopedModel);

            //--------------------------------------
            // Inner function to create models
            function _createModel(_modelObj) {
                var modelObj = {"modelName" : _modelObj.name,
                    "defFileName" : _modelObj.definition,
                    "daoName" : _modelObj.DAO || MojoOptions.defaultDAO,
                    "className" : _modelObj.className || MojoOptions.defaultModelClass};

                try {
                    Mojo.addModel(modelObj);
                    TRACE("Creating " + modelObj.className + " with name: '" + modelObj.modelName + "' dao: '" + modelObj.daoName + "'", [Mojo.constants.components.FLOW, _name]);
                }
                catch (ex) {
                    _publishError("Could not create Model of className: '" + className + " . Hint: cannot be namespaced, try passing an alias");
                }
            }

        },

//---------------------------------------------------------
// Function: start
// Start a flow
//  - start up the flow and run to the first view
//  - return the first view response
//---------------------------------------------------------
        start : function (callback) {
            Mojo.publishEvent(Mojo.constants.events.kFlowStart, _getFlowInfoObj());

            // execute any onStart instructions
            if (_flowDef.onStart) {
                _runSyncAction(_flowDef.onStart);
                TRACE("Starting flow with action '" + _flowDef.onStart + "'", [Mojo.constants.components.FLOW, _name]);
            }

            this.doNext(null, function (resp) {
                callback(resp);
            });
        },


//---------------------------------------------------------
// Function: end
// This is called when an kEndState is encountered
// checks to see if this modal was displayed in a modal, if true, end it.
// In the flow definition, if there's an onEnd action specified, execute it
// Publishes a flowEnd event with the flows name
//---------------------------------------------------------
        end : function () {

            if (_flowDef.onEnd) {
                _runSyncAction(_flowDef.onEnd);
                TRACE("Ending flow with action '" + _flowDef.onEnd + "'", [Mojo.constants.components.FLOW, _name]);
            }

            // publish event before blowing away the model.  Listeners may want to capture info out of the model
            Mojo.publishEvent(Mojo.constants.events.kFlowEnd, _getFlowInfoObj());
            Mojo.removeModel(this.getflowScopedModelName());
        },

//---------------------------------------------------------
// Function: doNext
// Get the appropriate response out of the next logic state in the flow
//  - will execute through action states without returning a response out
//
// Parameters:
//   response - the response used to determine the current state
//---------------------------------------------------------

        doNext : function (response, callback) {
            console.log("doNext  ---> ", response);
            // Set the current state based on the response from the previous state
            _setCurrent(response);

            // Now run the State-machine to the first logical page
            if (callback) {
                _run(function () {
                    var resp = _createResponse();
                    callback(resp);
                });
            }
            else {
                _run();
                return _createResponse();
            }
        },

//---------------------------------------------------------
// Function: has
// Does this flow contain a state-type with the passed name
//
// Parameters:
// name - the name of the flow definition
//---------------------------------------------------------	
        has : function (name) {
            return (typeof _flowDef[name] != 'undefined');
        },

//---------------------------------------------------------
// Function: allowRandomAccess
// Does this flow allow random access into middle of it	for the case of a jumpTo
//---------------------------------------------------------
        allowRandomAccess : function () {
            if (this.has('allowRandomAccess')) {
                return _flowDef['allowRandomAccess'];
            }
            else
                return true;
        },

//---------------------------------------------------------
// Function: jumpToState
// Jump into the middle of the flow
//  - return the response of the appropriate state
//  - will run through actions to get the the next state-type
//
// Parameters:
// stateName - the state name to jump to
//---------------------------------------------------------
        jumpToState : function (stateName, callback) {

            if (this.allowRandomAccess()) {
                _setCurrent(stateName, true);

                if (!_currentState) {
                    _publishError("jumpToState: State Name '" + stateName + "' does not exist!");
                    return null;
                }
                _currentState['name'] = stateName;
            }


            if (callback) {
                _run(function () {
                    var resp = _createResponse();
                    callback(resp);
                });
            }
            else {
                _run();
                return _createResponse();
            }
        },

//---------------------------------------------------------
// Function: getName
// Get the name of the flow
//---------------------------------------------------------
        getName : function () {
            return _name;
        },

//---------------------------------------------------------
// Function: getId
// Get the id of the flow
//---------------------------------------------------------
        getId : function () {
            return _id;
        },

        getNodeName : function () {
            return _metaData.nodeName;
        },

//---------------------------------------------------------
// Function: getFlowVariable
// Get the value of a flow scoped variable
//---------------------------------------------------------
        getFlowVariable : function (name) {
            return _flowScopedModel.getDataVal(name);
        },

//---------------------------------------------------------
// Function: setFlowVariable
// Set the value of a flow scoped variable
//---------------------------------------------------------
        setFlowVariable : function (name, value) {
            return _flowScopedModel.setDataVal(name, value);
        },

//---------------------------------------------------------
// Function: getflowScopedModelName
// Get the name of the model that represents this flow scope
//---------------------------------------------------------
        getflowScopedModelName : function () {
            return _id;
        },


//---------------------------------------------------------
// Function: isBusy
// Indicate whether flow is waiting for an asynchronous action to complete
//---------------------------------------------------------
        isBusy : function () {
            return _busy;
        }



    };

//============================================================================
//============================================================================
// Group: Private
// PRIVATE STUFF  - dont look below this line for your API!
//============================================================================
//============================================================================
    var _name = "",
        _id = Mojo.utils.uuid(),
        _flowDef = null,
        _options = {},
        _metaData = {},
        _flowScopedModel = null,
        _currentState = null,
        _lastViewState = null,
        _actionExecutor = null,
        _busy = false,
        _paused = false;

//--------------------------------------------------------------------------
// Function: _setCurrent
// Set the new current State based on the outcome of the old current State
// Does not return anything, just sets the currentState
//
// Parameters:
//   response - the response used to determine the current state
// Return value:
//   boolean indicating success
//--------------------------------------------------------------------------
    function _setCurrent(response, bJumpTo) {
        var next = null,
            prev = _currentState,
            trans = null;

        // if directly setting the node
        if (bJumpTo) {
            next = response;
        }
        // If no currentState, or no response lets start at the beginning
        else if (null == _currentState || null == response) {
            if (!_instance.has("startState")) {
                _publishError("No 'startState' defined");
                return false;
            }
            next = _flowDef["startState"];
        }


        // find the next state
        else {
            if (!_currentState["transitions"]) {
                TRACE("Flow Object: " + _name + " - No transitions defined for '" + _currentState["nodeName"] + "'", LOG_WARNING);
                return false;
            }
            trans = _currentState["transitions"];
            next = trans[response];
            if (!next && trans[Mojo.flow.constants.kWildCard]) {
                next = trans[Mojo.flow.constants.kWildCard];
            }
        }

        // Ok we have somewhere to go, lets find it in the flow definition
        if (next) {
            _currentState = _flowDef[next];
            console.log("  _currentState : ", _currentState, " (" + next + ")");
            if (!_currentState) {
                if (bJumpTo)
                    _publishError("Cannot jump, node does not exist: " + next);
                else
                    _publishError("No Transition for: " + prev["nodeName"] + " -answer: " + next);
                return false;
            }
            _currentState["nodeName"] = next;

            // Default the history attribute if it is not set
            if (!_currentState.history) {
                switch (_currentState.state_type) {
                    case Mojo.flow.constants.kViewState:
                    case Mojo.flow.constants.kFlowState :
                        if (_currentState.options && _currentState.options.modal) {
                            _currentState.history = Mojo.flow.constants.historyType.kNever;
                        }
                        else {
                            _currentState.history = Mojo.flow.constants.historyType.kAlways;
                        }
                        break;
                    default :
                        _currentState.history = Mojo.flow.constants.historyType.kNever;
                        break;
                }
            }

        }
        else {
            console.error("next state not found for " + _name, _currentState);
            response = response || "<EMPTY or NULL>";
            _publishError("No Transition for: " + prev["nodeName"] + ": " + response);
            return false;
        }

        //  DEBUG Stuff
        if (prev)
            TRACE("Transition from state '" + prev["nodeName"] + "' response: '" + response + "' to state '" + _currentState["nodeName"] + "'", [Mojo.constants.components.FLOW, _name]);
        else
            TRACE("Starting flow with state '" + _currentState["nodeName"] + "'", [Mojo.constants.components.FLOW, _name]);

        Mojo.publishEvent(Mojo.constants.events.kFlowTransition, {"name" : _name, "id" : _id, "nodeName" : next, "stateDef" : _currentState, "metaData" : _metaData});

        return true;
    }

//--------------------------------------------------------------------------
// Function: _run
//  Run the state-machine to the next logical VIEW
//  Does not return anything, just advances the currentState to the next
//   logical view, executing actions along the way.
//--------------------------------------------------------------------------
    function _run(callback) {
        if (_paused) return;

        if (!_currentState) {
            _publishError("JSFLow._run - No current state: ");
        }
        if (!_currentState["state_type"]) {
            _publishError("No 'state_type' defined for '" + _currentState["nodeName"] + "'");
        }

        // callback function for closing a modal window
        function __onModalClose(responseFromModal) {
            // If the closed the modal and there is an indicator that we need to do some navigation,
            // then stay on the current node, the controller
            if (responseFromModal && _currentState["options"].navWhenDone) {
            }
            else {
                // Restore the the last view
                _currentState = _lastViewState;
                console.log("  _currentState : ", _currentState, " (post-modal)");
            }
            _paused = false;
        }

        // If we're on a modal node, let the application handle it
        if (_currentState["options"] && _currentState["options"].modal) {
            switch (_currentState["state_type"]) {
                case Mojo.flow.constants.kFlowState :
                    Mojo.getSome(_currentState.ref, _currentState.options, _resolveInputVars(_currentState.inputVars), __onModalClose);
                    _paused = true;
                    break;
                case Mojo.flow.constants.kViewState :
                    Mojo.loadPage(_currentState.ref, _currentState.options, __onModalClose);
                    break;
            }

            // Pause ourselved, we'll need to resume when the modal is closed.
            return;
        }


        var type = _currentState["state_type"];

        if (type === Mojo.flow.constants.kViewState) _lastViewState = _currentState;
        if (type === Mojo.flow.constants.kViewState || type === Mojo.flow.constants.kFlowState || type === Mojo.flow.constants.kEndState) {
            // Nothing to run to.
            if (typeof callback === "function") {
                callback();
            }
            return;
        }

        // Run actions through to completion
        if (type === Mojo.flow.constants.kActionState) {
            async = _currentState['async'];
            if (_currentState['async']) {
                // execute an asynchronous action and get response
                act = _currentState['ref'];
                if (act) {
                    _busy = true;
                    TRACE("Running async action '" + act + "'", [Mojo.constants.components.FLOW, _name]);
                    _actionExecutor.execute({action : act, callback : function (response) {
                        _busy = false;
                        _handleActionResponse(response, callback);
                    }});
                }
            }
            else {
                // execute a synchronous action and get response
                var response = _runSyncAction(_currentState);
                _handleActionResponse(response, callback);
            }
        }
        else {
            _publishError("Invalid State Type: " + type + " in " + _currentState['name']);
        }

    }

//--------------------------------------------------------------------------
// Function: _handleActionResponse
// Process the response to an action, calling _run() again if necessary
//
//--------------------------------------------------------------------------
    function _handleActionResponse(response, callback) {
        if ((typeof response) == "boolean") {
            response = response.toString();
        }
        response = response || "";

        // Based on the result of the action, advance the State-machine to the next state
        var result = _setCurrent(response);

        // Since we are an action and we still don't have a view, run again
        if (result !== false) {
            console.log(_currentState.state_type, _currentState.async);
            if(_currentState.state_type === "ACTION" && _currentState.async === true) {
                console.log("calling _run(callback)");
                _run(callback);  // passing callback enables back-to-back async actions
            }
            else {
                console.log("calling _run()");
                _run();  // passing callback enables back-to-back async actions
            }
        }
        if (typeof callback === "function" && !_paused) {
            callback();
        }
    }

//--------------------------------------------
// Run a javascript action
//
//--------------------------------------------
    function _runSyncAction(node) {
        var act = node['ref'],
            params = node['params'],
            exp = node['exp'],
            response;

        if (act) {
            response = _actionExecutor.execute({action : act, params : params});
            TRACE("Executing javascript '" + act + "' response: '" + response + "'", [Mojo.constants.components.FLOW, _name]);
        }
        else if (exp) {
            response = _expressionEvaluator.parseAndEvaluate(exp);
            TRACE("Executing Mojo expression '" + exp + "' response: '" + response + "'", [Mojo.constants.components.FLOW, _name]);
        }

        return response;
    }

//---------------------------------------------------------
// Function: getFlowInfoObj
// Get an object that represents the information about the current flow
//---------------------------------------------------------
    function _getFlowInfoObj() {
        return {"name" : _name, "metaData" : _metaData, "options" : _options, "id" : _id};
    }


// -------------------------------
// Function: _publishError
// publish error with message
//
// Parameters:
//   msg - the message of the error
// -------------------------------
    function _publishError(msg) {
        TRACE("Flow error: " + _name + " - " + msg, ["Mojo.flow.flowObj", ""], Mojo.utils.trace.ERROR);

        Mojo.publishEvent(Mojo.constants.events.kException,
            new MojoException("Mojo.flow.flowObj", "Flow Object: " + _name + " - " + msg, LOG_ERROR));
    }

// -------------------------------
// Function: _throwError
// throw error with message
//
// Parameters:
//   msg - the message of the error
// -------------------------------
    function _throwError(msg) {
        throw new MojoException("Mojo.flow.flowObj", "Flow Object: " + _name + " - " + msg, LOG_ERROR);
    }

// -------------------------------
// Function: _createResponse
// construct the response
// -------------------------------
    function _createResponse() {
        var response = new Mojo.flow.flowResponse();
        response.state_type = _currentState["state_type"];
        switch (_currentState["state_type"]) {
            case Mojo.flow.constants.kFlowState:
            case Mojo.flow.constants.kViewState :
                response.value = _currentState["ref"];
                response.options = _currentState.options;
                response.inputVars = _resolveInputVars(_currentState.inputVars);
                response.metaData = _currentState.metaData;
                break;
            case Mojo.flow.constants.kActionState:
                response.value = _currentState["ref"];
                break;
            case Mojo.flow.constants.kEndState :
                if (_currentState["outcomeExp"] && _currentState["outcome"]) {
                    Mojo.publishEvent(Mojo.constants.events.kException,
                        new MojoException("Mojo.flow.flowObj", "Flow '" + _name + "' END STATE has both outcome and outcomeExp - ignoring outcomeExp", LOG_WARNING));
                }
                if (_currentState["outcome"]) {
                    response.value = _currentState["outcome"];
                }
                else if (_currentState["outcomeExp"]) {
                    response.value = _expressionEvaluator.parseAndEvaluate(_currentState["outcomeExp"]);
                    TRACE("Ending flow with expression '" + _currentState["outcomeExp"] + "' response: '" + response.value + "'", [Mojo.constants.components.FLOW, _name]);
                }
                break;
        }

        // Set output here
        response.outputVars = null;
        response.data = _currentState["data"];
        response.nodeName = _currentState["nodeName"];

        return response;
    }

    function _resolveInputVars(iv) {
        // Resolve any inputvars
        var out = [];
        if (iv) {
            for (var o in iv) {
                var input = iv[o];
                if (typeof input === "string") {
                    var input = Mojo.utils.resolveModelRefs(input) || "";
                }
                out[o] = input;
            }
        }
        return out;
    }

    _name = name;
    _flowDef = flowDef;
    _actionExecutor = Mojo.getComponent("actionExecutor");
    _expressionEvaluator = Mojo.getComponent("expressionEvaluator");

    if (!name) _throwError("Construtor: Flow name not specified");
    if (!flowDef) _throwError("Construtor: Flow Definition Object not specified");
    if (!_actionExecutor) _throwError("Action Executor not registered in framework");

    return _instance;
};

// -------------------------------
// class: Mojo.flow.constants
// construct a constants object
//
// -------------------------------
Mojo.flow.constants = {
    kViewState : "VIEW",
    kActionState : "ACTION",
    kFlowState : "FLOW",
    kEndState : "END",

    kWildCard : "*",
    kNavigationSeperator : "~"
}

Mojo.flow.constants.historyType = {
    kNever : "never",
    kSession : "session",
    kAlways : "always"
};//-------------------------------------------------------------------------------------
// class: JSFlowController
// Mojo.flow.controller 
//  
// About:
//  This class manages the state machine of Mojo.
//  It manages the lifecycle of flows and is in charge of progressing the state machine from view to view.
//      running actions and subflows along the way.
//
//  As a response to the calls to 'getNextView' and 'navigateTo', this class will return a reference to a view that higher level calling code must
//  Resolve to an actual implementation of that view.

// This class uses a flow resolver that has been injected into the system.
// If clients have special requirements around resolving flow references, they must supply a flow resolver options file to let the system know
// where and how to resolve flow references to actual flow definitions
//
//-------------------------------------------------------------------------------------

Mojo.flow.controller = function () {

    var _instance = {

        init : function (options) {
            if (options) {
                _onEndCallback = options.onEndCB;
            }
            _currentFlow = null;
            _flowStack = new Array();
            _flowResolver = Mojo.getComponent(Mojo.interfaces.flowResolver);
            _initialized = true;

            if (!_flowResolver) _throwError("Flow Resolver not registered in framework");

        },


        //-------------------------------------------
        // Function: navigateTo
        // jump to the specifed node in the heirarchy of flows specified by the target (path)
        //
        // Parameters:
        //   pathElements - array of flowJumpObjs that specify how to get to the requested node,
        //   callback - function callback to execute when we're done
        //-------------------------------------------
        navigateTo : function (pathElements, callback) {
            if (!_initialized) {
                _throwError("navigateTo : Controller is not initialized!");
            }
            if (!pathElements) {
                _throwError("No response passed to getNextView");
            }
            if (!callback) {
                _throwError("navigateTo() called without callback");
            }
            //           TRACE("Jumping to path '" + target + "'", [Mojo.constants.components.FLOW]);

            // Throw the old stack away
            _currentFlow = null;
            _flowStack = new Array();


            // Save off the first and the last
            //  - The first must be the main flow reference
            //  - The last can be any state-type
            var start = pathElements[0];
            var end = pathElements[pathElements.length - 1];

            if (!start instanceof Mojo.flow.flowJumpObj) {
                _throwError("navigateTo : Start node is not a flowJump Object");
            }
            if (!end instanceof Mojo.flow.flowJumpObj) {
                _throwError("navigateTo : end node is not a flowJump Object");
            }


            // Only one thing in the jump path, basically if the user only passed in the flow name
            if (start === end) {
                _loadFlow(start.nodeName, start.inputVars, start.options, start.nodeName, function () {
                    _runToView(null, false, function (view) {
                        callback(view);
                        return;
                    });
                });
            }
            else {
                _loadFlow(start.nodeName, start.inputVars, start.options, start.nodeName, function () {
                    _loadPathElements(1, pathElements, function () {
                        _runToView(end.nodeName, true, function (view) {
                            callback(view);
                        });
                    });
                });
            }
        },

        //-------------------------------------------
        // Function: getNextView
        // Return the next page based on the response passed in from the current page
        // If no response is passed in, we'll assume this is a request for the first view of the flow
        //
        // Parameters:
        //   response - the response from which to determine the next view
        //-------------------------------------------
        getNextView : function (response, callback) {
            if (!_initialized) {
                _throwError("getNextView() : Controller is not initialized!");
            }
            if (!callback) {
                _throwError("getNextView() called without callback");
            }
            if (!response) {
                _throwError("No response passed to getNextView");
            }
            try {
                _runToView(response, false, function (view) {
                    callback(view);
                });
            }
            catch (ex) {
                throw ex;
            }
        },


        //-------------------------------------------
        // Function: get the path to the current flow
        //  - returns an array of flowinfoobjects
        //------------------------------------------
        getStateToCurrentFlow : function (currentNodeName) {
            var path = [];
            for (var i = 0; i < _flowStack.length; i++) {
                path.push({"nodeName" : _flowStack[i].getNodeName(), "id" : _flowStack[i].getId()});
            }
            path.push({"nodeName" : currentNodeName, "id" : _currentFlow.getId()});
            return path;
        },

        //-------------------------------------------
        // Function: getCurrentFlowVariable
        // get a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to get
        //------------------------------------------
        getCurrentFlowVariable : function (name) {
            if (_currentFlow) {
                return _currentFlow.getFlowVariable(name);
            }
        },

        //-------------------------------------------
        // Function: setCurrentFlowVariable
        // set a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to set
        //   value - the value of the variable to be set
        //-------------------------------------------
        setCurrentFlowVariable : function (name, value) {
            if (_currentFlow) {
                _currentFlow.setFlowVariable(name, value);
            }
        },

        //-------------------------------------------
        // Function: getCurrentFlowScopeName
        // get the name of the current flow scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentFlowScopeName : function () {
            if (_currentFlow) {
                return _currentFlow.getflowScopedModelName();
            }
        },

        //-------------------------------------------
        // Function: isBusy
        // indicates whether flow resolver is still waiting for a flow definition to load
        //
        //-------------------------------------------
        isBusy : function () {
            if (_currentFlow && _currentFlow.isBusy()) {
                TRACE("current flow is busy waiting for an async action to complete", LOG_WARNING);
            }
            return (_currentFlow && _currentFlow.isBusy()) || (_flowResolver && _flowResolver.isBusy());
        },

        getId : function () {
            return _id;
        }
    };

    //-------------------------------------------------------------------------------------
    // Group: Private
    // PRIVATE STUFF  - dont look below this line for your API!
    //      - not included in the public API returned in the _instance Object
    //-------------------------------------------------------------------------------------
    var _initialized = false,
        _id = Mojo.utils.uuid(),
        _currentFlow = null,
        _flowStack = null,
        _flowResolver = null,
        _onEndCallback = null;

    //--------------------------------------------
    // Function: _loadPathElements
    // used to recursively load each step of a path during a navigational jump
    //
    // Parameters:
    //   step - index of current element in the pathElements array
    //   pathElements - array of path elements
    //   callback - function to execute when reaching the last path element
    //--------------------------------------------
    function _loadPathElements(step, jumpNodes, callback) {
        if (step < jumpNodes.length - 1) {
            var jumpNode = jumpNodes[step];
            if (!_currentFlow.allowRandomAccess()) {
                _throwError("Cannot jump- flow does not allow jump access: " + _currentFlow.getName());
            }
            if (!_currentFlow.has(jumpNode.nodeName)) {
                _throwError("Cannot jump- flow: " + _currentFlow.getName() + " - does not have element: " + jumpNode.nodeName);
            }
            var rsp = _currentFlow.jumpToState(jumpNode.nodeName);
            _loadFlow(rsp['value'], jumpNode.inputVars, jumpNode.options, rsp['nodeName'], function () {
                _loadPathElements(step + 1, jumpNodes, callback);
            });
        }
        else {
            callback();
        }
    }

    //--------------------------------------------
    // Function: _runToView
    // Step through the flow to the next view
    // Running actions, executing subflows, etc.
    // Returns a string representing the resolved view
    //  - if the flow sequencing is done, it will return an indicator that the
    //    flow is finished plus any output of the flow
    //
    // Parameters:
    //   response - the response to determine the next view
    //   isJump - boolean to identify a jump is required
    //--------------------------------------------
    function _runToView(response, isJump, callback) {
        if (isJump) {
            _currentFlow.jumpToState(response, function (flowResp) {
                _handleFlowResponse(flowResp, callback);
            });
        }
        else if (!response) {
            _currentFlow.start(function (flowResp) {
                _handleFlowResponse(flowResp, callback);
            });
        }
        else {
            _currentFlow.doNext(response, function (flowResp) {  // Do next with no 'response' starts the flow from the beginning
                _handleFlowResponse(flowResp, callback);
            });
        }
    }

    function _handleFlowResponse(flowResp, callback) {
        var val = flowResp["value"];
        var data = flowResp["data"];
        var metaData = flowResp["metaData"];
        var options = flowResp["options"] || {}; // always have options;
        var iv = flowResp["inputVars"]; // These should have been resolved in the flow before passing up here

        switch (flowResp["state_type"]) {
            case Mojo.flow.constants.kViewState : // Return a reference to a view
                callback(val);
                break;
            case Mojo.flow.constants.kFlowState :         // load the new Flow (making it current), then run
                // Resolve any inputs to the new flow
                // First set the inputs to any outputs from previous state

                // Load the flow with the input variables
                _loadFlow(val, flowResp["inputVars"], flowResp["options"], flowResp["nodeName"], function () {
                    // Pass empty response to get the start state of the flow
                    _runToView(null, false, function (view) {
                        callback(view);
                    });
                });
                break;
            case Mojo.flow.constants.kEndState : // pop back up to the parent flow and run
                _currentFlow.end();
                _currentFlow = _flowStack.pop();
                if (_currentFlow) {
                    console.log("CurrentFlow:", _currentFlow.getName(), "(pop)");
                    _runToView(val, false, function (view) {
                        callback(view);
                    });
                }
                else {
                    console.log("CurrentFlow: calling callback with", flowResp);
                    if (_onEndCallback) _onEndCallback(flowResp);
                    else callback(flowResp);
                }
                break;
        }
    }


    //--------------------------------------------
    // Function: _loadFlow
    // Load a new flow definition and initialize it
    // Push the current one on the stack
    //
    // Parameters:
    //   flowRef - the reference to the flow
    //   inputVars - the variables to be passed into a flow
    //   options     - external options about the flow to be passed into it
    //--------------------------------------------
    function _loadFlow(flowRef, inputVars, options, nodeName, callback) {
        if (!callback) {
            _throwError("_loadFlow() called without callback");
            return;
        }
        // lookup/load the new flow
        _flowResolver.resolve(flowRef, function (flowDefObj) {
            // push the current flow
            if (_currentFlow) {
                _flowStack.push(_currentFlow);
            }

            // Create a new flow and initialize it.
            _currentFlow = new Mojo.flow.flowObj(flowRef, flowDefObj);
            console.log("CurrentFlow:", _currentFlow.getName(), "(pop)");
            _currentFlow.__ref = nodeName;
            if (!_currentFlow) {
                _throwError("No Flow found for flow reference" + ": " + flowRef);
            }

            // get the current path and nodeName and pass it to the flow,
            // so the flow has some notion of its context
            var _metaData = {
                "path" : _instance.getStateToCurrentFlow(nodeName),
                "nodeName" : nodeName
            };
            _currentFlow.init(inputVars, options, _metaData);

            callback();
        });
    }


    //--------------------------------------------
    // Function: _throwError
    // Throw an error
    //
    // Parameters:
    //   msg - the message for the error
    //--------------------------------------------
    function _throwError(msg) {
        throw new MojoException("Mojo.flow.controller", msg, LOG_ERROR);
    }

    return _instance;

};

/**
 * class: JSFlowResponse
 * @author Greg Miller
 */

// -------------------------------
// class: Mojo.flow.flowResponse
// construct a new flow response
//
// variables:
//   state_type - state type of the response
//   value - string value of the response
//   data - any additional data associated with the response
//   options - any options to be passed
// -------------------------------
Mojo.flow.flowResponse = function () {
    this.state_type = null;
    this.value = null;
    this.data = null;
    this.options = null;
    this.inputVars = null;
};
Mojo.flow.flowJumpObj = function (flowNodeName, inputVars, options) {
    this.nodeName = flowNodeName;
    this.inputVars = inputVars || null;
    this.options = options || null;
}/*
 * class: Binder
 * about:
 * Functional implementation of binding a DOM element to
 *    new attributes specifed by the Mojo framework
 */
Mojo.bindings = (function () {

    var _impl = {
        resolveText : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);
            // Resolve text with '${xxxx}' - converts to data-bind labels
            $container.resolveText();
        },

// Set up two way binding (MVVC binding) 	
//-----------------------------------------	
        // -------------------------------
        // Function: bindData
        // bind the data
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindData : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);

            // Iterate over the sub-elements that have the data-bind attribute associated with them
            // and attach the element to the pubsub mechanism for two way data-binding
            jQuery("[data-bind]", $container).each(function () {

                var $el = jQuery(this),
                    def = null,
                    defaultValue = null;

                // See if this property references a model Definition
                // if it does grab the validate and formatters from the definition and
                // set them on the control
                // Note - existing validate/format DOM attributes override the ones supplied in the Definition
                var prop = $el.attr("data-bind");
                if (prop)
                    def = Mojo.model.registry.getDefforModelElement(prop);

                var isInput = $el.is("input") || $el.is("select") || $el.is("textarea");
                if (def) {
                    if (isInput) {
                        // Set formatters and validators
                        var v = $el.attr("data-validate");
                        var f = $el.attr("data-format");
                        var p = $el.attr("placeholder");
                        if (def.validate && !v) $el.attr("data-validate", def.validate.toString());
                        if (def.format && !f) $el.attr("data-format", def.format);
                        if (def.placeholderText && !p) $el.attr("placeholder", def.placeholderText);

                        // set up accessibility
                        if (def.accessibility) {
                            $el.attr("aria-label", def.accessibility);
                        }
                    }

                    defaultValue = def.defaultValue;

                    // if there is a default value specified, add it to the bind-options.
                    // Explicitly check for undefined and null, don't just test for falsiness, because we also
                    // want to pick up the defaultValue if it's a boolean(for example boolean value of false)
                    if (defaultValue != undefined && defaultValue != null) {
                        var BO = $el.attr("data-bind-options");

                        // if the defaultValue is a boolean, preserve the value as a boolean and don't cast it to a string
                        var dv = "'defaultValue' : " + ((typeof defaultValue === "boolean") ? defaultValue : ("'" + defaultValue + "'"));
                        var newBO = BO ? (BO + "," + dv) : dv;
                        $el.attr("data-bind-options", newBO);
                    }
                }

                $el.bindToModel();

            });


        },


        // -------------------------------
        // Function: bindIterators
        // bind iterators with array/collection data in model
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindIterators : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);

            // iterate through all of the elements that have a "data-iterate" attribute
            jQuery($container).find("[data-iterate]").each(function () {
                var $el = jQuery(this);

                $el.bindIterator();
            });
        },

        // -------------------------------
        // Function: bindLayout
        // bind the layout stuff (hide/show/css etc)
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindLayout : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);

            // iterate through all of the elements that have a "data-iterate" attribute
            jQuery($container).find("[data-layout]").each(function () {
                var $el = jQuery(this);

                $el.bindLayout();
            });
        },

        // -------------------------------
        // Function: bindComponents
        // bind the UI Widgets
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindComponents : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);

            // iterate through all of the elements that have are <component>
            // And replace the <component> tag with the resulting jQuery element
            jQuery($container).find("uiwidget").each(function () {
                var $el = Mojo.components.uiComponentFactory.create(jQuery(this));
                jQuery(this).replaceWith($el);
            })
        },

        // -------------------------------
        // Function: bindEvents
        // bind the events
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindEvents : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);
            //bind any <a>, <input type="button">, and <input type="submit"> to events based
            //on properties in the tag (i.e. data-nav, data-event, data-jump)
            // submit, buttons will be bound to a function that prevents immediate propagation of the event.
            jQuery("*[data-event], *[data-set], *[data-nav], *[data-jump], *[data-loadflow], *[data-loadpage]", $container).each(function () {
                jQuery(this).bindEvents()

            });
        },

        // -------------------------------
        // Function: bindFormatters
        // bind the formatters
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        bindFormatters : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);
            $container.setFormatters(true);
        },

        // -------------------------------
        // Function: unbindAll
        // Clean up of memory by unbinding all events asscociated with children of the DOM element
        //    - should be called before removing a container from the DOM
        //    - unsubscribe from all events
        //
        // Parameters:
        //    DOMElementId - the dom element identifier
        //                  or the jQuery element
        // -------------------------------
        unbindAll : function (containerId) {
            var $container = (containerId instanceof jQuery) ? containerId : jQuery("#" + containerId);

            jQuery("*[data-bind], *[data-layout], *[data-iterate]", $container).each(function (idx, el) {
                var $el = jQuery(el);
                $el.unbind();
                Mojo.unSubscribe($el[0]);
            });
        }

    }

    return _impl;

})();
Mojo.components.uiComponentFactory = (function () {

    var _impl = {
        create : function ($el) {
            var configStr = $el.attr("data"),
                configObj = null;

            try {
                if (configStr) {
                    configObj = Mojo.utils.htmlAttrParser.toJSON(configStr);
                    Mojo.utils.resolveModelRefs(configObj);
                }
            }
            catch (ex) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("componentBinder", "could not pars data specification: " + configStr));
            }

            componentName = $el.attr("name");
            var component = Mojo.uiComponents.registry.createComponent(componentName);

            if (!component) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("UIComponent", "The specified component " + component + " is not found in the list of registered components"));
                return;
            }

            // create the component, it will return a jQuery element that defines the UI layout
            // Config object may be null depending on the widget.
            // it will be up to the widgets to throw if they need the config
            return component.create($el, configObj);

        }
    }

    return _impl;
})();
/**
 * @author Greg Miller
 *
 * Data Bind
 * Purpose: easily enable two-way binding between a DOM elements and an Javascript object
 * USES:
 *   Bind an object to a DOM Element:   jQuery('#DOM_ID').bindData(object);
 *
 * To specify what data gets bound to what input we are using an HTML 5 data attribute: data-bind example:
 *   <input name="Name" type="text" id="NameTextbox" data-bind="Name" value="" placeholder="Enter Name" />
 *
 * To specify a default value, use the following syntax:
 *     - refer to another model's property as the default value
 *          <input type="text" data-bind-options="defaultValue : '$[model.property]'" />
 *     - specify plain text as the default value
 *          <input type="text" data-bind-options="defaultValue : 'plain text'" />
 *
 * This plugin is written for jQuery 1.6+
 */

jQuery.fn.extend({
    // Resolve text with '${xxxx}' to a data-binding label so that it will update as the model updates
    //
    // Important Notes: this function does a find-and-replace on the innerHTML of the container. So things like
    // data-properties (properties set via jQuery.data()) and bound listeners(on the children of the container) will be
    // lost after this function executes
    //
    // To get around the lost data-properties, You can:
    // - use jQuery.attr() instead, properties set via attr() will be reflected in the innerHTML of the parent container
    //
    // To get around the lost event listeners, you can:
    // - use event delegation to bind events to the container (ie. jQuery's on() method), since only the innerHTML of
    // the container is manipulated in this function, listeners bound at the container level are not lost
    resolveText : function () {

        var html = jQuery(this).html();

        // Look for references to $[fn:functionName], replacing the contents with the value returned by the function
        html = Mojo.utils.resolveFunctionRefs(html, true /*replace return values as strings*/);

        // Look for references to $[model.property], which means directly replace contents with the value out of model scope
        // References to FLOW_SCOPE will be bound to the current flow scoped model (this is done in the Model Registry)
        html = Mojo.utils.resolveModelRefsInString(html, true /*skip html attributes*/);

        // These will be treated as dynamic data-binding so elements on a page can update the flow scope.
        html = html.replace(Mojo.constants.flowscopeRefGlobal, function () {
            return Mojo.application.applicationController.getCurrentFlowScopeName() + "." + (arguments[1]);
        });

        // Now resolve the ${xxx} in the markup to the data-bind tags that we expect
        html = html.replace(/\$\{(.*?)\}/g, '<span data-bind="$1"></span>');
        jQuery(this).html(html);

    },


    bindToModel : function () {
        var modelRegistry = Mojo.model.registry;

        var $el = jQuery(this);

        // Get the data-bind attribute
        var boundProperty = $el.attr("data-bind");
        if (!boundProperty) {
            return;
        }

        var options = Mojo.utils.htmlAttrParser.toJSON($el.attr("data-bind-options"));
        var parsedDataRef = Mojo.utils.splitDataRef(boundProperty);
        var boundData;
        if(parsedDataRef.isCollection) {
            boundData = modelRegistry.getDataInCollection(parsedDataRef.modelName, parsedDataRef.key, parsedDataRef.index);
        }
        else {
            boundData = modelRegistry.getData(parsedDataRef.modelName, parsedDataRef.key);
        }
        // Set the value of the control
        _setElementVal($el, boundData, options);

        // See if we only need to populate the field once and not listen/broadcast changes
        // Only set the value if there is not data already present for this control
        if (!_.isUndefined(options.defaultValue)) {
            var dataExists = modelRegistry.getDataVal(boundProperty);
            // Make sure defaultValue is only set if the model data is equal to null, if it's empty string, we don't
            // want to set the defaultValue
            if (dataExists === null) {
                var dv = _resolveDefaultValue(options.defaultValue);
                _setElementVal($el, dv, options);
                _setDataVal(boundProperty, dv);
            }
        }

        // Set the data in the model (which will broadcast the change event)
        // Only on change for input elements, we don't want to set data on div or table change events

        // Radios and checkboxes bind to change event
        if ($el.is('input') && ($el.attr("type") == "checkbox" || $el.attr("type") == "radio")) {
            $el.change(function () {
                var val = null;
                if ($el.attr("type") == "checkbox") {
                    val = $el.prop("checked").toString();
                }
                else {
                    val = $el.val();
                }
                _setDataVal(boundProperty, val);
            });
        }
        // Other inputs, bind to blur event
        // Change event doesn't always fire when we want it to on Chrome
        else if ($el.is('input') || $el.is('select') || $el.is('textarea')) {
            $el.blur(function () {
                _setDataVal(boundProperty, $el.val());
            });
        }

        // Now attach a listener for two way binding
        // Listen for changed data events and respond when data matches our data-bind attribute
        $el[0].listen = function (dataObj) {
            var t = jQuery(this);
            var property = t.attr("data-bind");
            var key = property.indexOf('[') > 0 ? property.substr(0,property.indexOf('[')) : property;
            if ('undefined' !== typeof dataObj[key]) {
                var parsedDataRef = Mojo.utils.splitDataRef(property);
                var boundData;
                if(parsedDataRef.isCollection) {
                    boundData = modelRegistry.getDataInCollection(parsedDataRef.modelName, parsedDataRef.key, parsedDataRef.index);
                }
                else {
                    boundData = modelRegistry.getData(parsedDataRef.modelName, parsedDataRef.key);
                }
                _setElementVal($el, boundData, options);
            }
        };
        Mojo.subscribeForEvent(Mojo.constants.events.kDataChange, $el[0].listen, $el[0]);

// This private function is used to resolve the defaultValue specified in the model definitions
// if we see this kind of syntax "$[MODELNAME.PROPERTY]", we proceed to get the resolve it
// if there's $[] specified, we will just return the defaultValue without resolving
//-------------------------------------------------
        function _resolveDefaultValue(defaultValue) {
            return Mojo.utils.resolveModelRefs(defaultValue);
        }

// Private function for setting the value of a control
//-------------------------------------------------
        function _setElementVal(domEl, data, options) {

            // Set the value of the control from data already in our model
            if (domEl.attr("type") == "checkbox") {
                var checked = data && data !== "false";
                domEl.prop("checked", checked);
            }
            // if a radio - set the group selected item
            else if (domEl.attr("type") == "radio") {
                val = domEl.val();
                if (data === val) {
                    domEl.prop("checked", true);
                }
            }
            else if (domEl.is('input') || domEl.is('select') || domEl.is('textarea')) {
                domEl.val(data);
            }
            else if (domEl.is('span') || domEl.is('label') || domEl.is('a') || domEl.is('pre') ||
                domEl.is('h1') || domEl.is('h2') || domEl.is('h3')) {
                domEl.text(data);
            }

            if (options) {
                _handleBindingOptions(domEl, data, options);
            }
        }

// Private function for setting data in a model
// dataRef contains a full reference to a data value, which could be in a collection.  Ex: "XYZ.ModelName.CollectionName[5]"
//-------------------------------------------------
        function _setDataVal(dataRef, value, options) {
            var parsedDataRef = Mojo.utils.splitDataRef(dataRef);
            if(parsedDataRef.isCollection) {
                modelRegistry.setDataInCollection(parsedDataRef.modelName, parsedDataRef.key, parsedDataRef.index, value, options);
            }
            else {
                modelRegistry.setData(parsedDataRef.modelName, parsedDataRef.key, value, options);
            }
        }

// Private function for hiding/showing a DOM element based on model data
        function _handleBindingOptions(domEl, data, options) {
            if (!options || typeof data == "undefined") return;
            var eE = Mojo.getComponent(Mojo.interfaces.expressionEvaluator);

            // If there is a function to call due to binding
            //----------------------------------------------
            var bindFunc = options.bindFunction;
            if (bindFunc) {
                var f = Mojo.utils.stringToFunction(bindFunc);
                if (f) {
                    f(data, domEl); // call the function
                }
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "Bind function not defined: " + bindFunc, LOG_WARNING));
                }
            }

//------  DEPRICATED --------------//


            // Check if there is an element attribute that this data will
            // be bound to
            //-----------------------------------------
            var elAttr = options.elAttr;
            if (elAttr) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "elAttr is depricated - use data-layout", LOG_WARNING));
                jQuery(domEl).attr(elAttr, data);
            }


            // See if the user has defined a transition function
            var transitionFunc = options.transitionFunc;

            // Check to see if the visible option is set
            //----------------------------------------------
            var visible = options.visible;
            if (visible) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "visible is depricated - use data-layout", LOG_WARNING));

                var show = true;
//                	    // if it is a function to call, do it
                if (typeof visible === "function") {
                    show = visible(data, domEl); // execute the function
                }
                else if (typeof visible === "object") {
                    show = _evaluateExpression(eE, data, visible);
                }
                else if (typeof visible === "string") {
                    var expr = data + " eq " + visible;
                    show = eE.parseAndEvaluate(expr);
                }
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "Show function not defined in global namespace: " + visible.fn, LOG_WARNING));
                }

                // Now show/hide the element
                if (show) {
                    if (jQuery(domEl).parent().is(":hidden")) domEl.show();
                    else {
                        transitionFunc ? transitionFunc(domEl[0], "show") : domEl.show("fast");
                    }
                }
                else {
                    if (jQuery(domEl).parent().is(":hidden")) domEl.hide();
                    else {
                        transitionFunc ? transitionFunc(domEl[0], "hide") : domEl.hide("fast");
                    }
                }
            }

            // Check to see if the css option is set
            //------------------------------------------
            var css = options.css;
            if (css) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "css is depricated - use data-layout", LOG_WARNING));
                // First, evaluate the expression if one exists
                var changeCSS = false;
                var exp = css.exp;
                if (exp) {
                    changeCSS = _evaluateExpression(eE, data, exp);
                }

                // Have a callback function to determine whether or not the CSS should be changed
                var func = css.func;
                if (func && (typeof func === "function")) {
                    changeCSS = func(data, domEl);
                }

                if (css.className) {
                    if (changeCSS)
                        domEl.addClass(css.className);
                    else
                        domEl.removeClass(css.className);
                } else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "CSS className is missing.", LOG_INFO));
                }
            }

            // Check to see if the style option is set
            //------------------------------------------
            var style = options.style;
            if (style) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "style is depricated - use data-layout", LOG_WARNING));
                // First, evaluate the expression if one exists
                var changeStyle = false;
                var exp = style.exp;
                if (exp) {
                    changeStyle = _evaluateExpression(eE, data, exp);
                }

                // Have a callback function to determine whether or not the style should be changed
                var func = style.func;
                if (func && (typeof func === "function")) {
                    changeStyle = func(data, domEl);
                }

                var prop = style.prop;
                if (prop) {
                    if (changeStyle) {
                        for (var p in prop)
                            domEl.css(p, prop[p]);
                    } else {
                        for (var p in prop)
                            domEl.css(p, "");
                    }
                } else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "CSS style prop is missing.", LOG_INFO));
                }
            }

            // Check to see if the disabled option is set
            //----------------------------------------------
            var disabled = options.disabled;
            if (disabled) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "disabled is depricated - use data-layout", LOG_WARNING));
                var makeDisabled = false;
//                	    // if it is a function to call, do it
                if (typeof disabled === "function") {
                    makeDisabled = disabled(data, domEl); // execute the function
                }
                else if (typeof disabled === "object") {
                    makeDisabled = _evaluateExpression(eE, data, disabled);
                }
                else if (typeof disabled === "string") {
                    var expr = data + " eq " + disabled;
                    makeDisabled = eE.parseAndEvaluate(expr);
                }
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "Disabled function not defined in global namespace: " + disabled.fn, LOG_WARNING));
                }

                // Now show/hide the element
                if (makeDisabled) {
                    if (jQuery(domEl).is("input")) {
                        jQuery(domEl).attr("disabled", "disabled");
                    } else {
                        jQuery(domEl).addClass("disabled");
                    }
                }
                else {
                    jQuery(domEl).removeAttr("disabled");
                }
            }
            // check if there is a prepend option set.
            // should only be used on text (?) elements
            //------------------------------------------
            var prepend = options.prepend;
            if (prepend) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "prepend is depricated - use data-layout", LOG_WARNING));
                var doPrepend = false;
//                	    // if it is a function to call, do it
                var exp = prepend.exp;
                if (exp) {
                    doPrepend = _evaluateExpression(eE, data, exp);
                }

                // Have a callback function to determine whether or not the style should be changed
                var func = prepend.func;
                if (func && (typeof func === "function")) {
                    doPrepend = func(data, domEl);
                }

                //need a jQuery object. wrap it in case.
                var thisEl = jQuery(domEl);
                // Now prepend our text. in the .text() for non-inputs, .before for inputs
                if (prepend.placeBefore) {
                    if (doPrepend)
                    //check if it's an input, don't want to pollute any data vals
                        if (!thisEl.is(':input')) {
                            thisEl.text(prepend.placeBefore + thisEl.text());
                        } else if (thisEl.is(':input')) {
                            thisEl.before('<span>' + prepend.placeBefore + '</span>');
                        }
                } else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "Prepend string (placeBefore) is missing.", LOG_INFO));
                }
            }

            // check if there is a append option set.
            //------------------------------------------
            var append = options.append;
            if (append) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("data-bind-options", "append is depricated - use data-layout", LOG_WARNING));
                var doAppend = false;

                var exp = append.exp;
                if (exp) {
                    doAppend = _evaluateExpression(eE, data, exp);
                }

                // Have a callback function to determine whether or not the style should be changed
                var func = append.func;
                if (func && (typeof func === "function")) {
                    doAppend = func(data, domEl);
                }

                //need a jQuery object. wrap it in case.
                var thisEl = jQuery(domEl);
                // Now append our text. in the .text() for non-inputs, .before for inputs
                if (append.placeAfter) {
                    if (doAppend)
                    //check if it's an input, don't want to pollute any data vals
                        if (!thisEl.is(':input')) {
                            thisEl.text(thisEl.text() + append.placeAfter);
                        } else if (thisEl.is(':input')) {
                            thisEl.after('<span>' + append.placeAfter + '</span>');
                        }
                } else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("DataBinder", "Append string (placeAfter) is missing.", LOG_INFO));
                }
            }


        }

        function _evaluateExpression(eE, data, expr) {
            var test = true;
            for (var op in expr) {
                test = ( test && eE.evaluate([data, op, expr[op]]) );
            }

            return test;
        }


    }

});
jQuery.fn.extend({
// Bind well know events to anchor, button, and submit button tags
// events will be specified as attribtues of the control
// Supported events:
//      : data-nav = <navigation value>
//        data-nav-options = { validate: <true | false> }
//
//      : data-jump = <path value>
//        data-jump-options = { validate: <true | false> }
//
//      : data-loadpage = <pageAlias>
//        data-loadpage-options = { validate: <true | false> }
//
//      : data-loadflow = <flowAlias>
//        data-loadflow-options = { validate: <true | false> }
//
//      : data-event = <custom event name>
//        data-event-options = <{ custom event options }>
//
//      : data-set = <'model.propname':'value'>
//

    bindEvents:function () {

        var self = this;

        // Execute any custom events or data setting before we navigate
        if (this.attr('data-event')) {
            var evt = this.attr('data-event');
            var options = this.attr('data-event-options');
            options = Mojo.utils.jsonSerializer.toJSON(options, true) || {};
            this.prop("event-options", options);
            this.click(function () {
                Mojo.publishEvent(evt, jQuery(this).prop("event-options"));
            });

        }
        if (this.attr('data-set')) {
            var setProperty = this.attr("data-set");
            var setObject = Mojo.utils.htmlAttrParser.toJSON(setProperty);
            this.click(function () {
                for (var property in setObject) {
                    var setValue = setObject[property];
                    var parsedProperty = Mojo.utils.splitDataRef(property);
                    if(parsedProperty.isCollection) {
                        Mojo.setDataInCollection(parsedProperty.modelName, parsedProperty.key, parsedProperty.index, setValue);
                    }
                    else {
                        Mojo.setData(parsedProperty.modelName, parsedProperty.key, setValue);
                    }
                }
            });
        }

        // Load a flow if we need to
        if (this.attr('data-loadflow')) {
            var options = this.attr('data-loadflow-options');
            options = Mojo.utils.jsonSerializer.toJSON(options, true) || {};
            options.flow = this.attr('data-loadflow');
            this.prop("loadflow-options", options);

            var throttledEventHandler = _throttle(function (event) {
                event.preventDefault();
                Mojo.publishEvent(Mojo.constants.events.kNavigation, jQuery(this).prop("loadflow-options"));
            });

            this.click(throttledEventHandler);
        }

        // Navigation Events
        // Only one of these can be specified
        //-------------------------------
        if (this.attr('data-nav')) {
            var options = this.attr('data-nav-options');
            options = Mojo.utils.jsonSerializer.toJSON(options, true) || {};
            options.nav = this.attr('data-nav');
            this.prop("nav-options", options);

            var throttledEventHandler = _throttle(function (event) {
                event.preventDefault();
                Mojo.publishEvent(Mojo.constants.events.kNavigation, jQuery(this).prop("nav-options"));
            });

            this.click(throttledEventHandler);
        }
        else if (this.attr('data-jump')) {
            var options = this.attr('data-jump-options');
            options = Mojo.utils.jsonSerializer.toJSON(options, true) || {};
            options.jump = this.attr('data-jump');
            this.prop("jump-options", options);

            var throttledEventHandler = _throttle(function (event) {
                event.preventDefault();
                Mojo.publishEvent(Mojo.constants.events.kNavigation, jQuery(this).prop("jump-options"));
            });

            this.click(throttledEventHandler);
        }

        else if (this.attr('data-loadpage')) {
            var options = this.attr('data-loadpage-options');
            options = Mojo.utils.jsonSerializer.toJSON(options, true) || {};
            options.load = this.attr('data-loadpage');
            this.prop("loadpage-options", options);

            var throttledEventHandler = _throttle(function (event) {
                event.preventDefault();
                Mojo.publishEvent(Mojo.constants.events.kNavigation, jQuery(this).prop("loadpage-options"));
            });

            this.click(throttledEventHandler);
        }



        // return a "throttled" function that can only be called once every 500ms
        function _throttle(func, context) {
            var isBlocked = false;

            return function() {
                if(!isBlocked) {
                    func.apply(context ? context : this, Array.prototype.slice.call(arguments, 0));
                    isBlocked = true;
                }

                setTimeout(function() {
                    isBlocked = false;
                }, 500);
            }
        }


    }
});
/*
* Formatter
* Written by Greg Miller 
* Purpose: attach formatters to input fields so that data is formatted as the user types

* This plugin is written for jQuery 1.6+
* 
* valid formatter values 
* 	mask : <masked char set using the '#' symbol for replaceable characters
* 	date : <masked date value using Y=year, M=month, D=day,  ex. DD/MM/YYYY
* 	number : <precision> or null if no formatting is requested
*/

jQuery.fn.extend({
   setFormatters : function(autoFormatOnLoad) {
       // Find all of the input fields that have a "data-format" attribute
       var fields = jQuery(this).find("[data-format]");

       // Iterate through all of the fields, and setup listeners and strategies
       jQuery.each(fields, function() {
           var $control = jQuery(this),
               formatStr = $control.attr("data-format"),
               formatter = Mojo.utils.htmlAttrParser.toArray(formatStr)[0];

           //attach the formatter object to the control, so on keyup we can just pull it from the control and use it
           $control.data("formatter", formatter);

           $control.keyup(function(event) {
               $control.format(event);
           });

           if(autoFormatOnLoad)
               //since the formatter expects an event, send a fake keydown. code 38 is 'up arrow' key
               $control.format(jQuery.Event("keydown", { keyCode: 38 }));
       });
   },

   format : function(event) {
       var $control = jQuery(this),
           formatter = $control.data("formatter"); // get the formatter object from the control

       if(!formatter) return;

       var vals = formatter.split("=");

       Mojo.inputStrategies.strategies.executeStrategy(Mojo.inputStrategies.strategies.FORMAT, jQuery(this), event, vals[0], vals[1]);
   }
});

jQuery.fn.extend({
    /*
     * Function: bindIterator
     * base on the currently selected jquery dom element, this function finds all children elements
     * that have the "data-iterate" attribute. Once these elements are identified, this function will
     * resolve all of the data-binding elements found within these elements and output a modified dom element.
     *
     * NOTE: the use of attr() over data() is employed at several places because we want the data to be persisted in the
     * innerHTML of the container, the properties we set via $.data() is not reflected in the innerHTML.
     */
    bindIterator : function () {
        var modelRegistry = Mojo.model.registry;

        // used for resolving the data-iterator-property bindings on children of an iterator container
        var _resolveIteratorBindings = function ($container, /* currently iterated object */currentObject, currentIndex, iteratorBoundProperty) {
            function _setVal(boundControl, data) {
                if (boundControl.attr("type") == "checkbox") {
                    var checked = data && data !== "false";
                    boundControl.attr("checked", checked);
                }
                // if a radio - set the group selected item
                else if (boundControl.attr("type") == "radio") {
                    var val = boundControl.val();
                    if (data === val) {
                        boundControl.attr("checked", true);
                    }
                }
                else if (boundControl.is('input') || boundControl.is('select')) {
                    boundControl.attr("value", data);
                }
                else if (boundControl.is('span') || boundControl.is('label') || boundControl.is('a') || boundControl.is('pre') ||
                    boundControl.is('h1') || boundControl.is('h2') || boundControl.is('h3')) {
                    boundControl.text(data);
                }
                else if (boundControl.is('div') && boundControl.attr("data-iterate-callback")) {
                    var callbackFuncName = boundControl.attr("data-iterate-callback");
                    var fn = Mojo.utils.stringToFunction(callbackFuncName);
                    if (fn)
                        fn(boundControl[0], currentObject, currentIndex);
                }
            }

            ;

            // make a clone of the enumerable container so changes are not made to the original
            var $clone = $container.clone();

            jQuery.each($clone.find("[data-iterator-property]"), function () {
                var $boundControl = jQuery(this);
                var boundProperty = $boundControl.attr("data-iterator-property");
                var data = currentObject[boundProperty];

                // get the value from the model and bind it to the ui
                _setVal($boundControl, data);

                if ($boundControl.is("input")) {
                    // store the current array index into the control so we can access it later
                    $boundControl.attr("data-current-index", currentIndex);
                }
            });

            // iterate through all of the filters to determine whether or not a DOM element should be hidden
            jQuery.each($clone.find("[data-iterator-filter]"), function () {
                var $boundControl = jQuery(this);
                var filter = $boundControl.attr("data-iterator-filter");

                if (filter) {
                    var fn = Mojo.utils.stringToFunction(filter);
                    if (fn) {
                        filterResult = fn(currentObject);

                        // if the filterResult is false, hide the DOM element
                        if (!filterResult) {
                            $boundControl.hide();
                        }
                    }
                }
            });

            // perform enum index token replacement
            var innerHTML = $clone.html().replace(/\$iteratorIndex/g, currentIndex);
            return innerHTML;
        };

        /*
         * Function: _resolveBindingForControl (inner function)
         * resolves all of the data-binding within a "data-iterate" DOM element
         */
        var _resolveBindingForControl = function ($control) {
            var boundProperty = $control.attr("data-iterate"),
                boundData = modelRegistry.getDataVal(boundProperty), // this should be an array
                iteratedSections = [],
                newHTMLContent = "";

            // if the property to be iterated over is not an instance of Array, return right away
            if (!(boundData instanceof Array)) {
                return;
            }

            // generate all of the new sections
            for (var i = 0; i < boundData.length; i++) {
                var currentData = boundData[i];
                var section = _resolveIteratorBindings($control[0].originalTemplate, currentData, i, boundProperty);
                iteratedSections.push(section);
            }

            // before appending the new sections to the control, empty it first
            $control.empty();

            // now append all of the newly generated sections to this control
            for (var i = 0, l = iteratedSections.length; i < l; i++) {
                newHTMLContent += iteratedSections[i];
            }
            $control.html(newHTMLContent);

            // now that the enumerable ui is resolved, let's apply our normal data-binding and layout-binding rules on it
            Mojo.bindings.bindData($control.attr("id"));
            Mojo.bindings.bindLayout($control.attr("id"));
        };

        // the input field has changed, update the model to contain the most recent input field value
        function _updateModelData($el) {
            var val = $el.attr("type") == "checkbox" ? $el.prop("checked") : $el.attr("value");
            var index = $el.attr("data-current-index");
            var propertyName = $el.attr("data-iterator-property");
            var iteratorObjectName = $el.closest("[data-iterate]").attr("data-iterate");

            //Mojo.getDataVal(iteratorObjectName)[index][propertyName] = val;
            try {
                var modelName = iteratorObjectName.split('.')[0];
                var collectionName = iteratorObjectName.split('.')[1];
                var model = Mojo.model.registry.getModel(modelName);
                var obj = model.getDataVal(collectionName)[index];
                obj[propertyName] = val;
                var newObject = {};
                jQuery.extend(true, newObject, obj);  // make a copy, so new object is seen by setDataInCollection, and event is dispatched
                model.setDataInCollection(collectionName, index, newObject);
            }
            catch (ex) {
                TRACE("Exception updating model data for iterator " + iteratorObjectName, ["bindIterator", "_updateModelData"], Mojo.utils.trace.ERROR);
            }
        }

        var $control = jQuery(this);

        // check to see if it has a callback function defined, if so iterate through the collection object and execute
        // the callback
        var callBackFuncName = $control.attr("data-iterate-callback");
        if (callBackFuncName) {
            var boundProperty = $control.attr("data-iterate"),
                boundDataArray = modelRegistry.getDataVal(boundProperty);

            for (var i = 0, l = boundDataArray.length; i < l; i++) {
                var fn = Mojo.utils.stringToFunction(callbackFuncName);
                if (fn)
                    fn(boundDataArray[i], $control[0]);
            }

            // don't do anything else, it's now up to the callback provider to determine what they want to do
            return;
        }

        // save off the original template, the reason for doing this is that
        // after this point, the control's content will be modified, so later on if
        // we need to do work on the original $control content, then we'll have a way
        // to access it
        $control[0].originalTemplate = $control.clone();

        _resolveBindingForControl($control);

        // setup model-to-ui binding
        if (!$control[0].listen) {
            $control[0].listen = function (dataObj) {
                var $el = jQuery(this);
                var iteratingOver = $el.attr("data-iterate");
                if (iteratingOver === (dataObj['modelName'] + "." + dataObj['key']) && $el.is(":visible")) {
                    _resolveBindingForControl($el);
                }
            };

            Mojo.subscribeForEvent(Mojo.constants.events.kDataChange, $control[0].listen, $control[0]);
        }

        // setup ui-to-model binding, note that we are setting the "onblur" listener on the container control rather
        // than on each of the child elements that contain attribute "data-iterator-property". There are two reasons to do this.
        // 1. better performance (using event delegation)
        // 2. even if the innerHTML of the container gets rewritten, we won't lose these listeners
        $control.on("blur", "input[type='text']", function (event) {
            var $el = jQuery(this);
            _updateModelData($el);

            // stop event propagation so nested iterators won't conflict
            event.stopPropagation();
        });

        $control.on("change", "input[type='checkbox']", function (event) {
            var $el = jQuery(this);
            _updateModelData($el);

            // stop event propagation so nested iterators won't conflict
            event.stopPropagation();
        });

        $control.on("change", "input[type='radio']", function (event) {
            var $el = jQuery(this);
            _updateModelData($el);

            // stop event propagation so nested iterators won't conflict
            event.stopPropagation();
        });
    }

});
/*
 * @author Greg Miller
 *
 * Layout Binder
 *
 * Purpose: Easily enable changing the look of a DOM elements based on simple expressions or function callbacks expressed in HTML markup
 *
 * Usage : Add the data-layout attribute to any HTML element with the following options
 *         *** - References to any model values inside of expressions will need to use the @[model.key] syntax if you want them to dynamically change
 *
 * Valid options :
 *
 *   listen : Model.key  - the element will update when this model key changes, can be an array of models to listen to
 *
 *      ex: listen: 'myModel.billingCCType'
 *      ex: listen: ['myModel.val1', 'otherModel.val1']
 *
 *   visible :  - the element will display depending on the value of the exp or fn
 *      - valid options
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *          transitionFunc : a function to call to hide/show the element if you don't like Mojo's default functionality
 *
 *      ex: data-layout="{visible: { exp: '@[myModel.firstName] eq \'Mojo\'' }}"
 *      ex: data-layout="{visible: { exp: '@[myModel.firstName] eq \'Mojo\'' }, listen : 'myModel.firstName}"
 *      ex: data-layout="{visible: { exp: '@[myModel.firstName] eq \'Mojo\'' }, listen : [myModel.firstName, myModel.lastName]}"
 *      ex: data-layout="{visible: { fn: 'VIEW_SCOPE.test' }}"
 *
 *   disabled :  - the element will appear disabled or have a class of 'disabled' added depending on the value of the exp or fn
 *      - valid options
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *
 *      ex: data-layout="{disabled: { exp: '@[myModel.firstName] eq \'Mojo\'' }}"
 *
 *   css :  - add a class to the element based on the value of the exp, fn, or modelVal
 *            NOTE : If exp, fn, or modelVal evaluates to true | false or has a value, then the 'className' will be applied if there is one,
 *                   If no 'className' is specified then the value of the exp, fn, or modelVal will be applied as the 'className'
 *      - valid options
 *          className : class to add/remove (can be an array)
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *          modelVal : extract the value from a model to get the classname value
 *
 *      ex: data-layout="{css: { className:'important', exp: '@[myModel.SSN] eq 666-66-6666' }}"
 *      ex: data-layout="{css: { modelVal: '@[myModel.someclass]}}"
 *
 *   style :  - add a class to the element based on the value of the exp, fn, or modelVal
 *            NOTE : If exp, fn, or modelVal evaluates to true | false or has a value, then the 'prop' will be applied if there is one,
 *                   If no 'prop' is specified then the value of the exp, fn, or modelVal will be applied as the 'prop'
 *      - valid options
 *          prop : object that contains a list of styles to add/remove
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *          modelVal : extract the value from a model to get the property value
 *
 *      ex: data-layout="{style: { prop: { 'background-color':'yellow', 'font-weight':'bolder'}, exp: '@[myModel.SSN] eq 666-66-6666'}}"
 *      ex: data-layout="{style: { modelVal: '@[myModel.someclass]}}"
 *
 *   attr :  - add an attribute to the element based on the value of the exp, fn, or modelVal
 *
 *      - valid options
 *          name : name of the attribute to add/change
 *          fn : function to call that resolves the value
 *          exp : Mojo expression to run that resolves to the value (probably shouldn't use this since most expressions evaluate to true or false)
 *          modelVal : extract the value from a model to get the name value
 *
 *      ex: data-layout="{attr: { name:'src', modelVal: '@[myModel.imgSrc]' }}"
 *      ex: data-layout="{attr: { name:'src', fn: 'ActionClass.getImgSrc' }}"
 *
 *   replaceText :  - replace the text of an element based on the value of the exp, fn, or modelVal
 *
 *      - valid options
 *          fn : function to call that resolves the text
 *          exp : Mojo expression to run that resolves to the text (probably shouldn't use this since most expressions evaluate to true or false)
 *          modelVal : extract the value from a model to get the text
 *
 *      ex: data-layout="{replaceText: { fn: 'ActionClass.getTextForMe()' }, listen : 'SomeModel.val' }"
 *      ex: data-layout="{replaceText: { modelVal: '@[myModel.imgSrc]' }}"
 *
 *   prepend :  - prepend text before the current text in a span or input
 *            NOTE : If exp, fn, or modelVal evaluates to true | false or has a value, then the 'prepend' will be applied if there is one,
 *                   If no 'prepend' is specified then the value of the exp, fn, or modelVal will be applied as the 'prepend'
 *      - valid options
 *          placeBefore : text to be placed before
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *          modelVal : extract the value from a model to get the placebefore value
 *
 *      ex: data-layout="{prepend: { exp: '@[myModel.firstName] eq \'Mojo\'', placeBefore : "THE" }}
 *      ex: data-layout="{prepend: { modelVal: '@[myModel.someText]}}"
 *
 *   append :  - append text after the current text in a span or input
 *            NOTE : If exp, fn, or modelVal evaluates to true | false or has a value, then the 'append' will be applied if there is one,
 *                   If no 'append' is specified then the value of the exp, fn, or modelVal will be applied as the 'append'
 *      - valid options
 *          placeAfter : text to be placed before
 *          fn : function to call that resolves to true | false
 *          exp : Mojo expression to run that resolves to true | false
 *          modelVal : extract the value from a model to get the placeafter value
 *
 *      ex: data-layout="{append: { exp: '@[myModel.firstName] eq \'Mojo\'', placeAfter : " ,get some" }}
 *      ex: data-layout="{append: { modelVal: '@[myModel.someText]}}"
 */
jQuery.fn.extend({

    bindLayout : function () {
        var $el = jQuery(this);
        var layout = $el.attr("data-layout");
        var eE = Mojo.getComponent(Mojo.interfaces.expressionEvaluator);

        if (!layout) return;

        // Convert the html attribute to an Object
        layout = Mojo.utils.htmlAttrParser.toJSON(layout);

        // Attach a listener for data binding if a listener is specified
        // May be a single listener or array of them
        if (layout.listen) {
            $el[0].listen = function (dataObj) {
                var t = jQuery(this);
                var n = layout.listen;
                if (jQuery.isArray(n)) {
                    jQuery.each(n, function (idx, val) {
                        _check(val)
                    })
                }
                else {
                    _check(n)
                }
                function _check(val) {
                    if ('undefined' !== typeof dataObj[val]) {
                        _apply();
                    }
                }

            }
            Mojo.subscribeForEvent(Mojo.constants.events.kDataChange, $el[0].listen, $el[0]);
        }
        _apply();


        // Inner function to apply the layouts
        function _apply() {
            // Now bind to the specification
            //-------------------
            // VISIBLE
            //-------------------
            if (layout.visible) {
                var visible = layout.visible;
                var show = true;

                if (visible.fn) {
                    show = Mojo.utils.resolveFunctionRefs(visible.fn, false, $el);
                }
                else if (visible.exp) {
                    show = eE.parseAndEvaluate(visible.exp);
                }
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: visible", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.visible), LOG_ERROR));
                }


                // Now show/hide the element
                if (show) {
                    if (jQuery($el).parent().is(":hidden")) $el.show();
                    else {
                        if (visible["transitionFunc"]) {
                            visible["transitionFunc"]($el[0], "show")
                        }
                        else {
                            $el.show("fast");
                        }
                    }
                }
                else {
                    if (jQuery($el).parent().is(":hidden")) $el.hide();
                    else {
                        visible["transitionFunc"] ? visible["transitionFunc"]($el[0], "hide") : $el.hide("fast");
                    }
                }
            }


            //-------------------
            // DISABLED
            //-------------------
            if (layout.disabled) {
                var disabled = layout.disabled;
                var makeDisabled = false;

                if (disabled.fn) {
                    makeDisabled = Mojo.utils.resolveFunctionRefs(disabled.fn, false, $el);
                }
                else if (disabled.exp) {
                    makeDisabled = eE.parseAndEvaluate(disabled.exp);
                }
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: disabled", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.disabled), LOG_ERROR));
                }


                if (makeDisabled) {
                    jQuery($el).attr("disabled", "disabled");
                    jQuery($el).addClass("disabled");

                }
                else {
                    jQuery($el).removeAttr("disabled");
                    jQuery($el).removeClass("disabled");
                }
            }


            //-------------------
            // CSS
            //-------------------
            if (layout.css) {
                try {
                    var css = layout.css,
                        changeCSS = false,
                        classes = css.className;

                    if (css.fn) {
                        changeCSS = Mojo.utils.resolveFunctionRefs(css.fn, false, $el);
                    }
                    else if (css.exp) {
                        changeCSS = eE.parseAndEvaluate(css.exp);
                    }
                    else if (css.modelVal) {
                        var v = (css.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            classes = Mojo.getDataVal(v[1]) || "";
                        }
                        else {
                            classes = css.modelVal;
                        }

                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: css", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.css), LOG_ERROR));
                    }


                    if (classes) {
                        // turn single element into array so we can iterate
                        if (_.isString(classes))
                            classes = [classes];
                        jQuery.each(classes, function (idx, cls) {
                            if (changeCSS)
                                $el.addClass(cls);
                            else
                                $el.removeClass(cls);

                        });
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: css", "no classes to change", LOG_WARNING));
                    }
                }
                catch (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid css: " + Mojo.utils.jsonSerializer.toString(layout.css));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }

            }

            //-------------------
            // STYLE
            //-------------------
            if (layout.style) {
                try {
                    var style = layout.style;
                    var changeStyle = false;
                    var styles = style.prop || {};

                    if (style.fn) {
                        changeStyle = Mojo.utils.resolveFunctionRefs(style.fn, false, $el);
                    }
                    else if (style.exp) {
                        changeStyle = eE.parseAndEvaluate(style.exp);
                    }
                    else if (style.modelVal) {
                        changeStyle = true;
                        var v = (style.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            styles = Mojo.getDataVal(v[1]);
                            styles = Mojo.utils.jsonSerializer.toJSON(styles, true);
                        }
                        else {
                            styles = style.modelVal;
                        }
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: style", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.style), LOG_ERROR));
                    }


                    if (styles) {
                        jQuery.each(styles, function (name, val) {
                            if (changeStyle)
                                $el.css(name, val);
                            else
                                $el.css(name, "");
                        });
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: style", "CSS style prop is missing.", LOG_WARNING));
                    }
                }
                catch (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid style: " + Mojo.utils.jsonSerializer.toString(layout.style));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }
            }

            //----------------------------------
            // ATTR - Change/Add a DOM attribute
            //----------------------------------
            if (layout.attr) {
                try {
                    var attr = layout.attr;
                    var val = "";
                    if (attr.fn) {
                        val = Mojo.utils.resolveFunctionRefs(attr.fn, false, $el);
                    }
                    else if (attr.exp) {
                        val = eE.parseAndEvaluate(attr.exp);
                    }
                    else if (attr.modelVal) {
                        var v = (attr.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            val = Mojo.getDataVal(v[1]) || "";
                        }
                        else {
                            val = attr.modelVal;
                        }
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: attr", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.attr), LOG_ERROR));
                    }

                    if (attr.name) {
                        jQuery($el).attr(attr.name, val);
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: attr", "Invalid specification: missing 'name': " + Mojo.utils.jsonSerializer.toString(layout.attr), LOG_ERROR));
                    }
                }
                catch (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid attr: " + Mojo.utils.jsonSerializer.toString(layout.attr));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }

            }

            //----------------------------------
            // ReplaceText - Change the text of a DOM node
            //----------------------------------
            if (layout.replaceText) {
                var replaceText = layout.replaceText;

                try {
                    var val = "";
                    if (replaceText.fn) {
                        val = Mojo.utils.resolveFunctionRefs(replaceText.fn, false, $el);
                    }
                    else if (replaceText.exp) {
                        val = eE.parseAndEvaluate(replaceText.exp);
                    }
                    else if (replaceText.modelVal) {
                        var v = (replaceText.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            val = Mojo.getDataVal(v[1]) || "";
                        }
                        else {
                            val = replaceText.modelVal;
                        }
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: replaceText", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.replaceText), LOG_ERROR));
                    }

                    jQuery($el).text(val);

                }
                catch (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid replaceText: " + Mojo.utils.jsonSerializer.toString(layout.replaceText));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }

            }

            //-------------------
            // PREPEND
            //-------------------
            if (layout.prepend) {
                try {
                    var prepend = layout.prepend;
                    var text = prepend.placeBefore || "";
                    var doPrepend = false;

                    if (prepend.fn) {
                        doPrepend = Mojo.utils.resolveFunctionRefs(prepend.fn, false, $el);
                    }
                    else if (prepend.exp) {
                        doPrepend = eE.parseAndEvaluate(prepend.exp);
                    }
                    else if (prepend.modelVal) {
                        doPrepend = true;
                        var v = (prepend.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            text = Mojo.getDataVal(v[1]);
                        }
                        else {
                            text = prepend.modelVal;
                        }
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: prepend", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.prepend), LOG_ERROR));
                    }

                    // Now prepend our text. in the .text() for non-inputs, .before for inputs
                    if (text) {
                        if (doPrepend)
                        //check if it's an input, don't want to pollute any data vals
                            if (!$el.is(':input')) {
                                $el.text(text + $el.text());
                            } else if ($el.is(':input')) {
                                $el.before('<span>' + text + '</span>');
                            }
                    }
                    else if (doPrepend) {
                        if (!$el.is(':input')) {
                            $el.text(text + $el.text());
                        } else if ($el.is(':input')) {
                            $el.before('<span>' + text + '</span>');
                        }
                    }
                }
                catch
                    (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid prepend: " + Mojo.utils.jsonSerializer.toString(layout.prepend));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }
            }


            //-------------------
            // APPEND
            //-------------------
            if (layout.append) {
                try {
                    var append = layout.append;
                    var text = append.placeAfter || "";
                    var doAppend = false;

                    if (append.fn) {
                        doAppend = Mojo.utils.resolveFunctionRefs(append.fn, false, $el);
                    }
                    else if (append.exp) {
                        doAppend = eE.parseAndEvaluate(append.exp);
                    }
                    else if (append.modelVal) {
                        doAppend = true;
                        var v = (append.modelVal).match(Mojo.constants.modelRegex);
                        if (v) {
                            text = Mojo.getDataVal(v[1]);
                        }
                        else {
                            text = append.modelVal;
                        }
                    }
                    else {
                        Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("LayoutBinder: append", "Invalid specification: " + Mojo.utils.jsonSerializer.toString(layout.append), LOG_ERROR));
                    }


                    // If there is a placeAfter attribute, use the text in there
                    if (text) {
                        if (doAppend)
                        //check if it's an input, don't want to pollute any data vals
                            if (!$el.is(':input')) {
                                $el.text($el.text() + append.placeAfter);
                            } else if ($el.is(':input')) {
                                $el.after('<span>' + append.placeAfter + '</span>');
                            }
                    }
                    // Otherwise use the value extracted from the model
                    else if (doAppend) {
                        if (!$el.is(':input')) {
                            $el.text($el.text() + text);
                        } else if ($el.is(':input')) {
                            $el.after('<span>' + text + '</span>');
                        }
                    }
                }
                catch
                    (ex) {
                    if (ex instanceof MojoException) {
                        ex.addContext("Invalid append: " + Mojo.utils.jsonSerializer.toString(layout.append));
                    }
                    Mojo.publishEvent(Mojo.constants.events.kException, ex);
                }
            }


        }
    }

});
Mojo.enableValidationPlugin = function (strategies) {
    jQuery.fn.validate = function (showMultipleErrors) {
        var t = this;

        // accepts a single validator string with commas already replaced with _comma_
        // returns an object with properties {type, args, message}
        var parseSingleValidator = function(validatorStr) {
            var validator = {};
            validatorStr = Mojo.utils.replaceCharWithinParenthesis(validatorStr, ":", "_colon_");
            var parts = validatorStr.split(':');

            // replace foo(something) with foo=something
            var expression = parts[0].replace(/([a-zA-Z]+\(.+\))+/g, function(str) {
                return str.replace(/\(/,"=").replace(/\)$/,"");
            });
            var expressionParts = expression.split('=');
            validator.type = expressionParts[0];
            validator.args = expressionParts[1] ? expressionParts[1].replace(/_comma_/g,",") : null;
            validator.options = {};

            // get the options, which are after the colon (currently only :message(string) is used)
            for(var optionIndex = 1; optionIndex<parts.length; optionIndex+=1) {
                expression = parts[optionIndex].replace(/([a-zA-Z]+\(.+\))+/g, function(str) {
                    return str.replace(/\(/,"=").replace(/\)$/,"");
                });
                expressionParts = expression.split('=');
                var optionName = expressionParts[0];
                validator.options[optionName] = expressionParts[1] ? expressionParts[1].replace(/_comma_/g,",").replace(/_colon_/g,":").removeQuotes() : null;
            }
            return validator;
        };

        var parseValidators = function(htmlAttr) {
            // we need to remove spaces around commas that are used to separate some parameters
            // but leave other spaces, which could occur within a custom message (as in regex validation)
            htmlAttr = htmlAttr.replace(/(^\s*)|(\s*$)/g,"");  // remove leading and trailing spaces
            htmlAttr = htmlAttr.replace(/(\s*,\s*)/g,","); // remove spaces around commas
            // Encode stuff between parens (so we can split on commas)
            htmlAttr = Mojo.utils.replaceCharWithinParenthesis(htmlAttr, ",", "_comma_");

            var validatorStrings = htmlAttr.split(',');
            var validators = [];
            jQuery.each(validatorStrings, function (validatorIndex, validatorStr)  {
                validators.push(parseSingleValidator(validatorStr));
            });
            return validators;
        };

        // if this element doesn't have a validator attribute, or if the value of the validator attribute is empty, null or false,
        // or if the element is not an input, return right away
        if (!t.attr("data-validate"))
            return "";

        var validatorStr = t.attr("data-validate"),
            validationResult = null,
            error = "",
            validators = parseValidators(validatorStr);


        for (var i = 0; i < validators.length; i++) {
            var validator = validators[i];
            if(validator.options.message) {
                // add the validator message as custom data attached to this jQuery element
                this.data(validator.type + "_msg", validator.options.message);
            }
            validationResult = strategies.executeStrategy(Mojo.inputStrategies.strategies.VALIDATE, this, null /*<-- this would be the event if it were a formatter*/, validator.type, validator.args);
            if (validationResult) {
                Mojo.publishEvent(Mojo.constants.events.kValidationFailed, t.get(0));

                error += validationResult + "<br />";
                if (!showMultipleErrors) break;
            }

        }
        return error;

    }


};
/*
 * class: BaseStrategy
 * Validation Strategy Interface
 */
Mojo.inputStrategies.baseStrategy = Class.extend({

    validTaints:null, // (optional) - A list of valid taints for this stragegy - if no taints are applicable, do not override.
    taintable:false,
    regex:null,
    defaultMessage: null,  // defaultMessage needs to be null in the base class
    getError:function ($el) {
        var customMessage = $el.data(this.name + '_msg');
        return customMessage || "Invalid input";
    }, // (optional) - Default message to show the user

    // -------------------------------
    // Function: construct
    // construct a new BaseStrategy
    //
    // variables:
    //   taintable - the boolean value to allow alternative formats
    //   maskChar - the default masking character
    // -------------------------------
    construct:function () {
        // Define our member variables;
        this.taintable = false;
        this.maskChar = "#";
    },

    // -------------------------------
    // Function: validate
    // Base functionality tests against taints, then regex
    //
    // Parameters:
    //   value - the value to be validated
    // -------------------------------
    validate:function ($el) {
        var value = $el.val();

        // Test against taint
        // If taint passes, return no error
        if (this.taintable && this.validTaints && typeof this.validTaints === "object") {
            var s = value.toLowerCase();
            s = s.replace(/ /g, "");
            if (jQuery.inArray(s, this.validTaints) >= 0) {
                return;
            }
        }

        // Test against regex
        if (this.regex) {
            var regexp = new RegExp(this.regex);
            if (!regexp.test(value)) {
                // doesn't match the regex
                return this.getError($el);
            }
        }
    },

    // -------------------------------
    // Function: formatAgainstMask
    // format the element value using the elements mask
    //
    // Parameters:
    //   $el - the element's value will be formatted
    //   inVal - the mask format
    // -------------------------------
    formatAgainstMask:function ($el, inVal) {
        var stringIndex = 0,
            maskIndex = 0,
            mask = this.mask,
            outVal = "",
            m = null,
            c = null,
            caretPos;

        //get the current position of the caret

        caretPos = this.getCaretPos($el);

        //get all the non-number chars in the mask, so they're not replaced (i.e. entered by the user)

//        var reg = new RegExp('[^0-9]' + this.mask.replace(/#/gi, ""), 'gi');
//        inVal = inVal.replace(reg, "");

        // Mask the passed in text
        while (stringIndex < inVal.length && maskIndex < mask.length) {
            m = mask.charAt(maskIndex);
            c = inVal.charAt(stringIndex);

            // if we match a masked character in the sequence
            if (this.maskChar === m && (!isNaN(parseInt(c)))  || m === c) {
                //this char is ok, add it to the outval
                outVal += c;
                //increment both counters
                stringIndex++;
                maskIndex++;
            }
            // Otherwise output the mask character
            else {
                //not an exactly valid char, if it's a number, keep it and output mask until it's in the right spot

                //check if it's a num, and if we haven't run past the length of the mask
                if (!isNaN(parseInt(c)) && outVal.length <= mask.length) {
                    //it's a number, so let's keep it.
                    for(var pos = maskIndex; pos <= mask.length; pos++){
                        if (mask.charAt(pos) === this.maskChar){
                            outVal += c;
                            maskIndex++;
                            //only add one digit (the number they entered) in this case
                            break;
                        }
                        else {
                            //keep adding mask chars until we hit a '#' which needs user input
                            outVal += mask.charAt(pos);
                            //and in this case we want to move the caret forward..ONLY if it's before the caretPos
                            if (caretPos > stringIndex){
                                caretPos++;
                            }
                            maskIndex++
                        }
                    }
                }
                //we've read this char, so move ahead regardless
                stringIndex++;
            }
        }

        $el.val(outVal);
        //Set the caret back to it's position after we lost it by using .val()
        //but only if caretPos has a value
        if (caretPos){
            this.setCaretPos($el, caretPos);
        }
    },

    // -------------------------------
    // Function: formatAgainstDateMask
    // format the element value using the elements date mask
    // (this method is a slight variation on the normal formatAgainstMask)
    //
    // Parameters:
    //   $el - the element's value will be formatted
    //   inVal - the mask format
    // -------------------------------
    formatAgainstDateMask:function ($el, inVal, keycode) {
        var stringIndex = 0,
            maskIndex = 0,
            mask = this.mask,
            outVal = "",
            m = null,
            c = null,
            caretPos;

        //get the current position of the caret
        caretPos = this.getCaretPos($el);

        //let the delimeter be anything other than M, D, or Y
        var delimeterRegex = new RegExp(/[^M|^D|^Y]/);
        var delimeterChar = mask.match(delimeterRegex);
        if (delimeterChar) { // does the mask have a delimiter at all?
            delimeterChar = delimeterChar[0]; //will be null otherwise.
        }
        var isDelimiter = function(ch){
            return ch === delimeterChar;
        };

        // Mask the passed in text
        while (stringIndex < inVal.length && maskIndex < mask.length) {
            m = mask.charAt(maskIndex);
            c = inVal.charAt(stringIndex);


            //is this char a number and the mask char a D, M, or Y?
            if ((m === delimeterChar && m ===  c) || (!isNaN(parseInt(c)) && !isDelimiter(m))){
                //this char is ok, add it to the outval
                outVal += c;
                //increment both counters
                stringIndex++;
                maskIndex++;
            }
            //they didn't enter all the digits for the the type (M*2,D*2, or Y* 2 or 4)
            else if (isDelimiter(c) && !isDelimiter(m)){
                //premature delimiter, insert a delimtiter char before this char(will only be one in date formats)

                //get our mask char and run backwards until we hit a different mask char (i.e. D M Y).
                var i = maskIndex -1;
                var backedUp = 0;
                var precedingChar ="";
                while(mask.charAt(i) === m && i>=0) { //&& inVal.charAt(i) !== '0'){
                    precedingChar = inVal.charAt(i) + precedingChar;
                    i--;
                    backedUp++;
                }
                precedingChar = parseInt(precedingChar);
                if (!isNaN(precedingChar)){
                    if (precedingChar<10){ //&& precedingChar !== 0){
                        outVal = outVal.substring(0, stringIndex - backedUp);
                        outVal += ("0" + precedingChar + c);
                        maskIndex += 1;
                        caretPos += 1;
                    }
                }

                maskIndex++;
                stringIndex++;
            }
            // they skipped entering a delimiter. add it for them
            else if (!isNaN(parseInt(c) && isDelimiter(m))){
                //make sure that the mask char on either side of the delimiter is different, so we know to insert a delimiter
                if (mask.charAt(maskIndex-1) !== mask.charAt(maskIndex+1)){
                    outVal += delimeterChar;
                    maskIndex++;
                    caretPos++;
                    outVal += c;
                    maskIndex++;

                    stringIndex++;
                }
            } else { //not a char we care about.
                stringIndex++;
            }
        }

        $el.val(outVal);
        //Set the caret back to it's position after we lost it by using .val()
        //but only if caretPos has a value
        if (caretPos){
            this.setCaretPos($el, caretPos);
        }
    },

    // -------------------------------
    // Function: getCaretPos
    // cross browser method to get the cursor postion from an input element.
    // produces an error if used on a textarea type input.
    // -------------------------------
    getCaretPos : function ($el){
        var caretPos = 0;

        if ($el[0].tagName.toLowerCase() === 'textarea'){
            Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.BaseStrategy.formatAgainstMask", "formatter set on a TextArea element, can only be used on text inputs.", LOG_ERROR));
            return undefined;
        }

        //IE [Silly Party]
        if (jQuery.browser.msie){
            var Sel = document.selection.createRange();
            Sel.moveStart('character', -$el[0].value.length);
            caretPos = Sel.text.length;
        }
        else {
            //Chrome,Safari,FF [Sensible Party]
            caretPos = $el[0].selectionStart;
        }

        return caretPos;
    },

    // -------------------------------
    // Function: setCaretPos
    // cross browser method to set the cursor postion from an input element.
    // -------------------------------
    setCaretPos : function ($el, caretPos){
        if (jQuery.browser.msie){
            //good ole ie.
            var range = $el[0].createTextRange();
            range.collapse(true);
            range.moveEnd('character', caretPos);
            range.moveStart('character', caretPos);
            range.select();
        } else {
            $el[0].setSelectionRange(caretPos,caretPos);
        }
    },

    // -------------------------------
    // Function: containedInTaints
    // if the input string is partially contained in the taints array
    //
    // Parameters:
    //   s - the input string
    //   array - the taints array
    // -------------------------------
    containedInTaints : function (s, array) {
        var valid = false;
        if (this.validTaints) {
            if(s){
            	s = s.toLowerCase();
            	s = s.replace(/ /g,"");
            }
            for (var i=0; i<this.validTaints.length; i++) {
                var taint = this.validTaints[i].toLowerCase()
                taint = taint.replace(/ /g,"");
                if (taint.indexOf(s) == 0) {
                    valid = true;
                    break;
                }

            }
        }
        return valid;

    }

});

/*
 * class: DefaultStrategies
 * Default validation strategies provided by Mojo
 * 
 * about:
 * Clients can add new strategies or override existing ones by 
 * creating an object that has a 'validate' method and addingig it to the mix 
 * via the Mojo.addValidationStrategy(<name>, <strategyObject>) call;
 * 
 */
Mojo.inputStrategies.defaultStrategies = {
    // -------------------------------
    // Function: required
    // field is required
    //
    // Parameters:
    //   $el - the dom input element
    // -------------------------------
    required : {
        validate : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            switch ($el.prop("type")) {
                case "text":
                case "password":
                case "textarea":
                case "textarea":
                case "file":
                default:
                    if (!value) return customMessage || this.defaultMessage || "This field is required";
                    break;
                case "checkbox" :
                    if (!$el.prop("checked")) return customMessage || this.defaultMessage || "This checkbox is required";
                    break;
                case "radio":
                    var form = jQuery('body');//$el.closest("form");
                    var name = $el.attr("name");
                    if (form.find("input:radio[name='" + name + "']:checked").size() == 0) {
                        return customMessage || this.defaultMessage || "Please select an option";
                    }
                    break;
                // required for <select>
                case "select-one":
                    // added by paul@kinetek.net for select boxes, Thank you
                    if (!value) return customMessage || this.defaultMessage || "This field is required";
                    break;
                case "select-multiple":
                    // added by paul@kinetek.net for select boxes, Thank you
                    if (!$el.find("option:selected").val())
                        return customMessage || this.defaultMessage || "This field is required";
                    break;

            }

        }
    },

    // -------------------------------
    // Function: groupRequired
    // Validate input text fields are mutually exclusive
    // Display error if value exists in more than one of the grouped input fields
    // Display error if all grouped input fields are empty
    //
    // Parameters:
    //   value - the dom element value
    //   groupId - the id attribute of the grouped input elements
    // -------------------------------
    groupRequired : {
        validate : function ($el, groupId) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            var $groupElems = jQuery("input[data-validate*='groupRequired(" + groupId + ")']");
            // check if groupRequired input fields are not empty
            if ($groupElems.filter(
                function () {
                    return this.value.length !== 0;
                }).length > 1) {
                return customMessage || this.defaultMessage || "Only one field can be entered";
            }
            // check if groupRequired input fields are empty
            else if (($groupElems.size() - $groupElems.filter('input:text[value=""]').length) != 1) {
                return customMessage || this.defaultMessage || "One of these fields is required";
            }
        }
    },

    // -------------------------------
    // groupRequiredOneOrMore:
    // Validate input text fields are mutually exclusive
    // DON"T Display error if value exists in more than one of the grouped input fields (unlike the standard groupRequired)
    // Display error if all grouped input fields are empty
    // -------------------------------
    groupRequiredMultiple : {
        validate : function ($el, groupId) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            var $groupElems = jQuery("input[data-validate*='groupRequiredMultiple(" + groupId + ")']");
            // check if number of elements is greater than number of empty elements
            if ($groupElems.size() == $groupElems.filter('input:text[value=""]').length) {
                return customMessage || this.defaultMessage || "One of these fields needs to have a value";
            }
        }
    },

    // -------------------------------
    // Function: maxLength
    // Maximum characters allowed
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Maximum characters allowed
    // -------------------------------
    maxLength : {
        validate : function ($el, length) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            length = parseInt(length,10);
            if (isNaN(length)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.maxLength", "maxLength validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            this._max = length;
            if (value.length > length)
                return customMessage || this.defaultMessage || ("Maximum " + length + " characters allowed");
        },
        format : function($el, event, length){
            length = parseInt(length,10);
            if (isNaN(length)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.maxLength", "maxLength validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (!isNaN(length) && _.isNumber(length)){
                if ($el.is("input")){
                    if ( $el.is("input") && $el.val().length >= length ){
                        $el.val( $el.val().slice( 0,length) );
                    }
                }
            }
        }
    },

    // -------------------------------
    // Function: minLength
    // Minimum characters required
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Minimum characters allowed
    // -------------------------------
    minLength : {
        validate : function ($el, length) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            length = parseInt(length, 10);
            if (isNaN(length)){
                //invalid arguement. throw exception
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.minLength", "minLength validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (_.isNumber(length) && !isNaN(length) && value.length < length)
                return customMessage || this.defaultMessage ||  ("Minimum " + length + " characters required");
        }
    },

    // -------------------------------
    // Function: exactlength
    // Value must be X number of characters
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Exact number of characters allowed
    // -------------------------------
    exactLength : {
        validate : function ($el, length) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            length = parseInt(length,10);
            if (isNaN(length)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.exactLength", "exactLength validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (_.isNumber(length) &&  !isNaN(length) && value.length != length)
                return customMessage || this.defaultMessage || ("Value must be " + length + " characters");

        },
        format : function($el, event, length){
            length = parseInt(length, 10);
            if (isNaN(length)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.exactLength", "exactLength validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if ($el.is("input") && _.isNumber(length) && !isNaN(length)){
                if ( $el.val().length >= length ){
                    $el.val( $el.val().slice( 0,length) );
                }
            }
        }
    },

    // -------------------------------
    // Function: max
    // Maximum value is
    //
    // Parameters:
    //   value - the dom element value
    //   max - the Maximum value allowed
    // -------------------------------
    max : {
        validate : function ($el, max) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val().replace(/\,/g, "");
            max = parseFloat(max);
            value = parseFloat(value);
            if (isNaN(max) || (!_.isNumber(max))){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.max", "max validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (isNaN(value) || !_.isNumber(value) || (parseFloat(value) > parseFloat(max)))
                return customMessage || this.defaultMessage || ("Maximum value is " + max);
        }
    },

    // -------------------------------
    // Function: min
    // Minimum value is
    //
    // Parameters:
    //   value - the dom element value
    //   min - the Minimum value allowed
    // -------------------------------
    min : {
        validate : function ($el, min) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val().replace(/\,/g, "");
            min = parseFloat(min);
            value = parseFloat(value);
            if (isNaN(min)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.min", "min validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (isNaN(value) || !_.isNumber(value) || (parseFloat(value) < parseFloat(min)))
                return customMessage || this.defaultMessage || ("Minimum value is " + min);
        }
    },

    // -------------------------------
    // Function: multipleOf(x)
    // value is a multiple of x
    //
    // Parameters:
    //   value - the dom element value
    //   multiple - Integer which value must be a multiple of
    // -------------------------------
    multipleOf:{
        validate : function ($el, multiple) {
            var customMessage = $el.data(this.name + '_msg');
            var value = parseFloat( $el.val().replace(/\,/g,"") );
            multiple = parseFloat(multiple);
            if (!_.isNumber(multiple) || isNaN(multiple)){
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.defaultStrategies.min", "min validation set with non numeric arguement of: " + length, LOG_ERROR));
            }
            if (isNaN(value) || !_.isNumber(value)   || (parseFloat(value) % parseFloat(multiple) !== 0)){
                return customMessage || this.defaultMessage || ("Must be a multiple of " + multiple);
            }
        }
    },

    // -------------------------------
    // Function: same
    // Field must be same as fieldName
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to match the value to
    //   fieldName - the name of the field to match the value to
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    same : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            var otherEl = jQuery("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
            if (caseInsensitive && (value.toLowerCase() !== equalVal.toLowerCase())) {
                return customMessage || this.defaultMessage || ("Field must be same as " + fieldName);
            } else if (!caseInsensitive && (value !== equalVal)) {
                return customMessage || this.defaultMessage || ("Field must be same as " + fieldName + " (Case Sensitive)");
            }
        }
    },
    // -------------------------------
    // Function: sameTrimmed
    // Field must be same as fieldName after leading
    // and trailing white space is removed.
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to match the value to
    //   fieldName - the name of the field to match the value to
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    sameTrimmed : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var customMessage = $el.data(this.name + '_msg');
            var value = jQuery.trim($el.val());
            var otherEl = jQuery("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();

            //trim whitespace
            equalVal = jQuery.trim(equalVal);
            if (caseInsensitive && (value.toLowerCase() !== equalVal.toLowerCase())) {
                return customMessage || this.defaultMessage || ("Field must be same as " + fieldName);
            } else if (!caseInsensitive && (value !== equalVal)) {
                return customMessage || this.defaultMessage || ("Field must be same as " + fieldName + " (Case Sensitive)");
            }
        }
    },

    // -------------------------------
    // Function: notSame
    // Field cannot be same as fieldName
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to validate that the value does NOT match
    //   fieldName - the name of the field to validate that the value does NOT match
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    notSame : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var customMessage = $el.data(this.name + '_msg');
            //trim whitespace
            var value = $el.val();
            var otherEl = jQuery("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
//            var equalVal = jQuery("#" + fieldId).val();
            if (caseInsensitive && (value.toLowerCase() === equalVal.toLowerCase())) {
                return customMessage || this.defaultMessage || ("Field cannot be same as " + fieldName);
            } else if (!caseInsensitive && (value === equalVal)) {
                return customMessage || this.defaultMessage || ("Field cannot be same as " + fieldName + " (Case Sensitive)");
            }
        }
    },
    // -------------------------------
    // Function: notSame
    // Field cannot be same as fieldName after leading and trailing white splace
    // is removed.
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to validate that the value does NOT match
    //   fieldName - the name of the field to validate that the value does NOT match
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    notSameTrimmed : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var customMessage = $el.data(this.name + '_msg');
            //trim whitespace
            var value = jQuery.trim($el.val());
            var otherEl = jQuery("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
//            var equalVal = jQuery("#" + fieldId).val();
            //trim whitespace
            equalVal = jQuery.trim(equalVal);
            if (caseInsensitive && (value.toLowerCase() === equalVal.toLowerCase())) {
                return customMessage || this.defaultMessage || ("Field cannot be same as " + fieldName);
            } else if (!caseInsensitive && (value === equalVal)) {
                return customMessage || this.defaultMessage || ("Field cannot be same as " + fieldName + " (Case Sensitive)");
            }
        }
    },

    // -------------------------------
    // Function: equalsVal
    // Value must be equal/
    //
    // Parameters:
    //   value - the dom element value
    //   equalVal - the value to validate against
    // -------------------------------
    equalsVal : {
        validate : function ($el, equalVal) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            if (value !== equalVal)
                return customMessage || this.defaultMessage || ("Value must be " + equalVal);
        }
    },

    // -------------------------------
    // Function: notEqualsVal
    // Value cannot be equal
    //
    // Parameters:
    //   value - the dom element value
    //   notEqualVal - the value to validate against
    // -------------------------------
    notEqualsVal : {
        validate : function ($el, notEqualVal) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            if (value === notEqualVal)
                return customMessage || this.defaultMessage || ("Value cannot be " + notEqualVal);
        }
    },

    // -------------------------------
    // Function: email
    // valid email format is enforced
    // -------------------------------
    email : {
        // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
        regex : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Invalid email address";
        }
    },

    // -------------------------------
    // Function: ssn
    // valid ssn format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   taintable - the boolean value to allow alternative formats
    // -------------------------------
    ssn : {
        validTaints : ["applied for", "died", "tax exempt", "LAFCP", "unknown"],
        regex : /^\d\d\d\-\d\d\-\d\d\d\d$/,
        defaultMask : "###-##-####",
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Invalid SSN, must be " + this.mask;
        },
        // -------------------------------
        // Function: validate
        // validate a ssn
        //
        // Parameters:
        //   value - the string to validate
        //   p1 - ssn mask or taintable flag
        //   p2 - ssn mask or taintable flag
        // -------------------------------
        validate : function ($el, p1, p2) {  // parameters [mask,taintable] can be passed in either order
            var value = $el.val();

            // figure out which order the parameters were passed in
            if (p2 === "true" || p2 === "false") {
                this.taintable = (p2 === "true");
                this.mask = p1 || this.defaultMask;
            }
            else if (p1 === "true" || p1 === "false") {
                this.taintable = (p1 === "true");
                this.mask = p2 || this.defaultMask;
            }
            else {
                this.mask = p1 || this.defaultMask;
                this.taintable = false;
            }

            if (this.taintable) {
                if (this.containedInTaints(value))
                    return;
            }

            var pattern = this.mask.replace(/#/g, "\\d");

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },
        format : function ($el, event, p1, p2) {
            var inVal = $el.val();

            if (inVal == "") return;

            // figure out which order the parameters were passed in
            if (p2 === "true" || p2 === "false") {
                this.taintable = (p2 === "true");
                this.mask = p1 || this.defaultMask;
            }
            else if (p1 === "true" || p1 === "false") {
                this.taintable = (p1 === "true");
                this.mask = p2 || this.defaultMask;
            }
            else {
                this.mask = p1 || this.defaultMask;
                this.taintable = false;
            }

            if (this.taintable) {
                // if the user input is partially contained in the taints array, exit right away
                if (this.containedInTaints(inVal))
                    return;
            }

            this.formatAgainstMask($el, inVal, event.which /*inVal.replace(/[^0-9]/gi, "") */);
        }
    },
    // -------------------------------
    // Function: regex
    // validate based on a regular expression
    //
    // Parameters:
    //   value - the dom element value
    //   re - the regular expression to validate against
    //   message - the error message to display if validation doesn't pass
    regex :  {
        validate : function($el,expression,message) {
            this.errorMsg = message || this.defaultMessage || "Invalid entry";
            this.regex = new RegExp(expression);
            return this._super($el);
        },
        getError : function($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.errorMsg;
        }
    },
    // -------------------------------
    // Function: date
    // valid date format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   mask - the format to validate against
    //   taintable - the boolean value to allow alternative formats
    // -------------------------------
    date : {
        validTaints : ["various", "inherit", "inherited", "continue", "continues", "none"],
        defaultMask : "MM/DD/YYYY",
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || ("Invalid '" + this.mask + "' date");
        },
        // -------------------------------
        // Function: validate
        // validate a date
        //
        // Parameters:
        //   value - the string to validate
        //   p1 - date mask or taintable flag
        //   p2 - date mask or taintable flag
        // -------------------------------
        validate : function ($el, p1, p2) {  // parameters [mask,taintable] can be passed in either order
            var value = $el.val();
            // figure out which order the parameters were passed in
            if (p2 === "true" || p2 === "false") {
                this.taintable = (p2 === "true");
                this.mask = p1 || this.defaultMask;
            }
            else if (p1 === "true" || p1 === "false") {
                this.taintable = (p1 === "true");
                this.mask = p2 || this.defaultMask;
            }
            else {
                this.mask = p1 || this.defaultMask;
                this.taintable = false;
            }

            switch (this.mask) {
                case "MM/YYYY" :
                    this.regex = /^(?:0?[1-9]|1[0-2])\/(?:19\d\d|20\d\d)$/;
                    break;
                case "YYYY" :
                    this.regex = /^(?:19\d\d|20\d\d)$/;
                    break;
                case "YYYY-MM-DD" :
                    this.regex = /^(?:19\d\d|20\d\d)\-(0?[1-9]|1[0-2])\-(0?[1-9]|[12][0-9]|3[01])$/;
                    break;
                case "MM/DD" :
                    this.regex = /^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|[12][0-9]|3[01]))$/;
                    break;
                case "" :
                case "MM/DD/YYYY" :
                default :
                    this.regex = /^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|[12][0-9]|3[01]))(\/|-)(?:19\d\d|20\d\d)$/;
                    break;  // use the default mask/regex
            }

            return this._super($el);
        },
        format : function ($el, event, mask, taintable) {
            var inVal = $el.val(),
                outVal = "",
                day = true,
                month = true,
                year = true;

            if (inVal == "") return;

            // set up mask
            this.mask = mask ? mask : this.defaultMask;
            //this.mask = this.mask.replace(/[A-Za-z]/gi, "#");

            if (taintable) {
                if (this.containedInTaints(inVal))
                    return;
            }

            outVal = inVal;


            if (mask.indexOf("YYYY") > -1) { // 4 digit year, try to upgrade  anything not 19 or 20
                if (outVal.charAt(6) && outVal.charAt(7) && outVal.charAt(5) === '/' && !outVal.charAt(8)){
                    var firstYrDigits = outVal.substr(6,2);
                    if (firstYrDigits !== "19" &&  firstYrDigits !== "20"){
                        if (jQuery.isNumeric(parseInt(firstYrDigits, 10))){
                            var secondTwoDigits = parseInt(firstYrDigits,10) > 13 ? '19' : '20';
                            outVal = outVal.slice(0,5) + secondTwoDigits + firstYrDigits;
                            $el.val(outVal);
                            this.setCaretPos($el, this.getCaretPos($el) + 2);
                            // unlike at other times, when we don't want to format on '0' key press,
                            // in this instance we do. We want to format on any keypress
                            // because it's part of a two digit year that should be expanded to four digits.
                            // so, after this expansion, call formatAgainstDateMask regardless of the users keypress.
                            this.formatAgainstDateMask($el, outVal, event.which);
                        }
                    }
                }
            }

            // Reformat the string
            // If the formatString and value are valid, format the number.
            if (event.which == 8 || event.which == 46 || event.which == 48){
                //don't formatAgainstDateMask on delete key for dates
                return;
            }


            this.formatAgainstDateMask($el, outVal, event.which);
        }
    },

    // -------------------------------
    // Function: before
    // Date entered must be before date
    //
    // Parameters:
    //   value - the dom element value
    //   date - the date to validate against
    //   inclusive - the boolean value to include the date as a valid date
    // -------------------------------
    before : {
        validate : function ($el, date, inclusive) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            try {
                var inputDate = value.toDate();
                var targetDate;
                switch (date) {
                    case "today" :
                    case "now" :
                        targetDate = new Date();
                        break;
                    default :
                        targetDate = date.toDate();
                        break;
                }
                var valid = true;
                if (inclusive) {
                    valid = (inputDate.yyyymmdd() <= targetDate.yyyymmdd());
                }
                else {
                    valid = (inputDate.yyyymmdd() < targetDate.yyyymmdd());
                }
                return valid ? null : (customMessage || this.defaultMessage || "Date entered must be before " + date);

            }
            catch (err) {
                return;
            }

        }
    },

    // -------------------------------
    // Function: after
    // Date entered must be after date
    //
    // Parameters:
    //   value - the dom element value
    //   date - the date to validate against
    //   inclusive - the boolean value to include the date as a valid date
    // -------------------------------
    after : {
        validate : function ($el, date, inclusive) {
            var value = $el.val();
            var customMessage = $el.data(this.name + '_msg');

            try {
                var inputDate = value.toDate();
                var targetDate;
                switch (date) {
                    case "today" :
                    case "now" :
                        targetDate = new Date();
                        break;
                    default :
                        targetDate = date.toDate();
                        break;
                }
                var valid = true;
                if (inclusive) {
                    valid = (inputDate.yyyymmdd() >= targetDate.yyyymmdd());
                }
                else {
                    valid = (inputDate.yyyymmdd() > targetDate.yyyymmdd());
                }
                return valid ? null : (customMessage || this.defaultMessage || "Date entered must be after " + date);

            }
            catch (err) {
                return;
            }

        }
    },

    // -------------------------------
    // Function: phone
    // valid phone format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   mask - the format to validate against
    // -------------------------------
    phone : {
        regex : /^\(\d\d\d\) \d\d\d[\-]\d\d\d\d$/,
        defaultMask : "(###) ###-####",
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Invalid phone number, must be " + this.mask;
        },
        validate : function ($el, mask) {
            var value = $el.val();
            this.mask = mask || this.defaultMask;

            var pattern = this.mask.replace(/#/g, "\\d").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\./g, "\\.");

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },

        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal == "") return;

            this.mask = this.defaultMask;

            //get all the non-number chars in the mask, so they're not replaced (i.e. entered by the user)
//            var reg = new RegExp(this.mask.replace(/^#/gi, ""), 'gi');

            this.formatAgainstMask($el, inVal);
        }
    },

    // -------------------------------
    // Function: number
    // Number, including positive, negative, and floating decimal.
    // see numberOnly validator for validating integers
    // -------------------------------
    number : {
        regex : /^[\-\+]?(\d+(\,\d{3})*\.?\d{0,9}|\.\d{1,9})$/,
        defaultPrecision : "2",
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Invalid number";
        },
        validate : function ($el, precision) {
            var value = $el.val();

            this.precision = precision || this.defaultPrecision;

            var pattern = "[\\-\\+]?(\\d+(\,\\d{3})*\\.?\\d{0,PRE}|\\.\\d{1,PRE})";
            pattern = pattern.replace(/PRE/g, this.precision);

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },
        format : function ($el, event) {
            var inVal = $el.val();
            if (inVal == "") return;

            var parts = inVal.replace(/,/g, "").split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return $el.val(parts.join("."));
        }

    },

    // -------------------------------
    // Function: numberOnly
    // Numbers 0-9 only
    // -------------------------------
    numberOnly : {
        regex : /^[0-9]+$/,
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Value is not a number";
        },
        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal == "") return;
            if (inVal.replace(/[0-9]/gi, "").length == 0) {
                return inVal;
            }
            return $el.val(inVal.replace(/[^0-9]/g, ''));
        }
    },

    // -------------------------------
    // Function: alpha
    // Letters a-z only
    // -------------------------------
    alpha : {
        regex : /^[a-z]*$/gi,
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Value must be all letters"
        },
        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal == "") return;
            if (inVal.replace(/[A-Za-z]/gi, "").length == 0) {
                return inVal;
            }
            return $el.val(inVal.replace(/\d/g, '').replace(/\W/g, ''));
        }
    },

    alphaNumeric : {
        regex : /^([a-zA-Z0-9]+)$/,
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Should be alphanumeric";
        },
        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal == "") return;
            if (inVal.replace(/[a-zA-Z0-9]/gi, "").length == 0) {
                return inVal;
            }
            return $el.val(inVal.replace(/[^0-9a-zA-Z]/g, ''));
        }
    },

    maskedNumber : {
        regex : /^\d\d\d\d\d\-\d\d\d\d$/,
        defaultMask : "#####-####",
        getError : function ($el) {
            var customMessage = $el.data(this.name + '_msg');
            return customMessage || this.defaultMessage || "Invalid input, format must be " + this.mask;
        },
        validate : function ($el, mask) {
            var value = $el.val();

            this.mask = mask || this.defaultMask;

            var pattern = this.mask.replace(/&#41;/g, "\\)").replace(/\(/g, "\\(").replace(/#/g, "\\d");

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },
        format : function ($el, event, mask) {
            var inVal = $el.val();

            if (inVal == "") return;

            // set up mask
            this.mask = mask ? mask : this.defaultMask;
            //this.mask = this.mask.replace(/[A-Za-z]/gi, "#").replace(/&#41;/g, ")");

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]/gi, ""*/);
        }
    },

    zip : {
        regex : /^\d{5}(\-\d{4})?$/,
        defaultMask : "#####-####",
        validate : function ($el, mustBePlusFour) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val();
            this.mask = this.defaultMask; //always use default mask

            if (mustBePlusFour  && value.length != 10){
                return customMessage || this.defaultMessage || "Invalid zip code, must be #####-####";
            }
            if (!(value.length === 5
                || value.length === 10)) //hard coded lengths for zip if mask arg is ommited and default mask is used( can be 5 or 10)
                return customMessage || this.defaultMessage || "Invalid zip code, must be #####  or  #####-####";
        },

        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal == "") return;

            // set up mask
            this.mask = this.defaultMask; //always use default mask
            //this.mask = this.mask.replace(/[A-Za-z]/gi, "#");

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]|-/gi, "")*/);
        }
    },

    creditCard : {
        defaultMask : "################",
        validate : function ($el, mask) {
            var customMessage = $el.data(this.name + '_msg');
            var value = $el.val().replace("-", "").replace(/\s/g, "");
            var ccFirstTwo = value.slice(0, 2);
            var errString = customMessage || this.defaultMessage || "Invalid Credit Card Number";
            if (ccFirstTwo === "34" || ccFirstTwo === "37") { //Amex Cards are only 15 digits
                if (value.length !== 15) {
                    //return error if if it's not 15 digits
                    return errString;
                } else {
                    // if it is an amex of valid length
                    //need to prepend a "0" so that the luhn check will pass. Adding
                    //a zero to the beginning of a valid number wont affect the validation
                    value = "0" + value;
                }
            } else {
                if (value.length !== 16) {  //It's not an Amex, Should be 16 digits
                    return errString;
                }
            }

            //passed the length requirement, now check the luhn validation.

            //###### Luhn Number validation ######
            var digit = 0 , checksum = 0;
            for (var len = (value.length - 1); len >= 0; len--) {
                digit = parseInt(value.charAt(len), 10);
                if (len % 2) {
                    checksum += digit;
                } else {
                    digit = digit * 2;
                    if (digit >= 10) {
                        checksum += Math.floor(digit / 10);
                        checksum += digit % 10;
                    } else {
                        checksum += digit;
                    }
                }
            }
            if (checksum % 10 === 0) {
                // return undefined (aka valid) is implied
            } else {
                return errString;
            }

        },
        format : function ($el, event, func) {
            //todo: accept user specified mask?
            //in addition to the normal formatting options,
            //it takes an optional callback (func) that will be called with the card
            //type (ie. Visa MC Amex) once it's been determined.
            //potential card types are (Visa, MasterCard, American Express, Discover)

            var inVal = $el.val();

            var ccFirstTwo = inVal.slice(0, 2);
            //Check if it's Amex, if so, we need a 15 char mask, not 16
            if (ccFirstTwo === "34" || ccFirstTwo === "37") {
                this.mask = "###############";
            } else {
                this.mask = this.defaultMask;
            }

            //run the call back if we've been given one.
            if (window[Mojo.constants.scopes.kViewScope] && func && typeof window[Mojo.constants.scopes.kViewScope][func] === "function") {
                var cardType = null;
                if (inVal.length) {
                    if (inVal.match(/^5[15]/)) {
                        cardType = 'MasterCard';
                    } else if (inVal.match(/^4/)) {
                        cardType = 'Visa';
                    } else if (inVal.match(/^3[47]/)) {
                        cardType = 'American Express';
                    } else if (inVal.match(/^6011/)) {
                        cardType = 'Discover';
                    }
                }
                window[Mojo.constants.scopes.kViewScope][func](cardType);
            }

            if (inVal === "") return; //skip masking if empty.

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]/gi, "")*/ /* <-- replace non-numerics */);
        }
    }
};
/*
 * class: InputStrategies
 * Maintains a list of validation strategies
 */
Mojo.inputStrategies.strategies = (function () {

    var _impl = {

        VALIDATE:"validate",
        FORMAT:"format",

        // -------------------------------
        // Function: addStrategy
        // add a new strategy
        //
        // Parameters:
        //   name - the name of strategy
        //   strategyObject - the strategy object
        // -------------------------------
        addStrategy:function (name, strategyObject) {
            if(_strategyMap[name]) {
                // if the strategy already exists, add/replace with the new properties
                jQuery.extend(_strategyMap[name], strategyObject);
            }
            else {
                // otherwise, extend the base strategy
                var strategy = _createStrategy(strategyObject);
                strategy.name = name;
                _strategyMap[name] = strategy;
            }
        },

        // -------------------------------
        // Function: addStrategies
        // add multiple new strategies
        //
        // Parameters:
        //   strategies - the array of strategy objects
        // -------------------------------
        addStrategies:function (strategies) {
            // Loop through the strategies 
            for (var o in strategies) {
                this.addStrategy(o, strategies[o]);
            }
        },

        // -------------------------------
        // Function: executeStrategy
        // evaluate the validation or formatting strategy
        //
        // Parameters:
        //   action - the validation or format action to execute
        //   $el - the input element
        //   name - the strategy name
        //   params - the parameters
        // -------------------------------
        executeStrategy:function (/* either validate or format */action, $el, event, /* strategy name */name, params) {
            var value = $el.val(),
                result = null,
                strategy = _strategyMap[name];

            if (!strategy) {
                // Check to see if the specified strategy exists
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.inputStrategies.strategies", "Missing strategy: '" + name + "'", LOG_WARNING));
                return;
            }

            if (!strategy[action]) {
                // Check to see if the specified action (either validate or format) exists for this strategy
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.inputStrategies.strategies", "Missing action:" + action + " for strategy:" + name, LOG_WARNING));
                return;
            }

            var args = _splitParams(params);
            // Remove any double quoting that may have occurred
            jQuery.each(args, function (idx, val) {
                args[idx] = val.removeQuotes();
            });

            try {
                // if there is no value and the name of the strategy is not
                // in the array of validator name that that should validate
                // when empty (i.e. required is one of them) then just return and don't validate. Otherwise
                // if the strategy is in the list, validate as if it were not empty
                if (!$el.val() && (jQuery.inArray(name, Mojo.constants.validateWhenEmpty) < 0)) return "";

                // add the $element as the first parameter
                args.splice(0, 0, $el);
                //add the event if it's a formatter
                if (action === Mojo.inputStrategies.strategies.FORMAT){
                    args.splice(1, 0, event);
                }
                result = strategy[action].apply(strategy, args);
            }
            catch (ex) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.inputStrategies.strategies", "Invalid " + action + " definition " + name + ": " + params, LOG_WARNING));
            }

            return result;
        }
    };

    var _strategyMap = {};

    // -------------------------------
    // Function: _splitParams
    // split a string at commas into an array of parameters
    // but don't split at commas within quotes
    //
    // Parameters:
    //   str - the string to split
    // -------------------------------
    function _splitParams(str) {
        if(!str) {
            return new Array();
        }
        // replace commas within quotes so we can split on separator commas
        str = str.replace(/\'.+?\'/g, function(str) {
            return str.replace(/,/,"_comma_");
        });
        var items = str.split(',');
        // restore commas within the quotes
        jQuery.each(items, function (idx, value)  {
            items[idx] = value.replace(/_comma_/g,",");
        });
        return items;
    }

    // -------------------------------
    // Function: _createStrategy
    // create strategy from input object
    //
    // Parameters:
    //   strategyObj - the strategy object
    // -------------------------------
    function _createStrategy(strategyObj) {
        if (typeof strategyObj != 'object') {
            throw new MojoException("Mojo.inputStrategies.strategies", "Invalid strategy definition - must be an object: '" + strategyObj + "'", LOG_ERROR);
        }

        var s = Mojo.inputStrategies.baseStrategy.extend(strategyObj);
        var strategy = new s();
        s = null;
        return strategy;
    }

    function callValidator() {
        var args = Array.prototype.slice.call(arguments);
    }

    return _impl;

})();
// class: ValidationEngine
Mojo.inputStrategies.validator.engine = (function () {
    var _containerID = null;
    var _showErrors = false;
    var _showMultipleErrors = false;
    var _hideOnFocus = false;
    var _showOnlyOne = false;
    var _tooltipPosition = 'top';

    /* Public APIs */
    var _instance = {

        attach:function (options) {
            if (!_initialized) {
                _init();
            }
            _containerID        = options.containerID;
            _showErrors         = options.showErrors;
            _showMultipleErrors = options.showMultipleErrorsPerInput;
            _hideOnFocus        = options.hideOnFocus;
            _showOnlyOne        = options.showOnlyOne;
            _tooltipPosition    = options.tooltipPosition;
            // attach the validateField method to the onblur event of all fields that have a "validator" attribute
            jQuery("#" + _containerID).find("[data-validate]").not(":hidden").not(":disabled").bind("blur", function () {
                _instance.validateField(jQuery(this));
            });
        },

        /****************************************************************************
         * Function: addValidationStrategy
         * Add/overwrite a validation strategy
         *
         * Parameters:
         *   name - the name of strategy
         *   strategyObj - the strategy object
         ****************************************************************************/
        addValidationStrategy:function (name, strategyObj) {
            if (!_initialized) _init();
            Mojo.inputStrategies.strategies.addStrategy(name, strategyObj);
        },
        /****************************************************************************
         * Function: addValidationStrategies
         * Add/overwrite multiple validation strategies
         *
         * Parameters:
         *   strategyList - the array strategy objects
         ****************************************************************************/
        addValidationStrategies:function (strategyList) {
            if (!_initialized) _init();
            Mojo.inputStrategies.strategies.addStrategies(strategyList);
        },

        /****************************************************************************
         * Function: validateAll
         * Validate every field(that has a validate attribute in the parent container)
         ****************************************************************************/
        validateAll:function () {
            if (!_initialized) _init();
            // remove all of the error tooltips first
            this.hideErrorTooltips();

            var isValid = true;

            jQuery("#" + _containerID).find("[data-validate]").not(":hidden").not(":disabled").each(function () {
                // only update set isValid flag to false if validateField returns false, otherwise
                // don't update isValid's value
                isValid = _instance.validateField(jQuery(this)) ? isValid : false;
            });

            return isValid;
        },

        /****************************************************************************
         * Function: validateField
         * Validate an individual input field
         *
         * Parameters:
         *   $el - the input element
         ****************************************************************************/
        validateField:function ($el) {
            if (!_initialized) _init();

            // We added the 'validate' method to jQuery elements in the validationBinder
            var error = $el.validate(_showMultipleErrors);

            if (error) {
                // hack for radio buttons, only show the error on the first one....
                if ($el.prop("type") == "radio") {
                    var name = $el.prop("name");
                    var first = jQuery("#" + _containerID).find("input:radio[name='" + name + "']:first");
                    if ($el[0] != first[0]) return false;
                }
                // there's an error, see if we need to display it
                if (_showErrors) {
                    if(!_showOnlyOne || jQuery('.errorTooltip:visible').length === 0) {
                        _showErrorTooltip($el, error);
                    }
                }

                return false;
            }
            else {
                // if there's an error tooltip, hide it
                _hideErrorTooltip($el);

                return true;
            }
        },

        /****************************************************************************
         * Function: hideErrorTooltips
         * hide all error tooltips
         ****************************************************************************/
        hideErrorTooltips:function () {
            jQuery(".errorTooltip").remove();
            jQuery('input').removeData('errorTooltip');
        }
    };

    /****************************************************************************
     * Group: Private
     * Private APIs
     ****************************************************************************/

    var _initialized = false;

    // -------------------------------
    // Function: _hideErrorTooltip
    // hide the error tooltip(s)
    //
    // Parameters:
    //    $element - the input element
    // -------------------------------
    function _hideErrorTooltip($element) {
        var tooltip = $element.data('errorTooltip');
        if(tooltip) {
            tooltip.fadeOut(100, function() {
                jQuery(this).remove();
            });
        }
    }

    // -------------------------------
    // Function: _showErrorTooltip
    // show the error tooltip(s)
    //
    // Parameters:
    //    $element - the input element
    //    error = the string error message
    // -------------------------------
    function _showErrorTooltip($element, error) {
        var targetLeft = $element.offset().left;
        var targetTop = $element.offset().top;
        var targetRight = targetLeft + $element.width();
        var tooltip;
        var tooltipArrowClass;

        switch(_tooltipPosition) {
            case 'right':  tooltipArrowClass = "errorTooltipArrowLeft"; break;
            case 'bottom':  tooltipArrowClass = "errorTooltipArrowUp"; break;
            default: tooltipArrowClass = "errorTooltipArrowDown"; break;
        }

        if($element.data('errorTooltip') && $element.data('errorTooltip').is(':visible')) {
            tooltip = $element.data('errorTooltip');
            tooltip.html(error + "<div class='" + tooltipArrowClass + "' />");
        }
        else {
            tooltip = jQuery("<div class='errorTooltip' style=''>" + error + "<div class='" + tooltipArrowClass + "'></div></div>");
            tooltip.appendTo("body").hide().fadeIn(120);
            $element.data('errorTooltip', tooltip);
        }

        // always update the tooltip position, cuz sometimes the content of the tooltip gets bigger or smaller
        // so the tooltip container's size adjusts
        switch(_tooltipPosition) {
            case 'right':
                tooltip.css("left", targetRight + 14);
                tooltip.css("top", targetTop + ($element.outerHeight() - tooltip.outerHeight())/2);
                break;
            case 'bottom':
                tooltip.css("left", targetLeft);
                tooltip.css("top", targetTop + $element.outerHeight() + 9);
                break;
            default:
                tooltip.css("left", targetLeft);
                tooltip.css("top", targetTop - tooltip.outerHeight() - 7);
                break;
        }

        // attach event listeners to the error tooltips, when the user clicks on them, the error tooltips should disappear
        tooltip.unbind("click").bind("click", function () {
            _hideErrorTooltip(jQuery($element));
        });
        if(_hideOnFocus) {
            $element.on("focus", function() {
                _hideErrorTooltip(jQuery(this));
            })
        }
    }

    // -------------------------------
    // Function: _init
    // Initialize the engine by
    // loading the default strategies and
    // enabling the jquery validation plugin
    // -------------------------------
    function _init() {
        if (_initialized) return;

        // enable validation jquery plugin
        Mojo.enableValidationPlugin(Mojo.inputStrategies.strategies);

        _initialized = true;
    }


    return _instance;
})();


/**
 * Class:  Mojo.components.abTestResolver
 *
 * @implements {Mojo.interfaces.abTestResolver}
 * *
 * About:
 * This class is used to keep track of the current set of AB tests and configurations.
 * Based on the current set of tests, the getABTestPage and getABTestFlow methods will return views and flows that should be used instead of the defaults.
 * The directory structure and file names for the AB Test versions of the flows and views are the same as the default versions, but they are preceded by this directory structure:
 * <ABTestRoot>/test_name/recipe_name/
 *
 * If mainRoot is specified, and the default flow or view path starts with that path, then it will be omitted from the A/B test version of the path.
 * For example, if
 * mainRoot = "main",
 * testRoot = "abtest",
 * and the default path to a view is "main/html/views/someView.html",
 * then the path to that file while in test1, recipe b, would be: "abtest/test1/b/html/views/someView.html"  (note that 'main' was omitted.)
 *
 * Below is an example of an A/B test configuration.  In this example the <ABTestRoot> shown above is set to "abtest".
 * Each of the tests has 2 recipes called a and b.  The views and flows that are overwritten for those tests are enumerated in the views and flows arrays.
 *
 * In addition, certain variables can be set for each of the tests.  The variables in the vars object for the active recipes are accessible at run time
 * as properties of a model called ABTest.  By using the properties of the ABTest model, the default views can behave slightly differently, without needing custom views for small changes.
 *
 * Care must be taken to ensure that conflicting variable values are not set.
 * In the example below, if the application is in (test1, recipe a) and at the same time in (test2, recipe b), then conflicting values are defined for 'testVar' and 'otherTestVar'.
 * Similarly, there are conflicting views defined for databinding.Pg1 if multiple tests are enabled.  In these cases, the first value found in the configuration file is the one that's used.
 *
 *
 * var abtestConfig = {
    testRoot : "abtest",
    mainRoot : "main",
    tests : {
        test1:{
            a:{
                views:["databinding.Pg1"],
                flows:{},
                vars:{
                    testVar : "testValue1a",
                    otherTestVar : "otherValue1a"
                }
            },
            b:{
                views:["databinding.Pg1"],
                flows:["subflow"],
                vars:{}
            }
        },
        test2:{
            a:{
                views:["databinding.Pg1"],
                flows:{},
                vars:{
                    value1:"First Test Value",
                    value2:"Second Test Value"
                }
            },
            b:{
                views:["databinding.Pg1"],
                flows:{},
                vars:{
                    testVar : "testValue2b",
                    otherTestVar : "otherValue2b"
                }
            }
        }
    }
  };
 *
 */

Mojo.components.abTestResolver = Mojo.interfaces.abTestResolver.extend({


    _abTests : {},
    _abtestConfig : {},
    active : false,

    construct: function(config) {
        // if there are any AB tests in the config, turn on _enabled flag
        //this._enabled = _.size(config) > 0;
        this._abtestConfig = config;
    },

    // -------------------------------
    // Function: setABTests
    // sets the current set of tests and recipe for each
    //
    // Parameters:
    //    values - object containing ABTestName:RecipeName pairs
    // -------------------------------
    setABTests:function (values) {
        var testVars = {};
        Mojo.model.registry.removeModel("ABTest");  // in case a previous test model exists from a different set of tests
        this.active = false;
        this._abTests = {};
        if(!this._abtestConfig || !this._abtestConfig.tests) {
            return;
        }
        _.each(values, function (recipe, abtest) {
            this._abTests[abtest] = recipe;
            if(this._abtestConfig.tests[abtest] && this._abtestConfig.tests[abtest][recipe]) {
                this.active = true;  // active if any test is set for which there is a configuration
                _.each(this._abtestConfig.tests[abtest][recipe]["vars"], function(value, key) {
                    if(testVars[key]) {
                        TRACE("Conflicting ABTest variable: " + key, ["Mojo.components.abTestResolver", "setABTests"], Mojo.utils.trace.ERROR);
                    }
                    else {
                        testVars[key] = value;
                    }
                });
            }
        }, this);
        var abTestModel = new Mojo.model.ABTestModel(testVars);
        Mojo.model.registry.addModel(abTestModel);
    },

    // -------------------------------
    // Function: getABTestPage
    // return the path to the page under the current test conditions
    //
    // Parameters:
    //    pageRef - the page reference
    //    defaultPagePath - the default (non-test) path to the page
    // -------------------------------
    getABTestPage:function (pageRef, defaultPagePath) {
        if (!this.active) return null;

        var rootPath = this._abtestConfig.testRoot || "";
        var pageFound = null;

        // iterate through all of the abtest key/value pairs in the model
        // and look for the corresponding value in the config
        for (var abtest in this._abTests) {
            var recipe = this._abTests[abtest];
            if (this._abtestConfig.tests[abtest] && this._abtestConfig.tests[abtest][recipe] && _.isArray(this._abtestConfig.tests[abtest][recipe]["views"])) {
                var testViews = this._abtestConfig.tests[abtest][recipe]["views"];
                if (testViews.indexOf(pageRef) >= 0) {
                    pageFound = rootPath + "/" + abtest + "/" + recipe + "/" + this._stripDefaultRoot(defaultPagePath);
                    break;
                }
            }
        }
        return pageFound;
    },

    // -------------------------------
    // Function: getABTestFlow
    // return the path to the flow definition file, given the current set of active tests
    //
    // Parameters:
    //    flowRef - the flow reference
    //    defaultFlowPath - the default (non-test) path to the flow
    // -------------------------------
    getABTestFlow:function (flowRef, defaultFlowPath) {
        if (!this.active) return null;

        var rootPath = this._abtestConfig.testRoot || "";
        var flowFound = null;

        // iterate through all of the abtest key/value pairs in the model
        // and look for the corresponding value in the config
        for (var abtest in this._abTests) {
            var recipe = this._abTests[abtest];
            if (this._abtestConfig.tests[abtest] && this._abtestConfig.tests[abtest][recipe] && _.isArray(this._abtestConfig.tests[abtest][recipe]["flows"])) {
                var testFlows = this._abtestConfig.tests[abtest][recipe]["flows"];
                if (testFlows.indexOf(flowRef) >= 0) {
                    flowFound = rootPath + "/" + abtest + "/" + recipe + "/" + this._stripDefaultRoot(defaultFlowPath);
                    break;
                }
            }
        }
        return flowFound;
    },

    //-------------------------------
    // take the default path returned by the flow or view resolver, and remove the root part
    //
    //-------------------------------
    _stripDefaultRoot:function(path) {
        var defaultRoot = this._abtestConfig.mainRoot;
        if(!defaultRoot || defaultRoot.length ===  0) {
            return path;
        }
        /\/$/.test(defaultRoot) || (defaultRoot += "/");  // add trailing slash if it's not already there
        if(path.indexOf(defaultRoot) !== 0) {
            return path;
        }
        else {
            return path.substr(defaultRoot.length);
        }
    }



});/**
 * class: Mojo.components.actionExecutor
 *
 * @implements {Mojo.interfaces.actionExecutor}
 *
 * About:
 * This class will first resolve the action reference to a javascript function
 * If the function does not exist in the system, it will load the javascript file syncronously
 *
 * Usage :
 *      When creating actions, they should be scoped to a class.  I.e. foo.bar.  Where foo is the class name and bar is the function.
 *      In order for Mojo to dynamically load the class, the name of the javascript file NEEDS to be the same as the class name.
 *      So in this example, the file foo.js would contain a javascript class foo that has the function bar in it.
 *
 * Options :
 *      pathToActions : path to the implementation of action (javascript) files.
 *                    Can be a string that represents the default path to ALL javascript files,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToActions:{
 *                                "ActionClass":"scripts/foo/otheractions/",
 *                                "default":"scripts/"
 *                        }
 *
 *                    Then in your action references (in the flow definitions) you reference your action
 *                    using the namespace in using the following convention.
 *                        <actionClass>.<function>
 *
 *                     - There can ONLY be one namespace in an action, meaning only 1 '.' in the reference. Everything up to the '.' is considered a namespace and needs to be resolved in the pathToActions
 *                     - if there is no namespace (no '.') then the function will be considered a global namespace
 *                     - if there is one '.' then the function will be scoped to a class.
 *                          I.e. foo.bar - will be interpreted as there is a class called foo with a function called bar in it
 *                          If that class is not in memory, Mojo will try and load it.  See Note below.
 *
 *
 * Note: the names of the javascript action objects MUST BE the same as the name of the javascript file
 *       ex. The action class named mainAction must reside in a file named mainAction.js if it is to be dynamically loaded.
 */
Mojo.components.actionExecutor = Mojo.interfaces.actionExecutor.extend({

    /*
     * Function: construct
     * construct the pathToActions
     *
     * Parameters: 
     * options - the options object that contains the pathToActions
     *
     */
    construct:function (options) {
        this._pathToActions = null;

        if (!options)
            throw new MojoException("ActionExecutor", "missing options", LOG_ERROR);
        if (typeof options.pathToActions == "undefined")
            throw new MojoException("ActionExecutor", "options missing path variable", LOG_ERROR);

        if (typeof options.pathToActions === "object") {
            this._pathToActions = options.pathToActions;
            if (!options.pathToActions["default"]) throw new MojoException("ActionExecutor", "pathToActions must contain a 'default' entry.", LOG_ERROR)
        }
        else if (typeof options.pathToActions === "string") {
            this._pathToActions = {"default":options.pathToActions};
        }
        else {
            throw new MojoException("ActionExecutor", "pathToActions is invalid.  Must be an object or string.", LOG_ERROR);
        }

    },


    /*
     * Function: execute
     * execute the action with input params
     *
     * Parameters:
     * args - argument object, containing the following properties
     *      action - the global or namespaced action to be evaluated
     *      params - the array of params
     *      callback - optional callback, should be supplied only when calling an asynchronous action
     */
    execute:function (args) {
        var actionName = args.action;
        var resolvedParams = _resolveParams(args.params);
        var callback = args.callback;
        var pathAlias = "default",
            actionClass = "",
            action = null,
            pathToFile = null,
            actFunction = null,
            response = null;

        // Resolve any Model references to values;

        // parse the flowRef into project.<path>.alias
        var actionNameParts = actionName.split('.');

        try {
            // if global action
            if (actionNameParts.length == 1) {
                actFunction = window[actionName];
                var exists = (typeof actFunction === "function");
                if (exists)
                    response = _evaluate(actFunction, resolvedParams, callback); // call the function
                else
                    throw new MojoException("ActionExecutor", "Action: '" + actionName + "' does not exist in global namesapce", LOG_ERROR);
            }

            // namespaced action
            // can be dynamically loaded based on namespace name
            else {
                action = actionNameParts[(actionNameParts.length - 1)];
                pathAlias = actionNameParts.slice(0,-1).join(".");
                actionClass = actionNameParts[0];
                pathToFile = this._pathToActions[pathAlias];
                if (!pathToFile) {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("ActionExecutor", "Path alias '" + pathAlias + "' not found, using default path", LOG_INFO));
                    pathToFile = this._pathToActions["default"];
                }
                if (!pathToFile.match(/\/$/)) {
                    pathToFile += "/";
                }

                // See if the action class already exists
                actFunction = Mojo.utils.stringToFunction(actionName);

                // If the action object does not exist in memory, get it
                if (!actFunction) {
                    var file = pathToFile + actionClass + '.js';
                    TRACE("Loading action class: " + file, [Mojo.constants.components.ACTION_EXECUTOR]);
                    jQuery.ajaxSetup({async:false});
                    jQuery.getScript(file).fail(function (xhr, status, statusTxt) {
                        throw new MojoException("ActionExecutor", "Load Error: " + file + " - Context: " + statusTxt, LOG_ERROR);
                    });
                    jQuery.ajaxSetup({async:true});
                    actFunction = Mojo.utils.stringToFunction(actionName);
                }
                else {
                    TRACE("Action already loaded: " + actionName, [Mojo.constants.components.ACTION_EXECUTOR]);
                }

                response = _evaluate(actFunction, resolvedParams, callback);
            }
        }
        catch (ex) {
            TRACE("Invalid action: " + actionName, ["Mojo.components.actionExecutor", "execute"], Mojo.utils.trace.ERROR);
            Mojo.publishEvent(Mojo.constants.events.kException,
                new MojoException("Mojo.components.actionExecutor", "Invalid action " + actionName, LOG_ERROR));
        }

        /* 
         * Function: _evaluate
         * evaluate the function with input params
         *
         * Parameters: 
         * func - the function to be evaluated
         * params - the array of params
         * callback - callback function for async action
         */
        function _evaluate(func, params, callback) {
            if (typeof params != "undefined" && typeof params != "object") {
                params = params.split(',');
            }
            if (typeof func === "function") {
                if (typeof callback === "function") {
                    // async action
                    func.call(this, callback);
                }
                else {
                    if (!params) params = []; //IE won't allow null; Need to set to empty array
                    var response = func.apply(this, params);
                    return response;
                }
            }
            else {
                throw new MojoException("ActionExecutor", "Javascript action '" + func + "' does not exist. Check your function (case sensitive, or misnamed).", LOG_ERROR);
            }
        }


        // Resolve any parameter values that are model references to their values
        // And convert a string to an array of params
        //------------------------------------------------------
        function _resolveParams(params) {
            var newParams = null
            if (!params) return newParams;

            // Resolve model references if the parameter list is a string
            if (typeof params === "string") {
                newParams = Mojo.utils.resolveModelRefs(params);

                // Add array notation if it doesn't exist
                if (newParams.charAt(0) !== "[")
                    newParams = '[' + newParams + ']'

                try {
                    // Now that we have everything resolved and set up as an array,
                    // convert it into an actual javascript object
                    newParams = Mojo.utils.jsonSerializer.toJSON(params, true);
                }
                catch (ex) {
                    TRACE("Invalid action parameters - could not convert to Array: " + params, ["Mojo.components.actionExecutor"], Mojo.utils.trace.ERROR);
                    Mojo.publishEvent(Mojo.constants.events.kException,
                        new MojoException("Mojo.components.actionExecutor", "Invalid action parameters- could not convert to Array:" + params, LOG_ERROR));
                }
            }

            else if (typeof params === "object") {
                newParams = Mojo.utils.resolveModelRefs(params);
            }

            return newParams;
        }


        return response;
    }

});
/**
 * class: ComponentRegistry
 * @author Greg Miller
 */
Mojo.components.registry = (function () {

    var _impl = {

//----------------------------------------
// Function: register
//  Register a component with Mojo
//    - the component must implement a Mojo Interface
//    - If a component of the interface type exists already in the registry
//      will publish an exception warning and overwrite the existing compoent with the passed in one
//
// Parameters:
// component - the component must implement a Mojo interface
//----------------------------------------
        registerComponent:function (component) {
            // Component must implement a Mojo Interface
            if (!component.interfaceType) {
                throw new MojoException("Mojo.components.registry", "Register: component must implement a Mojo interface: ", LOG_ERROR);
            }
            if (this.has(component.interfaceType)) {
                Mojo.publishEvent(Mojo.constants.events.kException,
                    new MojoException("Mojo.components.registry", "Replacing component: " + component.interfaceType, LOG_WARNING));

                delete _registry[component.interfaceType];

            }
            _registry[component.interfaceType] = component;
        },

//----------------------------------------
// Function: get
// Get a registered component that is of the passed in interface
//   - If no component is found
//     Will publish an execption event and return null
//
// Parameters:
// instanceType - the instanceType or interfaceType to look for in the registry
//-----------------------------------------        
        get:function (instanceType) {
            if (typeof instanceType === "string") {
                if (this.has(instanceType))
                    return _registry[instanceType];
                else {
                    Mojo.publishEvent(Mojo.constants.events.kException,
                        new MojoException("Mojo.components.registry", "Component '" + instanceType + "' not found in registry: ", LOG_WARNING));
                    return null;
                }

            }
            else if (typeof instanceType === "function") {
                for (var o in _registry) {
                    if (_registry[o] instanceof instanceType) return _registry[o];
                }
            }

            Mojo.publishEvent(Mojo.constants.events.kException,
                new MojoException("Mojo.components.registry", "Component not found in registry: ", LOG_WARNING));

            return null;

        },

        //----------------------------------------
        // Function: has
        // is the interfaceType defined
        //----------------------------------------
        has:function (interfaceType) {
            return (typeof _registry[interfaceType] != 'undefined');
        }

    };

    var _registry = [];

    return _impl;
})();
/**
 * class: ExpressionEvaluator
 * @implements {Mojo.interfaces.expressionEvaluator}
 *
 * about:
 * The Mojo expression evaluator will try and parse simple language requests into a javascript function
 *
 * Parenthesis around anything signifies that the contents of the contained therein is another expression and will be recursively evaluated
 * It is not necessary to surround the main expression with parenthesis, it is implied.
 *
 * Usage:
 *
 * An expression consists of 1,2,or 3 words that make up an equation and must be in this order
 * (words in the equation are separated by space(s) )
 *         <operand> <operator> <operand>
 *         <operator> <operand>
 *         <operand>
 * One word equations will return the evaluated operand
 *  - an example of this would be to get the value out of a model (i.e. TestModel.val1)
 *
 *
 * Special symbols:
 *  () - signify that the information contained therein is another expression
 *  [] - an array.  Contents contained inside are comma delimited.  Strings are defined in single quotes.
 *
 *
 *
 * Valid operand values :
 *      $[modelname.key]       - name of the model value to evaluated against (NOTE: booleans will automatically be converted to strings)
 *                               must be enclosed by a $[]
 *      [array]                - an array of values used in evaluating (in, notIn) expressions
 *                               must be enclosed by []
 *      (expression)           - another expression bounded by parenthesis
 *                               must be enclosed by ()
 *      string                - a string value to evaluated against
 *      number                - a numerical value to be evaluated against (valid characters <0..9>, ',', '.')
 *
 *
 * Valid operators :
 *    3 argument operators
 *      eq   - equals (NOTE:booleans will automatically be converted to strings)
 *      notEq   - not equals
 *      lt      - less than (both operands must be numbers)
 *      lte     - less than or equals (both operands must be numbers)
 *      gt      - greater than (both operands must be numbers)
 *      gte     - greater than or equals (both operands must be numbers)
 *      inArr    - value in array (second operand must be array)
 *      notInArr - value not in array (second operand must be array)
 *      or      - logically or the two statements together
 *      and      - logically and the two statements together
 *
 *    2 argument operators
 *      valueOf             - keyword indicating to lookup the name in a model
 *      hasValue            - is the value not empty (null or "" or undefined)
 *      createModel         - second operand must be:
 *                              1) a string representing the model name
 *                              2) an object that conforms to the Mojo.addModel API
 *                              Note : references to other models values ( $[modelname.key] ) will be resolved and applied
 *
 */

Mojo.components.expressionEvaluator = Mojo.interfaces.expressionEvaluator.extend({
    /*
     * Function: parseAndEvaluate
     * Evaluate a string that conforms to the specifications of the Mojo expression language
     * Returns: true/false
     *
     * Parameters:
     * expString - the string to be evaluated
     */
    parseAndEvaluate : function (expString) {

        // Pull apart the words in the expression
        // words are separated by spaces
        // anything between (). [], {} , '' , "" is considered one word.
        parts = expString.match(/\[(.+?)\]+|\((.+?)\)+|\{(.+?)\}+|\'(.+?)\'+|\"(.+?)\"+|[^\s]+/g);

        // Remove any leading or trailing quote marks because we're already working with strings
        jQuery.each(parts, function (idx, val) {
            parts[idx] = val.removeQuotes();
        });

        return this.evaluate(parts);
    },
//-----------------------------------------------------
// Function: evaluate
// Apply the logic to the operators using the operand
//
// Parameters:
// args - the argument to be evaluated to its primitive type
//-----------------------------------------------------        
    evaluate : function (args) {
        // evaluate each argument to get into its native form (array, string, number, or another expression)
        for (var i = 0; i < args.length; i++) {
            args[i] = this._evaluateOperand(args[i]);
            }

        if (args.length == 3) {
            var val1 = args[0], val2 = args[2], operator = args[1];
            switch (operator) {
                case "eq" :
                    return (val1 === val2);
                case "notEq" :
                    return (val1 !== val2);
                case "lt" :
                case "lte" :
                case "gt" :
                case "gte" :
                    if (isNaN(val1) || isNaN(val2)) throw new MojoException("ExpressionEvaluator", "'lt, lte, gt, gte' expressions must have numbers for both operands.", LOG_ERROR);
                    switch (operator) {
                        case "lt" :
                            return (val1 < val2);
                        case "lte" :
                            return (val1 <= val2);
                        case "gt" :
                            return (val1 > val2);
                        case "gte" :
                            return (val1 >= val2);
                    }
                    break;
                case "inArr" :
                    if (typeof val2 !== 'object') throw new MojoException("ExpressionEvaluator", "'inArr' expression must have an array as second operand.", LOG_ERROR);
                    return (jQuery.inArray(val1, val2) > -1 || ( val1 && jQuery.inArray("*", val2) > -1) );
                case "notInArr" :
                    if (typeof val2 !== 'object') throw new MojoException("ExpressionEvaluator", "'notInArr' expression must have an array as second operand.", LOG_ERROR);
                    return (jQuery.inArray(val1, val2) === -1 || (val1 && jQuery.inArray("*", val2) > -1));
                case "or" :
                    return (val1 || val2);
                case "and" :
                    return (val1 && val2);
                default :
                    throw new MojoException("ExpressionEvaluator", "Invalid operator: '" + operator + "'. for 3 word expression", LOG_ERROR);
            }
        }
        else if (args.length == 2) {
            val1 = args[1];
            operator = args[0];
            switch (operator) {
                case "valueOf" :
                    return val1;
                case "hasValue" :
                    return (null != val1 && typeof val1 !== "undefined" && val1 !== "");
                case "createModel" :
                    if (typeof val1 === "object") {
                        Mojo.addModel(val1);
                    }
                    else if (typeof val1 === "string") {
                        Mojo.addModel({"modelName" : val1})
                    }
                    return true;
                    break;
                default :
                    throw new MojoException("ExpressionEvaluator", "Invalid operator: '" + operator + "'. for 2 word expression", LOG_ERROR);
            }

        }
        else if (args.length == 1)
            return args[0];
        else
            throw new MojoException("ExpressionEvaluator", "Javascript expression is invalid.", LOG_ERROR);

    },

//-----------------------------------------------------
//	Group: Utility functions
//-----------------------------------------------------
    // -------------------------------
    // Function: _evaluateOperand
    // Figure out what type of operands we're dealing with
    // If it is another expression, evaluate it
    // If it is a reference to a model value, get it
    // If it is an array, turn it into one,
    // Otherwise
    // See if we can convert it to a number, if so do it
    // otherwise treat is as a string
    //
    // Parameters:
    // operand - the argument to be evaluated to its primitive type
    // -------------------------------
    _evaluateOperand : function (operand) {
        var v;
        if (!operand) return operand;

        v = operand; // default for object, boolean, string
        if (typeof operand === "object" || typeof operand === "boolean") {
            return v;
        }

        else if (this._isContainedExpression(operand))
            v = this.parseAndEvaluate(this._getContainedExpression(operand));

        // Check if Array or object
        else if (this._isObject(operand))
            v = Mojo.utils.jsonSerializer.toJSON(operand, true);

        // Resolve any model references if the operand is a string
//        else if (typeof operand === "string") {
            v = Mojo.utils.resolveModelRefs(v);
//        }

        // turn true | false strings into booleans
        if (v === "true") v = true;
        if (v === "false") v = false;


        // Turn the value into a number if applicable
        if (v && typeof v === "string" && !isNaN(v.replace(/\,/, "")))
            v = parseFloat(v.replace(/\,/, ""));

        return v;


    },

    // -------------------------------
    // Function: _isContainedExpression
    // Is the string wrapped in parenthesis
    //
    // Parameters:
    // inString - the string to match
    // -------------------------------
     _isContainedExpression: function (inString) {
        return inString.match(/^\((.*?)\)$/);
    },

    _isObject : function (inString) {
        return inString.match(/^\[(.*?)\]$/) || inString.match(/^\{(.*?)\}$/)
    },

    // -------------------------------
    // Function: _getContainedExpression
    // Get the contents of the parenthesis
    //
    // Parameters:
    // inString - the string to match
    // -------------------------------
    _getContainedExpression: function (inString) {
        return inString.replace(/^\((.*?)\)$/, "$1");
    }

});
/**
 * Class:  Mojo.application.flowResolver
 *
 * @implements {Mojo.interfaces.flowResolver}
 *
 * About:
 * This class will first resolve the flow reference to a javascript object that represents the flow
 * It will load the object out of a javascript file syncronously
 *
 * Options :
 *
 *      pathToFlows : path to the implementation of flow definitions.
 *                    Can be a string that represents the default path to ALL views,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToFlows:{
 *                                "ns1":"scripts/flows/namespace1flows/",
 *                                "ns1.flows.views":"scripts/flows/other/",
 *                                "default":"scripts/flows/"
 *                        }
 *
 *                    Then in your flow references (in the flow definitions) you reference your flows
 *                    using the namespace in using the following convention.
 *                        <namespace>.<fileReference>
 *
 *                     - everything up to the last '.' is considered a namespace and needs to be resolved in the pathToFlows
 *                     - if there is no namespace (no '.') then the default path will be used
 *
 *                        ns1.flowDef                     will be mapped to scripts/flows/namespace1flows/ (and flowDef will get resolved in the aliasMap)
 *                        ns1.flows.views.flowDef         will be mapped to scripts/flows/other
 *                        flowDef                         will be mapped to scripts/flows  (the default path)
 *
 *
 *
 *      aliasMap    :  map containing the resolution of view references to html file names
 *                     wildcard entry ('*') in the alias map will contain the default extension of the flow names
 *
 *        Note : The item in the aliasMap marked '*' indicates that any view not existing in the map will be mapped directly to their reference name.
 *               The value of the '*' entry specifies the default extension of wildcarded view mappings.
 *
 *               You only need to supply aliasMappings here if your fileAliases do not match exactly to the name of the view.
 *               For example if the name of the fileAlias is page1 and your html file is page1.html, we'll use the wildcard convention, and you don't
 *               need to supply a mapping
 *
 *                        aliasMap:{
 *                          "Pg1":"namespace1/Page1.htm",
 *                          "ns1.Pg2":"Page2.htm",
 *                          "ns2.SubflowPg":"SubflowPage.htm",
 *                          "*":".htm"
 *                        }
 * *
 */

Mojo.components.flowResolver = Mojo.interfaces.flowResolver.extend({
    kWildCard : "*",

    /*
     * Function: construct
     * construct the map
     *
     * Parameters:
     * options - the options object that contains the pathToFlows and aliasMap
     */
    construct : function (options) {
        this._pathToFlows = null;
        this._map = null;
        this._loadedDefs = [];

        if (!options)
            throw new MojoException("Flow Resolver", "missing options", LOG_ERROR);


        if (typeof options.pathToFlows === "object") {
            this._pathToFlows = options.pathToFlows;

            /* Looks for a variable ${foo} in the json object value. If found, will resolve the variable by looking for a key with
             * with the variable name and substituting it's value
             *
             * NOTE: This logic does NOT support a circular reference. 
             *       It also does NOT support resolving an unresolved variable during the action of substituting.
             */
            for (var key in this._pathToFlows) {
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(this._pathToFlows[key])) != null) {
                    if (this._pathToFlows.hasOwnProperty(matchedObj[1])) {//Test that the property exists
                        var replaceVal = this._pathToFlows[matchedObj[1]];
                        this._pathToFlows[key] = this._pathToFlows[key].replace(matchedObj[0], replaceVal);
                    } else {
                        throw new MojoException("Flow Resolver", matchedObj[0] + " variable cannot be found.", LOG_ERROR)
                    }

                }
            }

            if (!this._pathToFlows["default"]) throw new MojoException("Flow Resolver", "pathToFlows must contain a 'default' entry.", LOG_ERROR)
        }
        else if (typeof options.pathToFlows === "string") {
            this._pathToFlows = {"default" : options.pathToFlows};
        }
        else {
            throw new MojoException("Flow Resolver", "pathToFlows is invalid.  Must be an object or string.", LOG_ERROR);
        }

        if (typeof options.aliasMap === "object")
            this._map = options.aliasMap;
        else
            throw new MojoException("Flow Resolver", "aliasMap is invalid.  Must be an object", LOG_ERROR);

    },

    /*
     * Function: resolve
     * resolve the flow
     *
     * Parameters:
     * flowRef - the reference used to find the flow in the map
     */
    resolve : function (flowRef, callback) {
        var pathAlias = "default",
            alias = flowRef,
            pathToFile = null,
            flow = null,
            flowFile = null;

        // set the _abTestResolver the first time.  can't do this during construct() because abTestResolver might not be registered yet
        if(!this._abTestResolver) {
            this._abTestResolver = Mojo.getComponent(Mojo.interfaces.abTestResolver);
        }

        if (!callback) {
            throw new MojoException("Flow Resolver", "resolve() called without callback", LOG_ERROR);
        }

        // parse the pageRef into pathAlias.fileAlias
        var ns = Mojo.constants.nameSpaceRegex.exec(flowRef);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }
        else if (flowRef != null) {
            pathAlias = flowRef;
        }

        pathToFile = this._pathToFlows[pathAlias];
        if (!pathToFile) {
            TRACE("Path alias '" + pathAlias + "' not found, using default path", "Flow Resolver");
            pathToFile = this._pathToFlows["default"];
        }
        if (!pathToFile.match(/\/$/)) {
            pathToFile += "/";
        }

        if (this._map[flowRef]) {
            flow = this._map[flowRef];
            TRACE("ALIAS REF: '" + flowRef + "' --> " + flow, [Mojo.constants.components.FLOW_RESOLVER]);
        }
        else if (this._map[this.kWildCard]) {
            flow = alias + this._map[this.kWildCard]; // wild card entry will have the default extension
            TRACE("WILDCARD REF: '" + alias + "' --> " + flow, [Mojo.constants.components.FLOW_RESOLVER]);
        }
        flowFile = pathToFile + flow;

        var flowABTest = this._abTestResolver.getABTestFlow(flowRef, flowFile);
        if (flowABTest) {
            TRACE(flowRef + " --> " + flowABTest, [Mojo.constants.components.FLOW_RESOLVER, "ABTEST"]);
            flowFile = flowABTest;
        }

        // Now that we have a reference to the definition,
        // Load it out of memory, if its been loaded before.
        // Or off the server, if it hasn't
        if (flow) {
            if (this._loadedDefs[flowFile]) {
                TRACE("Loading flow out of memory: '" + flow + "'", [Mojo.constants.components.FLOW_RESOLVER]);
                callback(this._loadedDefs[flowFile]);
            }
            else {
                this._loadDef(flowFile, function (impl) {
                    this._loadedDefs[flowFile] = impl;
                    TRACE("Loading flow off server: '" + flowRef + "' --> " + flowFile, [Mojo.constants.components.FLOW_RESOLVER]);
                    callback(impl);
                }, this);
            }
        }
        else {
            callback(null);
        }
    },

    //-------------------------------------------
    // Function: isBusy
    // indicates whether flow resolver is still waiting for a flow definition to load
    //
    //-------------------------------------------
    _loadCount : 0,

    isBusy : function () {
        return this._loadCount > 0;
    },

    /*
     * Function: loadDef
     * re-usable function to load a json file from the server
     *
     * Parameters:
     * fullPath - the full path to the file
     */
    _loadDef : function (fullPath, callback, context) {
        var self = this;
        try {
            self._loadCount += 1;
            jQuery.ajax({
                url : fullPath,
                //beforeSend: function() {
                //    return(self._loadCount <= 1);
                //},
                success : function (data) {
                    /*
                     * if the server sends a response header of application/json, the data will already be a json object.
                     * otherwise, it needs to be parsed before sending to the callback.
                     */
                    var def;
                    if (typeof(data) === "string") {
                        def = jQuery.parseJSON(data);
                    }
                    else {
                        def = data;
                    }
                    self._loadCount -= 1;
                    callback.call(context, def);
                },
                error : function (xhr, status, statusTxt) {
                    self._loadCount -= 1;
                    if ("parsererror" === status)
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Flow Resolver", "Parse Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));

                    else
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Flow Resolver", "Load Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));
                }
            });

        }
        catch (ex) {
            if (ex instanceof MojoException)
                throw ex;
            else
                throw new MojoException("Flow Resolver", "UNKNOWN EXCEPTION:  " + flow, LOG_ERROR, ex);
        }
    }

});

Mojo.components.ModalWindow = Mojo.interfaces.modalwindow.extend({

    construct : function () {
        var self = this;
        self.closeCB = null;

        self.$modal = jQuery("<div></div>", {
            id : "modalContainer"
        });
        self.$modal.appendTo("body").hide();


        self.$modalClose = jQuery("<div></div>", {
            id : "modalClose"
        }).appendTo(self.$modal).click(
            function () {
                if (self.closeCB) self.closeCB();
            }).hide();


        self.$modalBg = jQuery("<div></div>", {
            id : "modalBgContainer"
        }).appendTo("body").hide();


        self.$modalInner = jQuery("<div></div>", {
            id : "modalInnerContainer"
        }).appendTo(self.$modal);


        self.$modalProcessing = jQuery("<div></div>", {
            id : "modalProcessing"
        }).html("Processing...").hide();

        self.$modalProcessing.appendTo(self.$modal);

    },

    //------------------------------------------
    // Displays the modal window.
    // Contains logic to center and position the
    // modal
    //-------------------------------------------
    show : function (addCloseBtn, closeCallback) {
        var self = this;
        self.closeCB = closeCallback;

        var width = null,
            top = null,
            left = null;

        if (addCloseBtn) self.$modalClose.show(0);
        else self.$modalClose.hide(0);

        width = self.$modal.outerWidth();
        top = "100px";
        left = jQuery(window).width() / 2 - width / 2;

        self.$modal.css({
            "top" : top,
            "left" : left
        });

        if (self.$modal.is(":hidden")) {
            self.$modal.show();
            self.$modalBg.show();
        }

    },

    //------------------------------------------
    // Hides the modal window.
    //-------------------------------------------
    hide : function () {
        var self = this;
        if (!self.$modal.is(":hidden")) {
            self.$modalInner.empty();
            self.$modal.hide();
            self.$modalBg.hide();
        }
        self.closeCB = null;
    },

    //-------------------------------------------------------
    // Get the id of the div we want to use as the viewport
    //-------------------------------------------------------
    getViewPortId : function () {
        return this.$modalInner.attr("id");
    }


});



/**
 * class: Mojo.components.modelDefResolver
 *
 * @implements {Mojo.interfaces.modelDefResolver}
 *
 * About:
 * This class will first resolve the flow reference to a javascript object that represents the flow
 * It will load the object out of a javascript file syncronously
 *
 * Options :
 *
 *      defaultExtension : i.e. ".json" to be used if one is not supplied for the definition
 *
 *      pathToModelDefs : path to the implementation of model definitions.
 *                    Can be a string that represents the default path to ALL views,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToModelDefs:{
 *                                "ns1":"scripts/modeldefs/temp/",
 *                                "ns1.foo.bar":"scripts/modeldefs/other/",
 *                                "default":"scripts/modeldefs/"
 *                        }
 *
 *                    Then in your flow references (in the flow definitions) you reference your flows
 *                    using the namespace in using the following convention.
 *                        <namespace>.<fileReference>
 *
 *                     - everything up to the last '.' is considered a namespace and needs to be resolved in the pathToFlows
 *                     - if there is no namespace (no '.') then the default path will be used
 *
 *                        ns1.modelDef                    will be mapped to scripts/modeldefs/temp/ (and modelDef will get looked up in the nameToDefMap)
 *                        ns1.foo.bar.modelDef            will be mapped to scripts/modeldefs/other/
 *                        flowDef                         will be mapped to scripts/modeldefs  (the default path)
 *
 *
 *      nameToDefMap    :  hashmap that maps model names to the string name of their definition.
 *                         NO WILDCARD ENTRIES
 *
 * Note: the strings that represent the model definitions in the nameToDefMap MUST BE the same as the name of the javascript file
 *       ex. The model def named "mainDef.json" in the map must reside in a file named mainDef.json if it is to be dynamically loaded.
 */
Mojo.components.modelDefResolver = Mojo.interfaces.modelDefResolver.extend({

    construct : function (options) {
        this._pathToModelDefs = null;
        this._map = null;
        this._defaultExtension = ".json";
        this._loadedDefs = {};

        if (!options)
            throw new MojoException("ModelDefResolver", "missing options", LOG_ERROR);

        //----------------
        // Set the paths
        //----------------
        if (typeof options.pathToModelDefs === "object") {
            this._pathToModelDefs = options.pathToModelDefs;

            /* Looks for a variable ${foo} in the json object value. If found, will resolve the variable by looking for a key with
             * with the variable name and substituting it's value
             *
             * NOTE: This logic does NOT support a circular reference. 
             *       It also does NOT support resolving an unresolved variable during the action of substituting.
             */
            for (var key in this._pathToModelDefs) {
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(this._pathToModelDefs[key])) != null) {
                    if (this._pathToModelDefs.hasOwnProperty(matchedObj[1])) {//Test that the property exists
                        var replaceVal = this._pathToModelDefs[matchedObj[1]];
                        this._pathToModelDefs[key] = this._pathToModelDefs[key].replace(matchedObj[0], replaceVal);
                    } else {
                        throw new MojoException("ModelDefResolver", matchedObj[0] + " variable cannot be found.", LOG_ERROR);
                    }
                }
            }


            if (null === this._pathToModelDefs["default"] || typeof this._pathToModelDefs["default"] === "undefined")
                throw new MojoException("ModelDefResolver", "pathToModelDefs must contain a 'default' entry.", LOG_ERROR);
        }
        else if (typeof options.pathToModelDefs === "string") {
            this._pathToModelDefs = {"default" : options.pathToModelDefs};
        }
        else {
            throw new MojoException("ModelDefResolver", "pathToModelDefs is invalid.  Must be an object or string.", LOG_ERROR);
        }


        //----------------
        // Set the hashmap
        //----------------
        if (typeof options.nameToDefMap === "object")
            this._map = options.nameToDefMap;
        else
            throw new MojoException("ModelDefResolver", "nameToDefMap is invalid.  Must be an object", LOG_ERROR);

        //----------------
        // Set the default extension
        //----------------
        if (typeof options.defaultExtension === "string") {
            this._defaultExtension = options.defaultExtension;
        }
    },

    /**
     * Load a file containing combined model defs, and cache the definitions
     *
     * The keys in the combined definitions file are the paths to the individual model definition files,
     * relative to the default path.  When forming the indexes of the _loadedDefs cache, the default path is added to those keys.
     *
     * @param defsFile - path to combined model definitions file
     * @param callback - function to call after loading
     */
    loadModelDefinitions : function(defsFile, callback) {
        var defaultBasePath = this._pathToModelDefs["default"];
        if (!defaultBasePath.match(/\/$/)) {
            defaultBasePath += "/";
        }

        var relPath = defsFile.substr(0, defsFile.lastIndexOf('/') + 1);
        try {
            jQuery.ajax({
                url : defaultBasePath + defsFile,
                context : this,
                success : function (data) {
                    /*
                     * if the server sends a response header of application/json, the data will already be a json object.
                     * otherwise, it needs to be parsed before sending to the callback.
                     */
                    var defs;
                    if (typeof(data) === "string") {
                        defs = jQuery.parseJSON(data);
                    }
                    else {
                        defs = data;
                    }
                    _.each(defs, function(defObj, defFile) {
                        var fullPath = defaultBasePath + relPath + defFile;
                        this._loadedDefs[fullPath] = defObj;
                    }, this);
                    if(_.isFunction(callback)) {
                        callback.call(true);
                    }
                },
                error : function (xhr, status, statusTxt) {
                    // this is not a fatal error, but will affect performance since the model definitions will get loaded individually
                    TRACE("Failed to load combined model definitions", ["modelDefResolver", "loadModelDefinitions"], Mojo.utils.trace.ERROR);
                    if(_.isFunction(callback)) {
                        callback.call(false);
                    }
                }
            });

        }
        catch (ex) {
            if (ex instanceof MojoException)
                throw ex;
            else
                throw new MojoException("Flow Resolver", "UNKNOWN EXCEPTION:  " + flow, LOG_ERROR, ex);
        }
    },

    getDef : function (modelName, defFileName, callback) {
        var pathAlias = "default",
            alias = modelName,
            pathToFile = null,
            defName = null;

        // parse the pageRef into pathAlias.fileAlias
        var ns = Mojo.constants.nameSpaceRegex.exec(modelName);
        if (ns) {
            pathAlias = ns[1];
        }

        pathToFile = this._pathToModelDefs[pathAlias];
        if (!pathToFile) {
            Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Model Def Resolver", "Path alias '" + pathAlias + "' not found, using default path", LOG_WARNING));
            pathToFile = this._pathToModelDefs["default"];
        }
        if (!pathToFile.match(/\/$/)) pathToFile += "/";

        // Use the definition name passed in if there is one
        if (defFileName) {
            defName = defFileName;
        }
        // Otherwise Look the definition up in the map
        else if (!defFileName && this._map[modelName]) {
            defName = this._map[modelName];
            TRACE("ALIAS REF: '" + modelName + "' --> " + defName, [Mojo.constants.components.MODELDEF_RESOLVER]);
        }

        // Tack on the extension if needed
        var regex = new RegExp("^(.*)(" + this._defaultExtension + ")$");
        if (defName && !(regex.exec(defName))) {
            defName = defName + this._defaultExtension;
        }
        var fullPathToDef = pathToFile + defName;
        // Now that we have a reference to the definition,
        // Load it out of memory, if its been loaded before.
        // Or off the server, if it hasn't
        if (defName) {
            if (this._loadedDefs[fullPathToDef]) {
                TRACE("Loading model def out of memory: '" + defName + "'", [Mojo.constants.components.MODELDEF_RESOLVER]);
                return this._returnDef(this._loadedDefs[fullPathToDef], callback);
            }
            else {
                TRACE("Loading model def off server: '" + defName + "' --> " + fullPathToDef, [Mojo.constants.components.MODELDEF_RESOLVER]);
                if (typeof callback === "function") {
                    this._loadDefAsync(fullPathToDef, function (impl) {
                        this._loadedDefs[fullPathToDef] = impl;
                        callback(impl);
                    }, this);
                }
                else {
                    var impl = this._loadDef(fullPathToDef);
                    this._loadedDefs[fullPathToDef] = impl;
                    return this._returnDef(impl, callback);
                }
            }
        }
        else {
            return this._returnDef(null, callback);
        }
    },

    isBusy : function () {
        return this._loadCount > 0;
    },


    _returnDef : function (def, callback) {
        if (typeof callback === "function") {
            callback(def);
            return null;
        }
        else {
            return def;
        }
    },

    /*
     * Function: loadDef
     * re-usable function to load a json file from the server
     *
     * Parameters:
     * fullPath - the full path to the file
     */
    _loadDef : function (fullPath) {
        try {
            var def;
            jQuery.ajaxSetup({async : false});
            jQuery.getJSON(fullPath,
                function (data) {
                    def = data;
                }).error(function (xhr, status, statusTxt) {
                    if ("parsererror" === status)
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Model Def Resolver", "Parse Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));
                    else
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Model Def Resolver", "Load Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));
                });
            jQuery.ajaxSetup({async : true});

            return def;
        }
        catch (ex) {
            if (ex instanceof MojoException)
                throw ex;
            else
                throw new MojoException("Model Def Resolver", "UNKNOWN EXCEPTION:  " + fullPath, LOG_ERROR, ex);
        }
    },

    _loadCount : 0,
    _loadDefAsync : function (fullPath, callback, context) {
        var self = this;
        try {
            jQuery.ajax({
                url : fullPath,
                success : function (data) {
                    /*
                     * if the server sends a response header of application/json, the data will already be a json object.
                     * otherwise, it needs to be parsed before sending to the callback.
                     */
                    var def;
                    if (typeof(data) === "string") {
                        def = jQuery.parseJSON(data);
                    }
                    else {
                        def = data;
                    }
                    self._loadCount -= 1;
                    callback.call(context, def);
                },
                error : function (xhr, status, statusTxt) {
                    self._loadCount -= 1;
                    if ("parsererror" === status)
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Model Def Resolver", "Parse Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));

                    else
                        Mojo.publishEvent(Mojo.constants.events.kException,
                            new MojoException("Model Def Resolver", "Load Error: " + fullPath + " - Context: " + statusTxt, LOG_ERROR));
                }
            });

        }
        catch (ex) {
            if (ex instanceof MojoException)
                throw ex;
            else
                throw new MojoException("Flow Resolver", "UNKNOWN EXCEPTION:  " + flow, LOG_ERROR, ex);
        }
    }
});
/**
 * class: Mojo.components.screenTransitioner
 *
 * @implements {Mojo.interfaces.screenTransitioner}
 *
 * Transition a screen in or out of view, based on bShow flag, and call the callback when done
 * .
 * The transitionScreen function receives options (see below) which contain the key/value pairs specified in the data-nav-options attribute of the html.
 * Those options can be used to vary the type of transition effect based on the current circumstances.
 * For example, one could specify in the html data-nav-options="{transition:"vertical",speed:"slow"}
 * This baseline implementation of the ScreenTransitioner doesn't use the options,
 * but it's easy to extend this implementation and register a different version with Mojo using this syntax at the start of the application:
 * Mojo.registerComponent(new MyEnhancedScreenTransitioner());  // MyEnhancedScreenTransitioner must extend Mojo.interfaces.screenTransitioner.extend
 *
 */
Mojo.components.screenTransitioner = Mojo.interfaces.screenTransitioner.extend({

    construct: function (options) {
    },

    /**
     * The main method of the ScreenTransitioner.  This method is responsible for transitioning a given screen into or out of view,
     * and calling the callback when the transition is complete.
     *
     * @param params - an object containing the floowing properties
     *      targetId - the id of the container which holds the screen that's to be transitioned
     *      bShow - boolean indicated whether the screen is coming into view (true) or out of view (false)
     *      callback - function which must be called when the transition is complete
     *      options - contains key/value pairs specified in the data-nav-options attribute.  These can be used to vary the transition effect based on the circumstance.
     */
    transitionScreen: function(params) {
        var targetId = params.targetId;
        var bShow = params.bShow;
        var callback = params.callback;
        var options = params.options || {};

        if (bShow)
            jQuery('#' + targetId).fadeIn(300, callback);
        else
            jQuery('#' + targetId).fadeOut(300, callback);
    }

});
/**
 * class: Mojo.uiComponents.registry
 * @author Greg Miller
 *
 * About : This class is responsible for registering application UI components with Mojo
 *
 *
 * Note : This registry holds classes of functions, NOT an instance of them.  So when you register a component, only register the class, not an instanciation of one.
 *
 */
Mojo.uiComponents.registry = (function () {

    var _impl = {

        // Register a class with Mojo that represents a UI component
        // The class must implement the uiComponent interface
        registerComponentClass : function (name, componentClass) {
            if (_.has(_registeredComponents, name)) return;

            // Component must implement a Mojo UI Componenet Interface
            var component = new componentClass();
            if (component.interfaceType !== "uiComponent") {
                throw new MojoException("Mojo.components.registry", "Register: component must implement a Mojo UI interface: ", LOG_ERROR);
            }
            component = null;

            _registeredComponents[name] = componentClass;
            TRACE("added UI component, name = " + name);
        },

        // Look up the registered UI component in our registry and then
        // new one up and return it.
        // May return null if the new fails, or the component doesn't exist
        createComponent : function (name) {
            if (_.has(_registeredComponents, name))
                return new _registeredComponents[name]();
            else {
                Mojo.publishEvent(Mojo.constants.events.kException,
                    new MojoException("Mojo.uiComponents.registry", "createComponent: component: '" + name + "' does not exist", LOG_ERROR));
                return null;
            }
        }

    }

    var _registeredComponents = {}

    return _impl;

})();
/**
 * class: Mojo.components.viewResolver
 *
 * @implements {Mojo.interfaces.viewResolver}
 *
 * about:
 * Functionality to turn a reference of a view into the actual implementation of the view
 *
 * Options :
 *
 *      pathToViews : path to the implementation of html files.
 *                    Can be a string that represents the default path to ALL views,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToViews:{
 *                                "ns1":"html/namespace1files/",
 *                                "ns1.views":"html/namespace2files/other/",
 *                                "default":"html/"
 *                        }
 *
 *                    Then in your flow references (in the flow definitions) you reference your flows
 *                    using the namespace in using the following convention.
 *                        <namespace>.<fileReference>
 *
 *                     - everything up to the last '.' is considered a namespace and needs to be resolved in the pathToFlows
 *                     - if there is no namespace (no '.') then the default path will be used
 *
 *                        ns1.page1                     will be mapped to html/namespace1files/ (and page1 will get resolved in the aliasMap)
 *                        ns1.views.page1               will be mapped to html/namespace2files/other/
 *                        page1                         will be mapped to html/  (the default path)
 *
 *
 *
 *      aliasMap    :  map containing the resolution of view references to html file names
 *                     wildcard entry ('*') in the alias map will contain the default extension of the flow names
 *
 *        Note : The item in the aliasMap marked '*' indicates that any view not existing in the map will be mapped directly to their reference name.
 *               The value of the '*' entry specifies the default extension of wildcarded view mappings.
 *
 *               You only need to supply aliasMappings here if your fileAliases do not match exactly to the name of the view.
 *               For example if the name of the fileAlias is page1 and your html file is page1.html, we'll use the wildcard convention, and you don't
 *               need to supply a mapping
 *
 *                        aliasMap:{
 *                          "Pg1":"namespace1/Page1.htm",
 *                          "ns1.Pg2":"Page2.htm",
 *                          "ns2.SubflowPg":"SubflowPage.htm",
 *                          "*":".htm"
 *                        }
 *
 *
 *
 */
Mojo.components.viewResolver = Mojo.interfaces.viewResolver.extend({
    kWildCard:"*",

    /*
     * Function: construct
     * construct the map
     *
     * Parameters:
     * options - the options object that contains the pathToViews and aliasMap
     *
     */
    construct:function (options) {
        this._pathToViews = null;
        this._map = null;

        if (!options)
            throw new MojoException("View Resolver", "missing options", LOG_ERROR);


        if (typeof options.pathToViews === "object") {
            this._pathToViews = options.pathToViews;
            
            /* Looks for a variable ${foo} in the json object value. If found, will resolve the variable by looking for a key with
             * with the variable name and substituting it's value
             *
             * NOTE: This logic does NOT support a circular reference. 
             *       It also does NOT support resolving an unresolved variable during the action of substituting.
             */
            for(var key in this._pathToViews) {
                var matchedObj;
                while(( matchedObj = /\$\{(.*?)\}/g.exec(this._pathToViews[key])) != null) {
                    if(this._pathToViews.hasOwnProperty(matchedObj[1])) {//Test that the property exists
                        var replaceVal = this._pathToViews[matchedObj[1]];
                        this._pathToViews[key] = this._pathToViews[key].replace(matchedObj[0], replaceVal);
                    } else {
                        throw new MojoException("View Resolver", matchedObj[0] + " variable cannot be found.", LOG_ERROR)
                    }
                }
            }
            
            if (!this._pathToViews["default"]) throw new MojoException("View Resolver", "pathToViews must contain a 'default' entry.", LOG_ERROR)
        }
        else if (typeof options.pathToViews === "string") {
            this._pathToViews = {"default":options.pathToViews};
        }
        else {
            throw new MojoException("View Resolver", "pathToView is invalid.  Must be an object or string.", LOG_ERROR);
        }

        if (typeof options.aliasMap === "object")
            this._map = options.aliasMap;
        else
            throw new MojoException("View Resolver", "aliasMap is invalid.  Must be an object", LOG_ERROR);

    },

    /*
     * Function: resolve
     * resolve the path to the view
     *
     * Parameters: 
     * pageRef - the period-delimited filepath(eg. "a.b.c") we need to break this filepath into 2 parts.
     *      1st part is the filepath prefix. (eg. "a/b")
     *      2nd part is the actual file alias (eg. "c")
     *
     * We then look for the alias in the ABTest util class to see if there's a match, if not we'll look
     * for a match in the viewResolverConfig object
     */
    resolve:function (pageRef) {
        var pathAlias = "default",
            alias = pageRef,
            pathToFile = null,
            page = null;

        // set the _abTestResolver the first time.  can't do this during construct() because abTestResolver might not be registered yet
        if(!this._abTestResolver) {
            this._abTestResolver = Mojo.getComponent(Mojo.interfaces.abTestResolver);
        }

        // parse the pageRef into pathAlias.fileAlias
        var ns = Mojo.constants.nameSpaceRegex.exec(pageRef);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }

        pathToFile = this._pathToViews[pathAlias];
        if (!pathToFile) {
            Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("View Resolver", "Path alias '" + pathAlias + "' not found, using default path", LOG_WARNING));
            pathToFile = this._pathToViews["default"];
        }
        if (!pathToFile.match(/\/$/)) pathToFile += "/";

        if (this._map[pageRef]) {
            page = this._map[pageRef];
            TRACE("ALIAS REF: '" + pageRef + "' --> " + page, [Mojo.constants.components.VIEW_RESOLVER]);
        }
        else if (this._map[this.kWildCard]) {
            page = alias + this._map[this.kWildCard]; // wild card entry will have the default extension
            TRACE("WILDCARD REF: '" + alias + "' --> " + page, [Mojo.constants.components.VIEW_RESOLVER]);
        }
        if (page) {
            pathToFile += page;
            TRACE("FULL PATH RESOLUTION: '" + pageRef + "' --> " + pathToFile, [Mojo.constants.components.VIEW_RESOLVER]);
        }

        var pathToFileABTest = this._abTestResolver.getABTestPage(pageRef, pathToFile);
        if (pathToFileABTest) {
            TRACE(pageRef + " --> " + pathToFileABTest, [Mojo.constants.components.VIEW_RESOLVER, "ABTEST"]);
            pathToFile = pathToFileABTest;
        }

        return pathToFile;
    },

    isBusy:function () {
        return false;
    }
});

//-------------------------------------------------------------------------------------
// class: Application Controller Class
//
//  About : This class manages the flows and views of Mojo and the navigation events posted by the application to that drive those flows.
//
//
//  Note : Modal functionality - the way that I implemented this is that waaaay down in a flow, if a node is marked as "modal", it will 'pause' itself.
//              Then it will call the Mojo.getSome (for a modal flow) or Mojo.loadPage (for a single page).  This class will then create a brand new flow controller to handle the modal flow.
//              When the modal flow is finished it will reinistigate the original flowcontroller and call the supplied callback passing the response from the modal flow.
//              The flow can then decide to resume of stay on the current page.
//
//  Events :
//      Mojo.constants.events.kBeforePageUnload : page is about to be unloaded
//          {"pageAlias" : <page reference>}
//
//      Mojo.constants.events.kBeforePageLoad : After the page has been resolved, but before the page has loaded;
//          {"pageAlias" : <page reference>, "customerProfile" : <customer profile information - how long they were on the page>}
//
//      Mojo.constants.events.kPageLoaded : after a page is finished loading - before bindings applied to page
//          {"pageAlias": <page reference>}
//
//      Mojo.constants.events.kPageFinalized : after a page is finished loading - and all processing is complete
//          {"pageAlias": <page reference>, "pageProfile" : <page profile information>}
//
//      Mojo.constants.events.kEndMojo : Mojo ran off the end of the controller, no more pages
//          Mojo.flow.flowResponse that contains information about the last node
//
//-------------------------------------------------------------------------------------
Mojo.application.applicationController = (function () {
    var _sessionId = null,
        _controller = null,
        _controllerStack = [],
        _viewResolver = null,
        _viewPort = null,
        _navigating = false,
        _savedViewInfo = null,
        _currentPage = null,
        _modalWindow = null,
        _inModal = false,
        _pageProfiler = new Mojo.utils.profiler("VIEW_PROFILE"),
        _customerTimeProfiler = new Mojo.utils.profiler("CUSTOMER_TIME");

    var _instance = {

        init : function () {
            // Create our session id
            _sessionId = Mojo.utils.uuid();
            _viewPort = _viewPort || Mojo.application.options.viewPortId;
            _viewResolver = Mojo.getComponent(Mojo.interfaces.viewResolver);
            _modalWindow = Mojo.getComponent("modalwindow");
            if (!_viewResolver) _throwError("View Resolver not registered in framework");
            if (!_viewPort) _throwError("No view port specifed");

            // Set up listeners for events
            Mojo.subscribeForEvent(Mojo.constants.events.kException, _instance.handleUIException, _instance);
            Mojo.subscribeForEvent(Mojo.constants.events.kNavigation, _instance.handleNavEvent, _instance);

            // Create an application scope model
            Mojo.addModel({modelName : Mojo.constants.scopes.kApplicationScope});

        },


//-------------------------------------------
// Group: Configuration setting
//-------------------------------------------

        // Function: setViewPort
        setViewPort : function (containerId) {
            _viewPort = containerId;
        },

//-------------------------------------------
// Group: Navigation functionality
//-------------------------------------------
        // Function: handleNavEvent
        handleNavEvent : function (options) {
            if (!options) {
                return;
            }
            if (_controller && _controller.isBusy()) {
                TRACE("Not navigating while Flow Controller is busy");
                return;
            }
            if (_navigating) {
                TRACE("Previous navigation is in progress");
                //return;  // could return here instead of enforcing single click for navigation actions
            }

            //----------------------------------------
            // Do any validation on the current screen
            //----------------------------------------
            var validate = true;
            if (options.hasOwnProperty('validate') && options.validate == false) {
                validate = false;
            }
            if (options.nav && options.nav === 'back' && options.hasOwnProperty('validate') == false) {
                validate = MojoOptions.validateOnBack;
            }
            else if (options.jump && options.hasOwnProperty('validate') == false) {
                validate = MojoOptions.validateOnJump;
            }
            else if (options.load && options.hasOwnProperty('validate') == false) {
                validate = MojoOptions.validateOnJump;
            }
            else if (options.flow && options.hasOwnProperty('validate') == false) {
                validate = MojoOptions.validateOnJump;
            }
            if (validate && !this.validateSection(_viewPort, true)) {
                _navigating = false;
                return;
            }

            // Do any cleanup on the current page before loading the next one
            if (_currentPage) {
                _endPage();
            }

            // Now navigate to the next page
            _pageProfiler.mark("nav");
            _navigating = true;
            if (options.nav) _doNext(options.nav, options);
            else if (options.jump) _jumpTo(options.jump, options);
            else if (options.load) _instance.loadPage(options.load, options);
            else if (options.flow) _instance.startflow(options.flow, options);


        },


//-------------------------------------------
// Function: start
// Start 'r up
//   and load the first page of a flow
//-------------------------------------------
        startflow : function (flowName, options, inputVars, completeCallback) {

            if (_controller) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.application.applicationController", "Starting Mojo flow with pre-existing flow.", LOG_INFO));
            }

            _navigating = true;
            var controllerOpts = {};
            if (options && options.modal) {
                if (_controller) _controllerStack.push(_controller);
                _controller = Mojo.flow.controller();

                // Callback function for closing modal flow
                function __oncloseModalFlow(flowResp) {
                    _instance.endModal(options); // close the modal

                    // get us back to our previous state
                    // and let the flow get to right node
                    _controller = _controllerStack.pop();
                    if (completeCallback) completeCallback(flowResp);

                    // If we get an indicator that the clients want navigation from the modal
                    if (options.navWhenDone && flowResp) {
                        _doNext(flowResp.value, flowResp.options);
                    }
                }

                _instance.startModal(options, __oncloseModalFlow);
                controllerOpts.onEndCB = __oncloseModalFlow;
                _controller.init(controllerOpts);
            }
            // Currenly only allow one main flow at a time
            // So if one exists, don't gen up a new one and push the old one on the stack
            // TODO - enable multiple flows that push the old one on the stack
            else if (!_controller) {
                _controller = Mojo.flow.controller();
                controllerOpts.onEndCB = _onControllerEnd
                _controller.init(controllerOpts);
            }

            _jumpTo(flowName, options, inputVars);

        },


//--------------------------------------
// Load a page - this will mess up the flow controller
//  If one is running
//--------------------------------------
        loadPage : function (pageAlias, options, completeCallback) {

            if (_controller) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Mojo.application.applicationController", "Loading a page when the controller is running. " +
                    "This can cause problems if you want to resume the controller", LOG_WARNING));
            }

            _navigating = true;
            if (options && options.modal) {
                _instance.startModal(options, completeCallback);
            }
            _loadContent(_viewPort, pageAlias, options);

        },

//-------------------------------------------
// Function: forceEnd
// Allow an outside influence the ability to stop the controller and end it
//-------------------------------------------
        forceEnd : function () {
            _onControllerEnd();
        },

//-------------------------------------------
// Function: getSessionId
// get a flow scoped variable out of the current flow
//  - may return null or undefined
//
// Parameters:
//   name - the name of the variable to get
//-------------------------------------------
        getSessionId : function () {
            return _sessionId;
        },

//-------------------------------------------
// Function: getCurrentFlowVariable
// get a flow scoped variable out of the current flow
//  - may return null or undefined
//
// Parameters:
//   name - the name of the variable to get
//-------------------------------------------
        getCurrentFlowVariable : function (name) {
            if (_controller)
                return _controller.getCurrentFlowVariable(name);
            else
                return null;
        },

//-------------------------------------------
// Function: getCurrentFlowScopeName
// get the name of the current flow scope
//  - may return null or undefined
//
//-------------------------------------------
        getCurrentFlowScopeName : function () {
            if (_controller)
                return _controller.getCurrentFlowScopeName();
            else
                return null;
        },


//-------------------------------------------
// Group: Validation of screen elements
//-------------------------------------------
        // Function: validateSection
        validateSection : function (containerID, displayError) {
            if (!MojoOptions.useValidator) return true;


            // If the form exists then validate will be true otherwise false
            var validate = jQuery("#" + containerID)[0];
            var isValid = true;
            var _validationEngine = Mojo.inputStrategies.validator.engine;

            // If we need to validate this form then validate and return true if no errors are present
            if (validate) {
                // Init the form with default settings (this could be placed in the section where each form is loaded)
                _validationEngine.attach({
                    "containerID" : containerID,
                    "showErrors" : displayError,
                    "hideOnFocus" : MojoOptions.tooltipOptions.hideOnFocus,
                    "showOnlyOne" : MojoOptions.tooltipOptions.showOnlyOne,
                    "tooltipPosition" : MojoOptions.tooltipOptions.position
                });

                // call the validationEngine's validateAll() method which will loop through all of the input fields with "validator" attribute and apply validation logic on them
                isValid = _validationEngine.validateAll();
            }

            return isValid;

        },


//--------------------------------------
// Group: Modal Functionality
//--------------------------------------
        // Function: startModal
        startModal : function (options, closeCallback) {
            _modalWindow.show(options.closeButton, __onclose);
            _inModal = true;

            // Save off the original viewport so we can get it back later after the
            // modal closes
            _savedViewInfo = {
                viewPort : _viewPort,
                view : _currentPage
            };
            _viewPort = _modalWindow.getViewPortId();

            function __onclose() {
                if (closeCallback) closeCallback();
                _instance.endModal(options);
            }
        },

        // Function: endModalFlow
        endModal : function (options) {
            _modalWindow.hide();
            _inModal = false;

            // Cleanup
            _endPage();

            // Restore to the regular viewport
            if (_savedViewInfo) {
                _viewPort = _savedViewInfo.viewPort;
                _currentPage = _savedViewInfo.view;
            }
            _savedViewInfo = null;
            if (_currentPage)
                _loadContent(_viewPort, _currentPage, options);
        },


//-------------------------------------------
// Group: Error handling
//-------------------------------------------
        // Function: handleUIException
        handleUIException : function (exception /*MojoException Obj*/) {
            var message = "Application (" + MojoOptions.appId + ") " + exception.logType + ": Component=" + exception.component + " Msg=" + exception.msg;

            if (exception.exeptionObj) message += "\nCaused by:\n" + exception.exeptionObj.message;
            if (exception.logType === LOG_ERROR) {
                if (MojoOptions.showMojoExceptions) {
                    alert(message);
                }
            }
            TRACE(message, null, exception.logType);
        }

    };


//==============================================================
// Group: Private
//==============================================================

//--------------------------------------------------------------
// Function: doNext
//--------------------------------------------------------------
    function _doNext(response, options) {
        if (!_controller) {
            _handleException(new MojoException("Mojo.application.applicationController", "_doNext: You must start a flow before navigating", LOG_ERROR));
            return;
        }
        try {
            _controller.getNextView(response, function (pageAlias) {
                _pageProfiler.captureTimeFromMark("navTime", "nav");
                _loadContent(_viewPort, pageAlias, options);
            });
        }
        catch (ex) {
            _handleException(ex)
        }

    }


//--------------------------------------------------------------
// Function: _jumpTo
//           options and inputVars will be applied to the first node in the path
//--------------------------------------------------------------
    function _jumpTo(path, options, inputVars) {
        if (!path) {
            _handleException(new MojoException("Mojo.application.applicationController", "_jumpTo: No flow name specifed", LOG_ERROR));
            return;
        }
        if (!_controller) {
            _handleException(new MojoException("Mojo.application.applicationController", "_jumpTo: You must start a flow before jumping", LOG_ERROR));
            return;
        }

        try {
            if (typeof path === "string") {
                path = path.split(Mojo.flow.constants.kNavigationSeperator);
                jQuery.each(path, function (idx, itm) {
                    if (0 == idx) path[idx] = new Mojo.flow.flowJumpObj(itm, inputVars, options);
                    else path[idx] = new Mojo.flow.flowJumpObj(itm);
                });
            }
            // Now jump
            _controller.navigateTo(path, function (pageAlias) {
                _pageProfiler.captureTimeFromMark("navTime", "nav");
                _loadContent(_viewPort, pageAlias, options);
            });
        }
        catch (ex) {
            _handleException(ex)
        }

    }

    //------------------------------------------------
    // Finish up the flows
    //------------------------------------------------
    function _onControllerEnd(flowResponse) {
        // Clean up
        _endPage();
        _currentPage = null;
        _navigating = false;

        // TODO - see if we have controllers to pop (if we ever support multiple flows)
        _controller = null;

        // otherwise publish an event that we're done
        Mojo.publishEvent(Mojo.constants.events.kEndMojo, flowResponse);

    }

//------------------------------------------
// Function: _loadContent
// load the content from the server
// and then bind any data to the input
// optional callback when content is loaded
//-------------------------------------------
    function _loadContent(targetId, pageAlias, options) {
        if (!_navigating) return;  // we should be in the midst of navigating if we get here

        var screenTransitioner = Mojo.getComponent("screenTransitioner");

        _pageProfiler.mark("rslv");
        var htmlPage = _viewResolver.resolve(pageAlias);
        _pageProfiler.captureTimeFromMark("resolveTime", "rslv");

        // transition off the current screen
        if (pageAlias !== _currentPage) {
            screenTransitioner.transitionScreen({targetId : targetId, bShow : false, options : options, callback : _loadNewPage});
        }
        else {
            _loadNewPage();
        }

        // Set up before the page loads
        _onBeforePageLoad(pageAlias);

        // Function: _loadNewPage
        function _loadNewPage() {

            _pageProfiler.mark("load");
            jQuery('#' + targetId).load(htmlPage, function (rspTxt, status, xhr) {
                _pageProfiler.captureTimeFromMark("loadTime", "load");

                // let the system know that we're done navigating
                _navigating = false;

                if ("error" == status) {
                    _handleException(new MojoException("Mojo.application.applicationController", "Error loading page: " + htmlPage + " MORE CONTEXT: " + rspTxt, LOG_ERROR));
                    return;
                }

                // Do any page setup that is necessary
                // hide the processing/loading screen
                if (pageAlias !== _currentPage) {
                    screenTransitioner.transitionScreen({targetId : _viewPort, options : options, bShow : true});
                }

                _currentPage = pageAlias;
                _beginPage(options);

                //  After the new page is loaded
                // Ferret out the Mojo specific DOM attributes and do our binding thing with them
                try {
                    _pageProfiler.mark("bind");
                    Mojo.applyBindings(targetId);
                    _pageProfiler.captureTimeFromMark("bindTime", "bind");
                }
                catch (ex) {
                    _handleException(ex);
                }

                _pageProfiler.captureTimeFromMark("total");
                TRACE("Navigation Time: " + _pageProfiler.getCapture("navTime") +
                    "ms, Resolve Time: " + _pageProfiler.getCapture("resolveTime") +
                    "ms, Load Time: " + _pageProfiler.getCapture("loadTime") +
                    "ms, Binding Time: " + _pageProfiler.getCapture("bindTime") +
                    "ms, Total Time: " + _pageProfiler.getCapture("total") + "ms", ["PROFILE", _currentPage]);

                _pageProfiler.setName(_currentPage);
                Mojo.publishEvent(Mojo.constants.events.kPageFinalized, {"pageAlias" : _currentPage, "pageProfile" : _pageProfiler});
                Mojo.publishEvent(Mojo.constants.events.kProfile, _pageProfiler);

                _customerTimeProfiler.reset();
                _customerTimeProfiler.setName(_currentPage);
                _customerTimeProfiler.mark("timeOnPage");


            });
        }

    }

// Do any necessary page initialization before the page has loaded into the window scope
//------------------------------------------------------
    function _onBeforePageLoad(pgAlias) {

        // publish an event
        Mojo.publishEvent(Mojo.constants.events.kBeforePageLoad, {"pageAlias" : pgAlias});

        // Create a default VIEW_SCOPE
        window[Mojo.constants.scopes.kViewScope] = {};

        // Add the VIEW_SCOPE model
        Mojo.addModel({"modelName" : Mojo.constants.scopes.kViewScope});

    }

// Do any necessary page initialization
// After the page has loaded into the window scope
//------------------------------------------------------
    function _beginPage() {

        // if the newly loaded page has an onStart() function, call it in the view name space
        if (window[Mojo.constants.scopes.kViewScope]) {
            if (typeof window[Mojo.constants.scopes.kViewScope]["onStart"] === "function") {
                try {
                    TRACE("Calling onStart for page: " + _currentPage);
                    window[Mojo.constants.scopes.kViewScope]["onStart"]();
                }
                catch (ex) {
                    Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Page: '" + _currentPage + "' threw an exception onStart", LOG_WARNING));
                }
            }
        }
        if (!_viewPort)
            _handleException(new MojoException("Mojo.application.applicationController", "start: No view port specifed", LOG_ERROR));
        else {
            if (!window[Mojo.constants.scopes.kViewScope]) {
                window[Mojo.constants.scopes.kViewScope] = {};
            }
            window[Mojo.constants.scopes.kViewScope].__mojoViewPort = _viewPort;
        }

        // Let anyone that cares that the page is loaded
        Mojo.publishEvent(Mojo.constants.events.kPageLoaded, {"pageAlias" : _currentPage});

    }

// Do any necessary cleanup before leaving the current View
//----------------------------------------------------------
    function _endPage() {

        // Capture time spent on page
        _customerTimeProfiler.captureTimeFromMark("customerTime", "timeOnPage");
        TRACE("Customer time on page: " + _customerTimeProfiler.getCapture('customerTime') + "ms", ["PROFILE", _currentPage]);
        Mojo.publishEvent(Mojo.constants.events.kProfile, _customerTimeProfiler);

        // Let everyone know that we're ending the current page
        Mojo.publishEvent(Mojo.constants.events.kBeforePageUnload, {"pageAlias" : _currentPage, "customerProfile" : _customerTimeProfiler});

        _pageProfiler.reset();


        // in case any input still has focus trigger a blur event, which will cause a model update before transitioning
        jQuery('input:focus').trigger('blur');
        jQuery('html, body').animate({ scrollTop : 0 }, 200);

        //Clear any straggling errors from a previous page
        Mojo.inputStrategies.validator.engine.hideErrorTooltips();

        // If there is an onEnd specified in the VIEW_SCOPE, call it
        if (window[Mojo.constants.scopes.kViewScope] && typeof window[Mojo.constants.scopes.kViewScope]["onEnd"] === "function") {
            try {
                TRACE("Calling onEnd for page: " + _currentPage);
                window[Mojo.constants.scopes.kViewScope]["onEnd"]();
            }
            catch (ex) {
                Mojo.publishEvent(Mojo.constants.events.kException, new MojoException("Page: '" + _currentPage + "' threw an exception onEnd", LOG_WARNING));
            }
        }

        // Now unsubscribe all VIEW_SCOPE subscriptions
        Mojo.unSubscribe(window[Mojo.constants.scopes.kViewScope]);

        // Now remove the VIEW_SCOPE model for the page
        Mojo.removeModel(Mojo.constants.scopes.kViewScope);

        // Get the viewport that the view is bound to and unbind everything
        var _curVwPt = window[Mojo.constants.scopes.kViewScope] ? window[Mojo.constants.scopes.kViewScope].__mojoViewPort : null;
        if (_curVwPt)
            Mojo.unbind(_curVwPt); // Clean up the current view port, not the target view port

        // nullify the onEnd function in the global scope
        // cannot use delete, because delete can only be used on var and functions that are assigned rather
        // than defined through declaration
        window[Mojo.constants.scopes.kViewScope] = null;

    }

    // Function: _handleException
    function _handleException(ex) {
        _navigating = false;
        var mex;
        if (ex instanceof MojoException)
            mex = ex;
        else
            mex = new MojoException("UNKNOWN EXCEPTION", ex.type + " " + ex.message, LOG_ERROR, ex);

        Mojo.publishEvent(Mojo.constants.events.kException, mex);

    }


    return _instance;
})();
// class: Options
/**
 * @author Miller, Greg
 */
Mojo.application.options = {
    appId:null, // Id of the applicatoin (used for localstorage and logging)
    viewPortId:null, // Id of the DOM element that will

    ABTestConfig:{
    },

    viewResolverOptions:{
        pathToViews:"",
        aliasMap:{}
    },
    // Function: flowResolverOptions
    flowResolverOptions:{
        pathToFlows:"",
        aliasMap:{}
    },
    // Function: actionOptions
    actionOptions:{
        pathToActions:""
    },

    modelDefConfig:{
        pathToModelDefs:"",
        nameToDefMap:{}
    },

    tooltipOptions:{
        position: 'top',    // position of tooltip relative to input.  supported values: 'top', 'bottom', 'right'
        hideOnFocus: false, // hide the tooltip when input field gets focus
        showOnlyOne: false  // show only one error tooltip
    },

    defaultDAO:null, // Default DAO to associate models that are created in flow defintions
    defaultModelClass:"Mojo.model.dataModel", // default model class to use to create models defined in flow definitions
    useValidator:true, // use the validation functionality of Mojo
    useFormatter:true, // use the autoformatting functionality of Mojo
    validateOnBack:false, // No validation if the customer hits back
    validateOnJump:false, // No validation if the customer jumps in navigation
    enableTraceConsole:true, // Set up the debugging console
    showMojoExceptions : false, //show alert messages for execptions thrown in Mojo.  For non-prod only I

    // Function: setOption
    // Parameters: 
    // - optionName
    // - value
    // Set an option value
    setOption:function (optionName, value) {
        if ("undefined" != typeof this[optionName])
            this[optionName] = value;
        else
            TRACE("Invalid Option: " + optionName + " - ignoring", ["OPTIONS"], Mojo.utils.trace.WARN);
    },

    // Function: validate
    // Make sure all mandatory options are set
    // And options are set correctly
    validate:function () {
        if (!this.appId) this._throwError("Missing App Id");
    },

    // Function: _throwError
    // Parameters: msg
    _throwError:function (msg) {
        throw new MojoException("Mojo.Options", msg, LOG_ERROR);
    }
}
Mojo.exportSymbol('MojoOptions', Mojo.application.options);
// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;
g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,
c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,
a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=
function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&
(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};
j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,
0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,
e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=
i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=
1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=
i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=
g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));
return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&
c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=
function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};
b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,
b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=
function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||
u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};
b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,
this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);
