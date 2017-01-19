// flightplan.js
var plan = require('flightplan');
var remotePath = '/home/ec2-user/benefitassist';
var buildPath = 'target/release/app';

//plan.target('production', {
//    host : 'ec2-54-161-223-108.compute-1.amazonaws.com',
//    username : 'gmiller',
//    password : '8Auinklp',
//    agent : process.env.SSH_AUTH_SOCK,
//});

plan.target('sg', {
    // Spurious G
    host : 'ec2-54-200-70-123.us-west-2.compute.amazonaws.com',
    username : 'ec2-user',
    privateKey : '/Users/gmiller/Documents/aws/spuriousg.pem'
});
//plan.target('production', {
//    // Public cloud wildwood
//    host : '52.27.120.196',
//    username : 'ec2-user',
//    privateKey : '/Users/gmiller/Documents/aws/benefitassist-prod.pem'
//});


// run commands on localhost
plan.local(function (local) {
    local.with("cd " + buildPath, function () {
        // Zip up client code
        local.log('Zipping up directory');
        local.exec('rm ui.zip', {failsafe : true});
        local.exec('zip -9 -r -q --exclude=node_modules* --exclude=flightplan.js --exclude=.* ui.zip .');

        local.log('Copy files to remote hosts');
        local.transfer('ui.zip', remotePath);
    });


});

// run commands on remote hosts (destinations)
plan.remote(function (remote) {
    remote.log('Installing...');

    // stopping sendmail service if it is running
//    remote.exec('sudo service sendmail stop');

    // copy the UI


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

