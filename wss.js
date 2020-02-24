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
function handleWebSocketResponse(url, res, ws, blockedurls,serverCache) {

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

    var hit = false;
    // Check cache for web page and verify expires
    try {
        cacheRes = serverCache.get(url) 
        if (cacheRes == undefined) {
            console.log("URL not in Cache");
        } else {
            ws.send(cacheRes.body);
            console.log("Valid Cache");
            hit = true;
        }
    } catch {
        console.log("request cache get error");
    }

    if (!hit) {
        //encoding
        res.setEncoding('utf8');
        var rawData = '';

        //At the stage when data is recieved
        res.on('data', (chunk) => {
            rawData += chunk;
        });
    
        //At the end of the response
        res.on('end', () => {

            //Make cache object to store in cache
            cacheObject = {
                body: rawData
            }

            //store cache object in the cache
            serverCache.set(url, cacheObject, (err, success) => {
                if (!err && success) {
                    console.log("URL added to cache");
                } else {
                    console.log("URL not added to cache");
                }
            });

            ws.send(rawData);
            console.log("success");
        });
    }
}




module.exports = {

    // Handle WebSocket requests
    handleWebSocketRequest: function(URL, ws, blockedurls, serverCache) {
        var split = url.parse(URL, true);

        // Handle http and https request seperately
        console.log('\nReceived request for: ' + split.protocol + '//'+ split.hostname);
        if( split.protocol == 'http:' ) {
            
            http.get(split.href, (response) => handleWebSocketResponse(split.hostname, response, ws, blockedurls, serverCache))
            .on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            })
            .on('timeout', () => {
                console.log('Request timeout');
                res.end();
                request.abort();
            });
        } else if (split.protocol == 'https:') {
    
            https.get(split.href, (response) => handleWebSocketResponse(split.hostname, response, ws, blockedurls, serverCache))
            .on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            })
            .on('timeout', () => {
                console.log('Request timeout');
                res.end();
                request.abort();
            });
            
        } else {
            ws.send('Invalid request');
        }
    }  
}