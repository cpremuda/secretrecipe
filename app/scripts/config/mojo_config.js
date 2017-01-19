Mojo.setOptions({
    enableTraceConsole : false,
    alertOnExceptions : false,

    viewportOptions : {
        default : {
            setFocusInputTypes : ["input", "select", "textarea"], // list of valid input types to automatically set focus on
            scrollOptions : {
                isAnimated : true,
                animationDuration : 200
            },
            validationOptions : {
                showOnlyOne : true,
                useValidator : true,
                tooltipPosition : 'top'
            },
            viewportHistory : {
                enableTracking : true, // Tell all viewports to manage their history
                autoBackNavigationEvent : '_back',  // KEY navigation value used in data-nav that will trigger a "back" using the history to figure out where to go
                historySize : null // maximum number of views (or flow nodes) that will be tracked in the history, null for unlimited
            }
        }
    },

    viewResolverOptions : {

        pathToViews : {
            "default" : "views"
        },
        aliasMap : {
            "*" : ".html"
        }

    },

    flowResolverOptions : {

        pathToFlows : {
            "default" : "flows"
        },
        aliasMap : {
            "*" : ".json"
        }

    },

    ABTestConfig : {
        "mainRoot" : "/",
        "testRoot" : "/abtests",
        "tests" : {
            "minihub" : {
                "bigbutton" : {
                    "views" : [
                        "benefitLanding_hub"
                    ]
                }
            }
        }
    }
});

