/*
Primary file for API
*/


// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
// instantiate the http server
const httpServer = http.createServer((req, res) => unifiedServer(req,res));

// Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, () =>{
    console.clear();
    console.log(`the server is listening on port ${config.httpPort} on environment ${config.envName}`);
});

// Instantiate the https server
var httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert:fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions ,(req, res) => unifiedServer(req,res));

// Start the https server 
httpsServer.listen(config.httpsPort, () =>{
    console.log(`the server is listening on port ${config.httpsPort} on environment ${config.envName}\n`);
});
// All the server logic for both http and https 
var unifiedServer = (req,res) =>{
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

    // Get the payloads if there are any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data)=>{
        buffer += decoder.write(data);
    });

    req.on('end', () =>{
        buffer += decoder.end();
        
        // Choose the handler the request should go to. If one is not found, use the not found handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload : buffer
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode = 200, payload = {}) => {

            // Convert the payload to string
            var payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString); 
            
            //  Log the response
            console.log('returning this response: ', statusCode, payloadString);
        });

        // Log the request path
        
        // console.log('\nPath:\t\t', trimmedPath);
        // console.log('Method: \t', method);
        // console.log('Query String \t', queryStringObject);
        // console.log('Headers:\n', headers);
        // console.log('Payload:\n', buffer);
        // console.log('--------\n\n');
    })  
};

// Define the handlers
var handlers = {};

// Ping handler
handlers.ping = (data, callback) =>{
    callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Define a request router
var router = {
    'ping' : handlers.ping
};