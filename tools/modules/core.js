/**
 * This is a node.js script that recursively checks all the flows in a Mojo application.
 * It verifies that referenced states, flows, actions, and views exist.
 *
 * Run the script from the OSX terminal.
 * If necessary, first download Node from http://nodejs.org/
 *
 * Sample usage (run this from the FinishAndFile directory):
 * node ../Mojo/libs/tools/flowcheck.js <path to resolver configs>.js <main flow Def name>
 *
 */

var fs = require('fs');
var vm = require('vm');
var path = require('path');
var config = require('./config');

var errorCount = 0;
var warnCount = 0;
var navCount = 0;

// ---------------
// Set up cache
// ---------------
var _flows = {};
var _checkedViews = {};
var _checkedStates = {};


// ---------------------------------------------
// Set up context for Mojo related stuff
// ---------------------------------------------
var configFileContext = {
    Mojo : {
        options : {
            viewportOptions : {
                default : {
                    viewportHistory : {}
                }
            }
        },
        setOptions : function (opts) {
            this.options = opts;
        }
    }

};

// basePath is used to convert an absolute path that might be present in the config file to a relative path
var basePath;  // will get set in init function


var nameSpaceRegex = /^([^\s\r\n\'\"]+)\.([^\s\r\n\'\"]+)$/;

module.exports = {

    checkFlow : function (flowName) {
        errorCount = 0;
        navCount = 0;
        warnCount = 0;
        _init();
        checkFlow (flowName);
        return {
            errorCount : errorCount,
            warnCount : warnCount,
            navCount : navCount
        };
    },

    checkHTMLLinks : function (htmlPage) {
        errorCount = 0;
        navCount = 0;
        warnCount = 0;
        _init();
        var pathToPage = path.resolve(basePath, htmlPage);
        checkInitialHTML (pathToPage);
        return {
            errorCount : errorCount,
            warnCount : warnCount,
            navCount : navCount
        };
    },

    listAllNodes : function () {
        return listAllNodes();
    },

    listAllLinks : function (nodes) {
        return listAllLinks(nodes);
    }
}

// ---------------------------------------------
// Verify that necessary information exists
// ---------------------------------------------

function  _init() {
    basePath = path.resolve(config.basePath);
    var configFileName = path.resolve(config.basePath, config.configFilePath);
    console.log(config.basePath);
    console.log(config.configFilePath);

    //--------------------------------
    // Validate config
    //--------------------------------
    try {
        var MojoConfigData = fs.readFileSync(configFileName, 'utf8');
    }
    catch (ex) {
        console.error("ERROR: Invalid config file (check path):", configFileName);
        process.exit(1);
    }
    try {
        if (!fs.statSync(basePath).isDirectory()) {
            console.error("ERROR: Invalid base directory:", basePath);
            process.exit(1);
        }
    }
    catch (ex) {
        console.error("ERROR: Invalid base directory:", basePath);
        process.exit(1);
    }
    if (!/\/$/.test(basePath)) {
        basePath += "/";  // add the trailing slash if needed
    }

    vm.runInNewContext(MojoConfigData, configFileContext);
    // ---------------------------------------------
    // Initialize our resolvers
    // ---------------------------------------------
    var _myOptions = configFileContext.Mojo.options;
    if (_myOptions.flowResolverOptions) {
        console.log("Found flow resolver config:");
        flowResolver.construct(_myOptions.flowResolverOptions);
    }
    if (_myOptions.viewResolverOptions) {
        console.log("Found view resolver config:");
        viewResolver.construct(_myOptions.viewResolverOptions);
    }


}






/**
 * A slightly modified version of  Mojo.components.flowResolver
 */

flowResolver = {
    kWildCard : "*",

    /**
     * construct the map
     *
     * @param options - the options object that contains the pathToFlows and aliasMap
     */
    construct : function (options) {
        this._pathToFlows = null;
        this._map = null;
        this._loadedDefs = [];

        if (!options) {
            throw new Error("Missing options");
        }

        if (typeof options.pathToFlows === "object") {
            this._pathToFlows = options.pathToFlows;

            // Look for a variable ${foo} in the json object value.
            // If found, resolve the variable by looking for a key with the variable name and substituting it's value
            for (var key in this._pathToFlows) {
                if (this._pathToFlows[key].charAt(0) == "/") {
                    this._pathToFlows[key] = basePath + this._pathToFlows[key].substr(1);
                }
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(this._pathToFlows[key])) != null) {
                    if (this._pathToFlows.hasOwnProperty(matchedObj[1])) {   //Test that the property exists
                        var replaceVal = this._pathToFlows[matchedObj[1]];
                        this._pathToFlows[key] = this._pathToFlows[key].replace(matchedObj[0], replaceVal);
                    }
                    else {
                        throw new Error(matchedObj[0] + " variable cannot be found.");
                    }
                }
                console.log("   " + key + " : " + this._pathToFlows[key]);
            }

            if (!this._pathToFlows["default"]) {
                throw new Error("pathToFlows must contain a 'default' entry.");
            }
        }
        else if (typeof options.pathToFlows === "string") {
            this._pathToFlows = {"default" : options.pathToFlows};
        }
        else {
            throw new Error("pathToFlows is invalid.  Must be an object or string.");
        }

        if (typeof options.aliasMap === "object") {
            this._map = options.aliasMap;
        }
        else {
            throw new Error("aliasMap is invalid.  Must be an object");
        }
    },

    /**
     * Read a flow definition file synchronously, and return the file's contents
     *
     * @param flowRef
     * @param prevFlow
     * @param prevState
     * @return flow definition string, or null
     */
    getFlowByRef : function (flowRef, prevFlow, prevState) {
        var pathAlias = "default",
            alias = flowRef,
            pathToFile = null,
            flow = null;

        // parse the pageRef into pathAlias.fileAlias
        var ns = nameSpaceRegex.exec(flowRef);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }
        else if (flowRef != null) {
            pathAlias = flowRef;
        }

        pathToFile = this._pathToFlows[pathAlias];
        if (!pathToFile) {
            //            console.log("Path alias '" + pathAlias + "' not found, using default path", "Flow Resolver");
            pathToFile = this._pathToFlows["default"];
        }
        if (!pathToFile.match(/\/$/)) {
            pathToFile += "/";
        }

        if (this._map[flowRef]) {
            flow = this._map[flowRef];
            console.log("ALIAS REF: '" + flowRef + "' --> " + flow);
        }
        else if (this._map[this.kWildCard]) {
            flow = alias + this._map[this.kWildCard]; // wild card entry will have the default extension
            //console.log("WILDCARD REF: '" + alias + "' --> " + flow);
        }

        // Now that we have a reference to the definition,
        // Load it out of memory, if its been loaded before.
        // Or off the server, if it hasn't
        if (flow) {
            if (this._loadedDefs[flow]) {
                //                console.log("Loading flow out of memory: '" + flow + "'");
                return this._loadedDefs[flow];
            }
            else {
                console.log("Reading flow file: '" + flowRef + "' --> " + pathToFile + flow);
                try {
                    var _fsPath = path.resolve(basePath, pathToFile, flow);
                    return fs.readFileSync(_fsPath, 'utf8');
                }
                catch (ex) {
                    console.error("ERROR reading flow " + flowRef + ".  Check flow ref name in " + prevFlow + ":" + prevState);
                    errorCount += 1;
                    return null;
                }
            }
        }
        else {
            return null;
        }
    }
};

/**
 * A slightly modified version of  Mojo.components.viewResolver
 */

viewResolver = {
    kWildCard : "*",

    /**
     * construct the map
     *
     * @param options - the options object that contains the pathToViews and aliasMap
     */
    construct : function (options) {
        this._pathToViews = null;
        this._map = null;

        if (!options) {
            throw new Error("Missing options");
        }

        if (typeof options.pathToViews === "object") {
            this._pathToViews = options.pathToViews;

            // Look for a variable ${foo} in the json object value.
            // If found, resolve the variable by looking for a key with the variable name and substituting it's value
            for (var key in this._pathToViews) {
                if (this._pathToViews[key].charAt(0) == "/") {
                    this._pathToViews[key] = basePath + this._pathToViews[key].substr(1);
                }
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(this._pathToViews[key])) != null) {
                    if (this._pathToViews.hasOwnProperty(matchedObj[1])) {   //Test that the property exists
                        var replaceVal = this._pathToViews[matchedObj[1]];
                        this._pathToViews[key] = this._pathToViews[key].replace(matchedObj[0], replaceVal);
                    }
                    else {
                        throw new Error(matchedObj[0] + " variable cannot be found.");
                    }
                }
                console.log("   " + key + " : " + this._pathToViews[key]);
            }

            if (!this._pathToViews["default"]) {
                throw new Error("pathToViews must contain a 'default' entry.");
            }
        }
        else if (typeof options.pathToViews === "string") {
            this._pathToViews = {"default" : options.pathToViews};
        }
        else {
            throw new Error("pathToViews is invalid.  Must be an object or string.");
        }

        if (typeof options.aliasMap === "object") {
            this._map = options.aliasMap;
        }
        else {
            throw new Error("aliasMap is invalid.  Must be an object");
        }
    },

    /**
     * resolve a view reference
     *
     * @param viewRef
     * @return full path to the view file
     */
    _resolveViewRef : function (viewRef) {
        var pathAlias = "default",
            alias = viewRef,
            pathToFile = null,
            page = null;

        // parse the pageRef into pathAlias.fileAlias
        var ns = nameSpaceRegex.exec(viewRef);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }
        else if (viewRef != null) {
            pathAlias = viewRef;
        }

        pathToFile = this._pathToViews[pathAlias];
        if (!pathToFile) {
            //            console.log("Path alias '" + pathAlias + "' not found, using default path", "View Resolver");
            pathToFile = this._pathToViews["default"];
        }
        if (!pathToFile.match(/\/$/)) {
            pathToFile += "/";
        }

        if (this._map[viewRef]) {
            page = this._map[viewRef];
            console.log("ALIAS REF: '" + viewRef + "' --> " + page);
        }
        else if (this._map[this.kWildCard]) {
            page = alias + this._map[this.kWildCard]; // wild card entry will have the default extension
            //console.log("WILDCARD REF: '" + alias + "' --> " + view);
        }
        return page ? (pathToFile + page) : null;
    },

    /**
     * Verify that a view exists
     *
     * @param viewRef
     * @param prevView
     * @param prevState
     * @return true if view found, false otherwise
     */
    checkViewExists : function (viewRef, prevView, prevState) {
        var fullPathToFile = this._resolveViewRef(viewRef);
        if (fullPathToFile) {
            try {
                return fs.statSync(path.resolve(basePath, fullPathToFile)).isFile();
            }
            catch (ex) {
                console.error("ERROR: failed to access ", fullPathToFile);
                return false;
            }
        }
        return false;
    },

    /**
     * Read the contents of a view
     *
     * @param viewRef
     * @return string containing the contents of the view
     */
    readViewContents : function (viewRef) {
        var fullPathToFile = this._resolveViewRef(viewRef);
        if (fullPathToFile) {
            console.log("Reading view file: '" + viewRef + "' --> " + fullPathToFile);

            return fs.readFileSync(path.resolve(basePath, fullPathToFile), 'utf8');
        }
        else {
            return null;
        }
    }
};


function checkInitialHTML (file) {
    var fileContents = fs.readFileSync(file, 'utf8');
    console.log("initial view size: " + fileContents.length);
    var flowLinks = fileContents.match(/data-loadflow\s*=\s*['|"](.*?)['|"]/g);
    if (flowLinks) {
        for (var i = 0; i < flowLinks.length; i++) {
            var flowRef = flowLinks[i].match(/data-loadflow\s*=\s*['|"](.*?)['|"|~]/)[1];
            checkFlow(flowRef);
            //console.log("flow: " + flowRef);
        }
    }

    var pageLinks = fileContents.match(/data-loadpage\s*=\s*['|"](.*?)['|"]/g);
    if (pageLinks) {
        for (i = 0; i < pageLinks.length; i++) {
            var pageRef = pageLinks[i].match(/data-loadpage\s*=\s*['|"](.*?)['|"|~]/)[1];
            checkView(pageRef, "init_page", "");
            //console.log("view: " + pageRef);
        }
    }


    var viewportLinks = fileContents.match(/data-viewport-options\s*=\s*\"(.*?)\"/g);
    if (viewportLinks) {
        for (var i = 0; i < viewportLinks.length; i++) {
            var getSomeRef = viewportLinks[i].match(/data-viewport-options\s*=\s*\"(.*?)\"/)[1];
            var optObj = ( new Function("return " + getSomeRef) )();
            getSomeRef = optObj.getSome || optObj.loadFlow;
            if (getSomeRef) {
                checkFlow(getSomeRef);
            }
            else {
                console.error("ERROR: Main Page: Invalid data-viewport-options. No getSome or loadFlow specified", file);
                errorCount += 1;
            }
        }
    }

}

function checkFlow (flowRef, prevFlow, prevState) {
    if (_flows[flowRef]) {
        return;
    }
    var flowDef = flowResolver.getFlowByRef(flowRef, prevFlow, prevState);
    if (flowDef) {
        try {
            var flow = JSON.parse(flowDef);
        }
        catch (ex) {
            console.error("ERROR: JSON error in flow", flowRef);
            errorCount += 1;
        }
        _flows[flowRef] = flow;
        checkState(flowRef, "startState", flow["startState"]);
    }
}

function checkView (viewRef, flowRef, stateName) {
    if (_checkedViews[viewRef]) {
        return;
    }
    var viewportHistory = configFileContext.Mojo.options.viewportOptions["default"].viewportHistory;

    _checkedViews[viewRef] = 1;
    if (!viewResolver.checkViewExists(viewRef, flowRef, stateName)) {
        console.error("ERROR reading view " + viewRef + ".  Check view ref name in " + flowRef + ":" + stateName);
        errorCount += 1;
    }
    var fileContents = viewResolver.readViewContents(viewRef);
    var navLinks = fileContents.match(/data-nav\s*=\s*['|"](.*?)['|"]/g);
    if (navLinks) {
        var transitions = _flows[flowRef][stateName].transitions;
        if (!transitions) {
            console.error("ERROR: No transitions found for " + flowRef + " : " + stateName + " despite data-nav in view ", viewRef);
            errorCount += 1;
            return;
        }
        for (var i = 0; i < navLinks.length; i++) {
            navCount += 1;

            var navLink = navLinks[i].match(/data-nav\s*=\s*['|"](.*?)['|"]/)[1];
            if (viewportHistory.enableTracking && navLink == viewportHistory.autoBackNavigationEvent) {
                continue;
            }
            if (!transitions[navLink]) {
                if (transitions["*"]) {
                    console.warn("WARNING: Possible missing transition for " + flowRef + " : " + stateName + ". Transitions contain a wildcard '*'", viewRef);
                    warnCount++;
                }
                else if (navLink.match(/[@\$]\{/)) {
                    console.warn("WARNING: expression: '" + navLink + "' found in VIEW: " + viewRef);
                    warnCount++;
                }
                else {
                    console.error("ERROR: data-nav: '" + navLink + "' found in VIEW: " + viewRef + ". But transition not found in FLOW: " + flowRef + ", NODE: " + stateName );
                    errorCount += 1;
                }

            }
        }
    }

}

function checkAction (actionRef, flowRef, stateName) {
    // TODO -- somehow check actions exists???
}

function checkState (flowRef, currentNodeName, transition, toNode) {
    if (_checkedStates[flowRef + " :: " + transition]) {
        return;
    }
    var flow = _flows[flowRef];
    if (!flow) {
        console.error("ERROR: flow could not be loaded:", flowRef);
        return;
    }
    var state = flow[transition];
    if (transition.match(/[@\$]\{/)) {
        console.warn("WARNING: expression: '" + transition + "' found in FLOW: ", flowRef,  ", NODE: " + currentNodeName || "startState", ", TRANSITION: " + toNode);
        warnCount++;
        return;
    }
    else if (!state) {
        console.error("ERROR: transition not found in FLOW: ", flowRef, ", NODE: " + currentNodeName || "startState", ", TRANSITION: " + toNode, ", VALUE: " + transition);
        errorCount += 1;
        return;
    }
    _checkedStates[flowRef + " :: " + transition] = 1;
    //console.log("*   ", flowRef + " :: " + stateName);

    // if type is flow, check flow.  then check transitions
    switch (state["state_type"]) {
        case "FLOW":
            checkFlow(state["ref"], flowRef, transition);
            break;
        case "ACTION":
            if (!state["exp"]) {  // not checking action expressions for now
                checkAction(state["ref"], flowRef, transition);
            }
            break;
        case "VIEW":
            checkView(state["ref"], flowRef, transition);
            break;
        case "END":
            break;
        default:
            console.error("ERROR: invalid state_type", flowRef, transition, transition["state_type"]);
            return;
    }

    for (var toNode in state["transitions"]) {
        checkState(flowRef, transition, state["transitions"][toNode], toNode);
    }

}

//*****************************************************************************

function listAllNodes() {
    var nodes = {};
    for(var flowRef in _flows) {
        console.log("===", flowRef);
        nodes[flowRef] = {
            key: flowRef,
            name : flowRef,
            flowRef: flowRef,
            isVisited: true,
            type: "FLOW_GROUP"
        };
        var flow = _flows[flowRef];
        for(var stateName in flow) {
            if(stateName === "startState" || stateName === "onStart" || stateName === "onEnd") {
                continue;
            }
            var key = flowRef + " :: " + stateName;
            var isVisited = (_checkedStates[key] === 1);
            var state = flow[stateName];
            console.log("    ---", stateName, isVisited ? "***" : "---");
            nodes[key] = {
                key:key,
                name: flowRef + " : " + stateName,
                flowRef: flowRef,
                stateName: stateName,
                isVisited: isVisited,
                type: state["state_type"]
            }
        }
    }

    return nodes;
}

function listAllLinks(nodes) {
    var links = {};
    for(var nodeKey in nodes) {
        var node = nodes[nodeKey];
        if(!node.isVisited) {
            console.log("skipping", node.flowRef, node.stateName);
            continue;
        }
        var flow = _flows[node.flowRef];

        if(node.type === "FLOW_GROUP") {
            // link states to their flow
            for(var stateName in flow) {
                var key = node.flowRef + " :: " + stateName;
                if(nodes[key]) {
                    var linkKey = key + " -> " + nodeKey;
                    links[linkKey] = {
                        type: "group",
                        source: key,
                        target: nodeKey
                    }
                    console.log(linkKey);
                }
            }
        }
        else {
            var state = flow[node.stateName];
            switch(state["state_type"]) {
                case "FLOW":
                    var otherFlowName = state["ref"];
                    var otherFlow = _flows[otherFlowName];
                    if(!otherFlow) {
                        console.error("ERROR: Flow not found:", otherFlowName);
                        process.exit(1);
                    }
                    var otherStateName = otherFlow["startState"];
                    var otherState = otherFlow[otherStateName];
                    if(!otherState) {
                        console.error("ERROR: Invalid state found:", otherFlowName + " : " + otherStateName);
                    }
                    else {
                        var otherKey = otherFlowName + " :: " + otherStateName;
                        if(!nodes[otherKey]) {
                            console.error("ERROR: Node not found when trying to link.", otherKey);
                            process.exit(1);
                        }
                        var linkKey = nodeKey + " ---> " + otherKey;
                        if(!links[linkKey]) {
                            links[linkKey] = {
                                type:"inter",
                                source:nodeKey,
                                target:otherKey
                            };
                            console.log(linkKey);
                        }
                    }
                    // link end states of other flow
                    for(otherStateName in otherFlow) {
                        otherState = otherFlow[otherStateName];
                        if(otherState["state_type"] === "END") {
                            var otherKey = otherFlowName + " :: " + otherStateName;
                            var linkKey = otherKey + " ---> " + nodeKey;
                            if(!links[linkKey]) {
                                links[linkKey] = {
                                    type:"inter",
                                    source:otherKey,
                                    target:nodeKey
                                };
                                console.log("REVERSE:" + linkKey);
                            }
                        }
                    }
                // no break;  add the standard transition links (intentional fall-through)
                case "ACTION":
                case "VIEW":  // TODO: load the view html and search for data-jump links
                    for(var outcome in state["transitions"]) {
                        var toStateName = state["transitions"][outcome];
                        var toState = flow[toStateName];
                        if(!toState) {
                            console.error("ERROR: Invalid state found:", node.flowRef + " : " + toStateName);
                            continue;
                            //process.exit(1);
                        }
                        var otherKey = node.flowRef + " :: " + toStateName;
                        if(!nodes[otherKey]) {
                            console.error("ERROR: Node not found when trying to link.", otherKey);
                            process.exit(1);
                        }
                        var linkKey = nodeKey + " --> " + otherKey;
                        if(!links[linkKey]) {
                            links[linkKey] = {
                                type:"intra",
                                source:nodeKey,
                                target:otherKey
                            };
                            console.log(linkKey);
                        }
                    }
                    break;
                case "END":
                    // no transitions.  outcome should be linked when transition to this Flow was encountered
                    //console.log("End: ", node.flowRef, state['outcome']);
                    break;
            }
        }
    }

    return links;

}



//***************************************************************************************************************************************


