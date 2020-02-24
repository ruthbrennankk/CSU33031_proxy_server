//WebSocket Server (WSS) class
/*
    What is a WebSocket?
    A WebSocket is a persistent connection between a client and server. 
    WebSockets provide a bidirectional, full-duplex communications channel that operates over HTTP through a single TCP/IP 
    socket connection. 
    At its core, the WebSocket protocol facilitates message passing between a client and server
*/

const http = require("http");
const https = require('https');
const url = require('url');
const SimpleHashTable = require('simple-hashtable');

// Handle WebSocket responses
function handleWebSocketResponse(url, res, ws, blockedurls) {

    // Check if URL is blocked
    if(blockedurls.containsKey(url)){
        console.log("URL " + url + " is blocked.");
        ws.send("URL " + url + " is blocked.");
        return;
    }

    // Status code from the get response
    const { statusCode } = res;

    var error;

    //Check status code 200 means that all is OK otherwise handle response error
    if ( statusCode !== 200 ) {
        error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        console.error(error.message);
        ws.send(error.message);
        return;
    }

    res.setEncoding('utf8');
    var rawData = '';

    //At the stage when data is recieved
    res.on('data', (chunk) => { 
        rawData += chunk;
    });

    //At the stage when connection is closed
    res.on('error', () => {
        console.log("Recieved Error");
    });

    //At the stage when connection is closed
    res.on('end', () => {
        ws.send(rawData);
    });
}

module.exports = {

    // Handle WebSocket requests
    handleWebSocketRequest: function(URL, ws, blockedurls) {
        var split = url.parse(URL, true);

        // Handle http and https request seperately
        console.log('\nReceived request for: ' + split.protocol + '//'+ split.hostname);
        if( split.protocol == 'http:' ) {
            
            http.get(split.href, (response) => handleWebSocketResponse(split.hostname, response, ws, blockedurls))
            .on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            });
    
        } else if (split.protocol == 'https:') {
    
            https.get(split.href, (response) => handleWebSocketResponse(split.hostname, response, ws, blockedurls))
            .on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            });
            
        } else {
            ws.send('Invalid request');
        }
    }  
}