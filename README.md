Front-end Starter Kit
=====================

UI and customer experience for the Your Awesome Application

## Getting Started
* Fork the code
* Run npm install 

## Set up hosts file (to run locally)
* Navigate to your hosts file and add a new entry for your new server.
```
sudo vi /etc/hosts
```
add the following line
```
127.0.0.1    local.< your domain >.com
```
## Set up nginx server
* Install nginx (brew install nginx - if you have Homebrew setup in your local)

### Add the configuration for your application

* create a new file to contain your server block (if the folder "servers" does not exist, you'll have to create it)
```
sudo vi /usr/local/etc/nginx/servers/< your domain>.conf
```
* Add the following server block to the < your server >.conf file you created on the previous step.  The server block below assumes you have an ssl cert and key at that specified location. Comment out the lines if you don't plan on running SSL.  
* Note that any routes containing /app/ will be redirected to the port where node-server runs.

```
server {
     listen 		443 ssl;
     ssl_certificate 	/etc/ssl/certs/myssl.crt;
     ssl_certificate_key /etc/ssl/private/myssl.key;
     keepalive_timeout	70;
     server_name  local.< your domain >.com;

     root /path/to/your/project/target/release/app;
     index index.html;
    
     location ^~ /app/ {
        proxy_pass http://localhost:3000/;
     }
}
```
* Open the nginx conf file to enable the server file you created in the server folder
```
sudo vi /usr/local/etc/nginx/nginx.conf.default
```
* Add or uncomment the following line at the very end of nginx.conf.default
```
include servers/*;
```
* Restart nginx and you should be ready to roll
```
nginx -s reload
```
##Browser Sync
BrowserSync lets you manually test every browser at the same time.  With this grunt task, you can launch connected instances of our appUI, make changes or go through the flow in one browser and watch it progate to all the other connected browsers.
With current capabilities, you can point the grunt task to any of our environments (qal, e2e, etc). You simply need to tweak the BrowserSync grunt options. Note that even if you point our preprod environments, you will need node-server running locally.  Even though the UI will be coming from a server, the call to node-server will be happening locally on your machine.  Therefore, when you are testing environments other than dev, make sure you're local branch for node-server is appropriate for the version of the UI you are testing. The grunt options for browserSync is located in '/grunt/browserSync.js'.  In that file there will be a proxy key/value pair. Verify that the value of that key matches the environment you wish to test.  All of the different environment options for the proxy key are commented out at the bottom of the browserSync.js file.  Once you have verified/tweak the options, just run the 'run-browsers' grunt task, and the page will automatically launch on your default web browser.  To connect other browsers to the job, simply copy the URL and paste in any emulator or browser on your local machine. Because we need the host to be *.intuit.com for IUS reasons, there is no easy way to be able to hit the browserSync running on your local machine from other devices such as iPhone/iPad.  Once you have BrowserSync running, on the console, two URLS wil be displayed, the first URL is the URL used to connect any other browser to your ask, and the second URL is more of less the BrowserSync command center.  There you will be able to see how many and which browsers are connected, and you will even have the option to sync all of the connected browsers if they get out of tune.


