//Server class

//Load HTTP module
const http = require("http");
const https = require('https');
const url = require('url');
const SimpleHashTable = require('simple-hashtable');

//Handle Server Response
function handleResponse(url, handle_res, res, blockedurls){

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


module.exports = {
    onRequest: function(req, res, blockedurls) {
        {

            //Read the Query String
            //res.write(req.url);
            //res.write('Hello World!'); //write a response to the client
        
            var split = url.parse(req.url.substring(1), false);
        
            //res.write(split.protocol);  //  https:
            //res.write(split.path);      //  /
            //res.write(split.hostname);  //  www.tcd.ie
            //res.write(split.href);    //  https://www.tcd.ie/
            //res.end(); //end the response
        
            var proxy_req;
        
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
                
               proxy_req = http.get(split.href, (response) => handleResponse(split.hostname, response, res, blockedurls))
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
                proxy_req = https.get(split.href, (response) => handleResponse(split.hostname,response, res,blockedurls))
                .on('error', (e) => {
                    console.error(`Got error: ${e.message}`);
                });
                
            } else {
        
                res.write('Invalid request');
                res.end();
        
            }
        
        }  
    }
}

