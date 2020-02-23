//Load HTTP module
const http = require("http");
var https = require('https');
const hostname = 'localhost';
const port = 8000;
const url = require('url');

//create a server object:
//
http.createServer(onRequest).listen(port,() => {
    console.log(`Server running at http://${hostname}:${port}/`);
  }); //the server object listens on port

//function to handle requests
function onRequest(req, res) {

    //Add an HTTP Header
        //first argument of the res.writeHead() method is the status code, 
        //200 means that all is OK, 
        //the second argument is an object containing the response headers

    //res.writeHead(200, {'Content-Type': 'text/html'});
    //Read the Query String
    //res.write(req.url);
    //res.write('Hello World!'); //write a response to the client

    var split = url.parse(req.url.substring(1), false);

    //res.write(split.protocol);  //  https:
    //res.write(split.path);      //  /
    //res.write(split.hostname);  //  www.tcd.ie
    //res.write(split.href);    //  https://www.tcd.ie/
    //res.end(); //end the response

    http.get(split.href, (res) => {

        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });

    }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});

}  