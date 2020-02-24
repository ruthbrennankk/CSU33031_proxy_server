/*
    What is a proxy server?
    Proxies act as intermediaries between clients and servers, they can preform processing or just forward requests upstream.
*/
/*
    What is a HTTP request?
    HTTP works as a request-response protocol between a client and server
*/
/*
    HTTP vs HTTPS?
    HTTPS is HTTP with encryption. The only difference between the two protocols is that HTTPS uses TLS (SSL) to 
    encrypt normal HTTP requests and responses. 
    As a result, HTTPS is far more secure than HTTP.
*/


//Load HTTP module
const http = require("http");
const https = require('https');
const hostname = 'localhost';
const port = 8000;
const SimpleHashTable = require('simple-hashtable');
const stdin = process.openStdin();
var cache = require( "node-cache" );

const handle_wss = require('./wss.js');
const handle_server = require('./server.js');

//ws is a popular WebSockets library for Node. js. We'll use it to build a WebSockets server. 
//It can also be used to implement a client, and use WebSockets to communicate between two backend services.
var ws = require('ws');


//CACHE 
//stdTTL: (default: 0) the standard ttl as number in seconds for every generated cache element. 0 = unlimited
//checkperiod: (default: 600) The period in seconds, as a number, used for the automatic delete check interval. 0 = no periodic check.
var serverCache = new cache({ stdTTL: 600, deleteOnExpire: true });


//Create a hastable to store blocked URLs for ease of searching
var blockedurls = new SimpleHashTable();
// To have a site blocked at the beginning
blockedurls.put('www.google.com', 'blocked');

//SERVER STUFF

//create a server object:
var server = http.createServer(onRequest).listen(port,() => {
    console.log(`Server running at http://${hostname}:${port}/`);
  }); //the server object listens on port

function onRequest(req,res) {
    handle_server.onRequest(req,res,blockedurls,serverCache);
}

//WEBSOCKET STUFF

// WebSocket server
var wss = new ws.Server({ server });

// Handle connections to WebSocket server
wss.on('connection', function connection(ws) {

  console.log("Received websocket connection...");

  ws.on('message', function incoming(message) {
    console.log('Received WebSocket request for: %s', message);
    handle_wss.handleWebSocketRequest(message, ws, blockedurls, serverCache);
  });

});

//MANAGEMENT CONSOLE STUFF

// Listens to the console
//If block followed by url is entered -> Will block URL here
//If unlock followd by URL is entered -> will unblock URL here
//Also handles error cases such as incorrect command (not block/unblock) and deals with unblocking non blocked URLs
stdin.addListener("data", (data) => {

    //Get command {block, unblock}
    var input = data.toString();
    var command = input.substring(0, input.indexOf(' '));

    if ( command == "block" ) {
        var url = data.toString().substring(6).trim();
        blockedurls.put(url);
        console.log("URL: " + url + " has been sucssfully blocked");

    } else if ( command == "unblock" ) {
        var url = data.toString().substring(8).trim();

        if( blockedurls.containsKey(url) ){
          blockedurls.remove(url);
          console.log("URL: " + url + " has been sucssfully unblocked")
        } else {
          console.log("URL: " + url + " is not blocked");
        }
    } else {
        console.log("Unknown command");
    }
    
});
