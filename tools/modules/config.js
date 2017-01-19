/**
 * Usage :
 *      Configure your application specific settings here to tell the script how to find your application.
 *
 *      basePath : from this config file, the path to the root of the application
 *      configFilePath : from the root of your application (basepath), the path to find your Mojo Configuration file that specifies at least
 *          viewResolverOptions
 *          flowResolverOptions
 *      pages : String or Array of pages that you want to validate the data-loadPage, data-loadFlow, and data-viewport-options
 *      flows : String or Array of flow names that you want to validate.
 */
module.exports = {
    basePath : './target/release/app/',
    configFilePath : 'scripts/config/mojo_config.js',
    pages : "appView.html",
    flows : ["mainFlow"],
    flowGraph : {
        flowName : "mainFlow",
        outputDir : "./flowgraph"
    }
};