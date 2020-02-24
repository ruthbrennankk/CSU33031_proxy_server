//Server class

//Load HTTP module
const http = require("http");
const https = require('https');
const url = require('url');
const SimpleHashTable = require('simple-hashtable');
var cache = require( "node-cache" );

//Handle Server Response
function handleResponse(url, handle_res, res, blockedurls,serverCache){

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
 
    //Check status code 200 means that all is OK otherwise handle response error
    if ( statusCode !== 200 ) {
      error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
      console.error(error.message);
      res.write(error.message);
      res.end();
      return;
    }

    var hit = false;
    // Check cache for web page and verify expires
    try {
    cacheRes = serverCache.get(url) 
        if (cacheRes == undefined) {
            console.log("URL not in Cache");
        } else {
            res.write(cacheRes.body);
            res.end();
            console.log("Valid Cache");
            hit = true;
        }
    } catch {
        console.log("request cache get error");
    }

    if (!hit) {
        //encoding
        handle_res.setEncoding('utf8');
        var rawData = '';

        //At the stage when data is recieved
        handle_res.on('data', (chunk) => {
            rawData += chunk;
        });
    
        //At the end of the response
        handle_res.on('end', () => {

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

            res.write(rawData);
            res.end();
        });
    }
   
}


module.exports = {
    onRequest: function(req, res, blockedurls,serverCache) {
        
            var split = url.parse(req.url.substring(1), false);
            if (split.protocol!=null) {
                //res.write(split.protocol);  //  https:
                //res.write(split.path);      //  /
                //res.write(split.hostname);  //  www.tcd.ie
                //res.write(split.href);    //  https://www.tcd.ie/
                //res.end(); //end the response
            
                // Handle http and https request seperately
                console.log('\nReceived request for: ' + split.protocol + '//'+ split.hostname);
                if( split.protocol == 'http:' ) {
    
                    http.get(split.href, (response) => handleResponse(split.hostname, response, res, blockedurls,serverCache))
                    .on('error', (e) => {
                        console.error(`Got error: ${e.message}`);
                    })
                    .on('timeout', () => {
                        console.log('Request timeout');
                        res.end();
                        request.abort();
                    });
            
                } else if (split.protocol == 'https:') {
    
                    https.get(split.href, (response) => handleResponse(split.hostname,response, res,blockedurls,serverCache))
                    .on('error', (e) => {
                        console.error(`error: ${e.message}`);
                    })
                    .on('timeout', () => {
                        console.log('Request timeout');
                        res.end();
                        request.abort();
                    });
                    
                } else {
            
                    res.write('Invalid request');
                    res.end();
            
                }
        }  
        
    } 
}

