var fs = require('fs');
var path = require('path');
var core = require('./modules/core');
var config = require('./modules/config');


var flow = config.flowGraph.flowName;
var outputDir = config.flowGraph.outputDir;

var results = core.checkFlow(flow);

if (results.errorCount > 0) {
    console.error("Flow check failed with (" + results.errorCount + ") errors! Fix above issues and run the script again.");
 //   process.exit(1);
}

    var nodes = core.listAllNodes();
    var links = core.listAllLinks(nodes);

    var flowgraphdata = "fg = {};\n";
    var datafile = path.resolve(outputDir, "flowgraphdata.js");
    flowgraphdata += "fg.nodes = " + JSON.stringify(nodes) + ";\n";
    flowgraphdata += "fg.links = " + JSON.stringify(links) + ";\n";
    fs.writeFile(datafile, flowgraphdata, function(err) {
        if(err) {
            console.log(err);
        }
        else {
            console.log("\ndata written to " + datafile);
            console.log(Object.keys(nodes).length + " nodes");
            console.log(Object.keys(links).length + " links");
        }
    });