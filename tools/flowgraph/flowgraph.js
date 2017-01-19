/**
 * flowgraph.js
 * @author: Larry Buzi
 */
$(document).ready(function () {

    /*
     nodes and links are defined in flowgraphdata.js.  the following is the format of their elements:

     fg.nodes[key] = {
         key:key,
         name: flowRef + " : " + stateName,
         flowRef: flowRef,
         stateName: stateName,
         isVisited: isVisited,
         type: state["state_type"]   // FLOW_GROUP, FLOW, VIEW, ACTION, END
     }

     fg.links[linkKey] = {
         type:"inter",  // "intra", "group"
         source:nodeKey,
         target:otherKey
     }
     */
    "use strict";

    var svgWidth = 2400;
    var svgHeight = 2400;
    var svg = d3.select("svg");
    var svgFlowLinkGroup = svg.append("svg:g");
    var svgCircleGroup = svg.append("svg:g");
    var svgFlowLabelGroup = svg.append("svg:g");
    var svgStateLinkGroup = svg.append("svg:g");
    var svgStateLabelGroup = svg.append("svg:g");
    var dist = 300;
    var charge = -3300;
    var gravity = 0.1;
    var linksArray = [];
    var nodesArray = [];
    var flowNodes = {};
    var flowLinks = {};
    var stateLinks = {};

    var tickCount = 0;

    var formatFlowName = function (flowRef) {
        var appendTspan = function (parent, str) {
            var newText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            newText.setAttributeNS(null, "dx", 0);
            newText.setAttributeNS(null, "dy", 15);
            var textNode = document.createTextNode(str);
            newText.appendChild(textNode);
            parent.appendChild(newText);
            // figure out the width in order to center horizontally.
            // unfortunately getBBox() doesn't work with tspan, and getBoundingClientRect() returns 0 on chrome
            var width = $(newText).width() || newText.getBoundingClientRect().width;
            newText.setAttributeNS(null, "x", -width / 2);
            parent.setAttributeNS(null, "y", -parent.getBBox().height / 2);
        };
        var cleaned = (/^fnf\.(.*)/.exec(flowRef) || [flowRef, flowRef])[1];  // strip off the starting "fnf."
        var matches = /(.*)Def$/.exec(cleaned);  // strip off the ending "Def"
        if (matches) {
            cleaned = matches[1]
        }
        var parts = cleaned.split('.');
        for (var i = 0; i < parts.length; i++) {
            appendTspan(this, parts[i]);
        }
    };

    var throwError = function (msg) {
        throw new Error(msg);
    };

    var initializeFlowNodes = function () {
        var firstFlow = true;
        var numNodes = d3.values(fg.nodes).length;
        var initNumPerSide = Math.round(Math.sqrt(numNodes));

        var index = nodesArray.length;
        _.each(fg.nodes, function (node, nodeKey) {
            if ((node.type === "FLOW_GROUP") && !flowNodes[nodeKey]) {
                node.index = index;
                index += 1;
                if (firstFlow) {
                    node.first = true;
                    node.fixed = true;
                    node.x = svgWidth / 2;
                    node.y = svgHeight / 2;
                    firstFlow = false;
                }
                else if (node.x != undefined && node.y != undefined) {
                    node.fixed = true;
                }
                else {
                    node.x = svgWidth / 2 + 50 + 20 * (index % initNumPerSide);
                    node.y = svgHeight / 2 + 50 + 20 * Math.floor(index / initNumPerSide);
                }
                flowNodes[nodeKey] = node;
                flowNodes[nodeKey]["states"] = [];
                nodesArray.push(node);
            }
        }, this);
    };

    var initializeFlowLinks = function () {
        _.each(fg.links, function (link, linkKey) {
            if (typeof link.source === "string") {
                link.source = fg.nodes[link.source] || throwError("node not found:" + link.source);
                link.target = fg.nodes[link.target] || throwError("node not found:" + link.target);
            }
            if (link.source.flowRef !== link.target.flowRef) {
                var flowLinkKey = link.source.name + "::" + link.target.name;
                if (!flowLinks[flowLinkKey]) {
                    //console.log(link.source.flowRef + " -> " + link.target.flowRef);
                    var flowLink = {};
                    flowLink.source = fg.nodes[link.source.flowRef] || throwError("flow node not found:" + link.source.flowRef);
                    flowLink.target = fg.nodes[link.target.flowRef] || throwError("flow node not found:" + link.target.flowRef);
                    flowLinks[flowLinkKey] = flowLink;
                    linksArray.push(flowLink);
                }
            }
        }, this);
    };

    var initializeStateNodes = function () {
        // first pass: build array of states in each flowNode
        _.each(fg.nodes, function (node, nodeKey) {
            if (node.type !== "FLOW_GROUP") {
                var flowRef = node.flowRef;
                flowNodes[flowRef]["states"].push(node);
            }
        }, this);
        var index = nodesArray.length;
        for (var flowKey in flowNodes) {
            var statesInFlow = flowNodes[flowKey]["states"];
            for (var i = 0; i < statesInFlow.length; i++) {
                var currNode = statesInFlow[i];
                currNode.fixed = true;
                currNode.index = index;
                index += 1;
                nodesArray.push(currNode);
            }
        }
    };

    var positionStateNodes = function () {
        for (var flowKey in flowNodes) {
            var statesInFlow = flowNodes[flowKey]["states"];
            var angle = 0;
            var angleStep = 2 * Math.PI / statesInFlow.length;
            for (var i = 0; i < statesInFlow.length; i++) {
                var currNode = statesInFlow[i];
                currNode.x = flowNodes[flowKey].x + 70 * Math.cos(angle);
                currNode.y = flowNodes[flowKey].y + 70 * Math.sin(angle);
                angle += angleStep;
            }
        }
    };

    var initializeStateLinks = function () {
        _.each(fg.links, function (link, linkKey) {
            if (typeof link.source === "string") {
                link.source = fg.nodes[link.source] || throwError("node not found:" + link.source);
                link.target = fg.nodes[link.target] || throwError("node not found:" + link.target);
            }
            if (link.type !== "group") {
                var stateLinkKey = link.source.name + "::" + link.target.name;
                if (!stateLinks[stateLinkKey]) {
                    console.log(link.source.name + " -> " + link.target.name);
                    var stateLink = {};
                    stateLink.source = fg.nodes[link.source.key] || throwError("node not found:" + link.source.key);
                    stateLink.target = fg.nodes[link.target.key] || throwError("node not found:" + link.target.key);
                    stateLinks[stateLinkKey] = stateLink;
                    linksArray.push(stateLink);
                }
            }
        }, this);
    };

    var pushApart = function (nodes, minDist) {
        var collisions = 0;
        for (var n1 = 0; n1 < nodes.length; n1++) {
            for (var n2 = 0; n2 < nodes.length; n2++) {
                if (n1 === n2) continue;
                var node1 = nodes[n1];
                var node2 = nodes[n2];
                var x1 = node1.x,
                    x2 = node2.x,
                    y1 = node1.y,
                    y2 = node2.y;
                var dist = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
                dist = Math.max(dist, 1);  // protect against divide by zero
                if (dist < minDist) {
                    collisions += 1;
                    var ratio = minDist / dist;
                    var sqratio = Math.sqrt(ratio);
                    var ndx = (x2 - x1) * sqratio;
                    var ndy = (y2 - y1) * sqratio;
                    node1.x = x2 - ndx;
                    node1.y = y2 - ndy;
                    node2.x = x1 + ndx;
                    node2.y = y1 + ndy;
                }
            }
        }
        return collisions;
    };

    var initViewport = function () {
        var svg = d3.select("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        var scrollX = 0, scrollY = 0;
        if (svgWidth > self.innerWidth) {
            scrollX = (svgWidth - self.innerWidth) / 2;
        }
        if (svgHeight > self.innerHeight) {
            scrollY = (svgHeight - self.innerHeight) / 2;
        }

        window.scroll(scrollX, scrollY);
    };

    var forceTickHandler = function () {
        tickCount += 1;
        var collisions = pushApart(d3.values(flowNodes), 190);
        positionStateNodes();
        svgFlowLinkGroup.selectAll("line").attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
        svgStateLinkGroup.selectAll('path').attr("d", function (d) {
            var dx = d.target.x - d.source.x;
            var dy = d.target.y - d.source.y;
            var r = Math.sqrt(dx * dx + dy * dy);
            // elliptical arc syntax: M x0 y0 A x-radius y-radius x-axis-rotation large-arc-flag sweep-flag x1 y1
            return "M " + d.source.x + " " + d.source.y + " A " + r + " " + r + " 0 0 1 " + d.target.x + " " + d.target.y;
        });
        svgCircleGroup.selectAll('circle').attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        svgFlowLabelGroup.selectAll('g').attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        svgStateLabelGroup.selectAll('g').attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    };

    var addStateLinks = function () {
        svgStateLinkGroup.selectAll("path")
            .data(linksArray.filter(function (d) {
                var ok = (d.source.type !== "FLOW_GROUP") && (d.target.type !== "FLOW_GROUP");
                return ok;
            }))
            .enter().append("svg:path")
            .attr("class", function (d) {
                return "link " + d.type;
            })
            .attr("marker-end", function (d, i) {
                return d.type === "group" ? "" : "url(#arrowhead)"
            })
            .attr("display", "none");
    };

    var addFlowLinks = function () {
        svgFlowLinkGroup.selectAll("line")
            .data(forcePositioner.links().filter(function (d) {
            return d.source.type === "FLOW_GROUP" && d.target.type === "FLOW_GROUP";
        }))
            .enter().append("svg:line");
    };

    var showStateLinksAndEndpointLabels = function(nodeData) {
        svgStateLinkGroup.selectAll('path').attr("display", function (linkData) {
            if(linkData.source.name === nodeData.name || linkData.target.name === nodeData.name) {
                //d3.select("#label_" + (linkData.source.index)).attr("display", "block");
                //d3.select("#label_" + (linkData.target.index)).attr("display", "block");
                return "block";
            }
            else {
                return "none";
            }
        });
    };

    var hideStateLinksAndLabels = function() {
        svgStateLinkGroup.selectAll('path').attr("display", "none");
        svgStateLabelGroup.selectAll('text').attr("display", "none");
    };

    var addCircles = function () {
        var mouseoverHandler = function (d, i) {
            if (d.type !== "FLOW_GROUP") {
                showStateLinksAndEndpointLabels(d);
                d3.select("#label_" + (d.index)).attr("display", "block");
            }
        };
        var mouseoutHandler = function (d, i) {
            if (d.type !== "FLOW_GROUP") {
                hideStateLinksAndLabels();
                //d3.select("#label_" + (d.index)).attr("display", "none");
            }
        };
        svgCircleGroup.selectAll("circle")
            .data(nodesArray)
            .enter().append("svg:circle")
            .attr("class", function (d) {
                return "circle " + ((d.first) ? "FIRST" : d.type);
            })
            .attr("r", function (d, i) {
                if (d.type == "ACTION") return 4;
                if (d.type == "FLOW_GROUP") return 60;
                return 5;
            })
            .attr("display", function(d) {
                return (d.type == "FLOW_GROUP") ? "block" : "none";  // start by showing only the flows
            })
            .on("mouseover", mouseoverHandler)
            .on("mouseout", mouseoutHandler)
            .call(forcePositioner.drag);
    };

    var addFlowLabels = function () {
        var flowLabels = svgFlowLabelGroup.selectAll("g")
                .data(forcePositioner.nodes().filter(function (d) {
                return d.type === "FLOW_GROUP";
            }))
            .enter().append("svg:g");

        flowLabels.append("svg:text")
            .attr("id", function (d, i) {
                return "label_" + d.index;
            })
            .attr("stroke", "#44a");

        flowLabels.selectAll("text").each(function (d) {
            formatFlowName.call(this, d.flowRef);
        });
        return flowLabels;
    };

    var addStateLabels = function () {
        var stateText = svgStateLabelGroup.selectAll("g")
            .data(forcePositioner.nodes().filter(function (d) {
            return d.type !== "FLOW_GROUP";
        }))
            .enter().append("svg:g");

        stateText.append("svg:text")
            .attr("id", function (d, i) {
                return "label_" + d.index;
            })
            .text(function (d) {
                return d.stateName;
            })
            .attr("x", function (d) {
                return -this.getBBox().width / 2;
            })
            .attr("y", -10)
            .attr("stroke", "#444")
            .attr("display", "none");
    };

    var keyHandler = function(ev) {
        if(ev.which === "F".charCodeAt(0)) {
            svgCircleGroup.selectAll("circle").filter(function(d) {
                return d.type !== "FLOW_GROUP";
            })
            .attr("display", "none");
        }
        else if(ev.which === "S".charCodeAt(0)) {
            svgCircleGroup.selectAll("circle").attr("display", "block");
        }
    };

    var initLayout = function () {
        var t0 = (new Date()).getTime();
        forcePositioner.start();
        for (var i = 0; i < 300; i++) {
            forcePositioner.tick();
        }
        forceTickHandler();
        forcePositioner.stop();
        var now = (new Date()).getTime();
        console.log("dt =", (now - t0));

        // fix the position of the flows after initial layout (they can still be dragged though)
        _.each(fg.nodes, function (node) {
            if (node.type === "FLOW_GROUP") {
                node.fixed = true;
            }
        }, this);
    };

    initViewport();
    // add only the flow nodes to begin with
    initializeFlowNodes();

    initializeFlowLinks();

    // first only add flows and their links
    var forcePositioner = d3.layout.force()
        .nodes(nodesArray)
        .links(linksArray)
        .size([svgWidth, svgHeight])
        .gravity(gravity)
        .linkDistance(dist)
        .charge(charge);
    //.on("tick", forceTickHandler);  // for speed, add this handler after initLayout()

    initLayout();  // position the flow nodes by running enough iterations

    addFlowLinks();
    addFlowLabels();

    // add the nodes that are not flows
    initializeStateNodes();
    positionStateNodes();

    addCircles();  // adds svg circles for all the nodes (states)

    initializeStateLinks();
    addStateLinks();

    addStateLabels();

    forceTickHandler();
    //forcePositioner.start();

    forcePositioner
        .on("tick", forceTickHandler);

    $(document).on("keydown", keyHandler);
});
