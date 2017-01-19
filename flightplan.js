// flightplan.js
var plan = require('flightplan');

var remotePath = '~/spuriousg/KBB';
//var remotePath = '~/design_code';

plan.target('sg', {
    host : 'ec2-54-200-70-123.us-west-2.compute.amazonaws.com',
    username : 'ec2-user',
    privateKey : '/Users/gmiller/Documents/aws/spuriousg.pem',
    env : 'production'
});
plan.target('kbb', {
    host : 'ec2-54-68-165-192.us-west-2.compute.amazonaws.com',
    username : 'ec2-user',
    privateKey : '/Users/gmiller/Dropbox/KBB/AWS/security/KBB.pem',
    env : 'production'
});


// run commands on localhost
plan.local(function (local) {

    // Zip up client code
    local.log('Zipping up directory');
    local.exec('rm ui.zip', {failsafe : true});
    local.exec('zip -9 -r -q  ui.zip designer site');

    local.log('Copy files to remote hosts');
    local.transfer('ui.zip', remotePath);

    // Delete the zip file
    local.exec('rm ui.zip', {failsafe : true});


});

// run commands on remote hosts (destinations)
plan.remote(function (remote) {
    remote.log('Installing...');

    // Install the server
    //==========================================
    remote.with("cd " + remotePath, function () {

        //save off the node_modules directory so we don't have to re-install everything.

        // delete the server directory and replace with the new server code
        remote.exec("unzip -o -q ui.zip -d client");
        remote.exec("chmod 755 -R client");

        // delete the zipped code and restart node
        remote.log('Deleting ui zip file');
        remote.exec('rm ui.zip', {failsafe : true});


    });
});

