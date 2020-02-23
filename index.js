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
/*
    What is a WebSocket?
    A WebSocket is a persistent connection between a client and server. 
    WebSockets provide a bidirectional, full-duplex communications channel that operates over HTTP through a single TCP/IP 
    socket connection. 
    At its core, the WebSocket protocol facilitates message passing between a client and server
*/

//Load HTTP module
const http = require("http");
const https = require('https');
const hostname = 'localhost';
const port = 8000;
const url = require('url');
const SimpleHashTable = require('simple-hashtable');
var stdin = process.openStdin();
//ws is a popular WebSockets library for Node. js. We'll use it to build a WebSockets server. 
//It can also be used to implement a client, and use WebSockets to communicate between two backend services.
var ws = require('ws');

//Create a hastable to store blocked URLs for ease of searching
var blockedurls = new SimpleHashTable();
// To have a site blocked at the beginning
blockedurls.put('www.tcd.ie', 'blocked');

//create a server object:
http.createServer(onRequest).listen(port,() => {
    console.log(`Server running at http://${hostname}:${port}/`);
  }); //the server object listens on port


//function to handle requests
function onRequest(req, res) {

    //Read the Query String
    //res.write(req.url);
    //res.write('Hello World!'); //write a response to the client

    var split = url.parse(req.url.substring(1), false);

    //res.write(split.protocol);  //  https:
    //res.write(split.path);      //  /
    //res.write(split.hostname);  //  www.tcd.ie
    //res.write(split.href);    //  https://www.tcd.ie/
    //res.end(); //end the response

    // Handle http and https request seperately
    console.log('\nReceived request for: ' + split.protocol + '//'+ split.hostname);
    if( split.protocol == 'http:' ) {

        /*
        http.get(options[, callback])
        http.get(url[, options][, callback])

        url <string> | <URL>
        options <Object> Accepts the same options as http.request(), with the method always set to GET. Properties that are inherited from the prototype are ignored.
        callback <Function>
        Returns: <http.ClientRequest>
        Since most requests are GET requests without bodies, Node.js provides this convenience method. 
        The only difference between this method and http.request() is that it sets the method to GET and calls req.end() automatically. 
        The callback must take care to consume the response data for reasons stated in http.ClientRequest section.

        The callback is invoked with a single argument that is an instance of http.IncomingMessage.
        */
        
        http.get(split.href, (response) => handleResponse(split.hostname, response, res))
        .on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });

    } else if (split.protocol == 'https:') {

        /*
        https.get(options[, callback])
        https.get(url[, options][, callback])

        url <string> | <URL>
        options <Object> | <string> | <URL> Accepts the same options as https.request(), with the method always set to GET.
        callback <Function>

        options can be an object, a string, or a URL object. 
        If options is a string, it is automatically parsed with new URL(). 
        If it is a URL object, it will be automatically converted to an ordinary options object.
        */
        https.get(split.href, (response) => handleResponse(split.hostname,response, res))
        .on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
        
    } else {

        res.write('Invalid request');
        res.end();

    }

}  

function handleResponse(url, handle_res, res){

    // Check if URL is blocked
    if ( blockedurls.containsKey(url) ) {
        console.log("URL " + url + " is blocked.");
        res.write("URL " + url + " is blocked.");
        res.end();
        return;
    }

    // Status code from the get response
    const { statusCode } = handle_res;
 
    var error;
 
    //Check status code 200 means that all is OK
    if ( statusCode !== 200 ) {
      error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
      console.error(error.message);
      res.write(error.message);
      res.end();
      return;
    }

    handle_res.setEncoding('utf8');
    var rawData = '';

    //At the stage when data is recieved
    handle_res.on('data', (chunk) => {
        rawData += chunk;
        console.log("Received chunk of size " + chunk.length + " characters, " + Buffer.byteLength(chunk, 'utf8') + " bytes");
    });

    //At the end of the response
    handle_res.on('end', () => {
        res.write(rawData);
        res.end();
    });
}


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

/*
    http.get(split.href, (res) => {

        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });

    }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    });
*/
