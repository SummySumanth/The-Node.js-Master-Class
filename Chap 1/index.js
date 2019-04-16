/*

Primary file for API

*/


// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer((req, res) =>{

    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path from url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the Query string as object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the Headers as an object
    const headers = req.headers;

    // Send the response
    res.end('Hello world\n');

    // Log the request path
    
    console.log('Path:\t\t', trimmedPath);
    console.log('Method: \t', method);
    console.log('Query String \t', queryStringObject);
    console.log('Headers:\n', headers);
    console.log('--------\n\n');
});

// Start the server, and have it listen on port 3000
server.listen('3000', () =>{
    console.clear();
    console.log('the server is listening on port 3000\n\n');
});