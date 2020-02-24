const WebSocket = require('ws');
const hostname = 'localhost';
const port = 8000;
var stdin = process.openStdin();
var validUrl = require('valid-url');

// Console input listener
stdin.addListener("data", function(data) {

    // Listens to the console
    //Enter request followed by url
    var input = data.toString();
    var command = input.substring(0, input.indexOf(' '));

    if (command == "request") {

      var url = data.toString().substring(8).trim();
      if(validUrl.isUri(url)){
        console.log("URL OK, sending proxy request");
        ws.send(url);
      } else {
        console.log("Invalid URL");
      }

    } else {

      console.log("Unknown command");
      
    }
});

//  ws://localhost:8000
const ws = new WebSocket('ws://' + hostname + ':' + port);

ws.on('open', function open() {
  console.log("Successful connection to proxy");
});

ws.on('message', function incoming(mes) {
    console.log('Received response from proxy: %s', mes);
});

ws.on('close', function closed() {
  console.log("Proxy connection closed");
})