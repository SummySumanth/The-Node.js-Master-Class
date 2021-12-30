
// PARSING
// Dependencies 
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiating the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`Listening on port ${config.httpPort} now in ${config.envName} !`);
})

// Instantiate the https server
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
})

//Start the https server
httpsServer.listen(config.httpsPort, () => {
  console.log(`Listening on port ${config.httpsPort} now in ${config.envName} !`);
})

// All the server logic for both the http and https server
var unifiedServer = (req, res) => {
 // Get the URL and parse it
 let parsedUrl = url.parse(req.url, true);

 // Get the path
 let path = parsedUrl.pathname;
 let trimmedPath = path.replace(/^\/+|\/+$/g, '');

 // Get the http method
 let method = req.method.toLowerCase();

 // Get the query string as an object
 let querysStringObject = parsedUrl.query;

 // Get the headers as an object
 let headers = req.headers;

 // Get the payload, if any
 var decoder = new StringDecoder('utf-8');
 var buffer = '';

 req.on('data', data => {
   console.log('data is ', data);
   buffer += decoder.write(data);
 })

 req.on('end', () => {
   buffer += decoder.end();

   console.clear();
   // Choose the handler this request should go to. If one is not found, use the notFound handler
   var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

   // Construct the data object to send to the handler
   let data = {
     trimmedPath,
     querysStringObject,
     method,
     headers,
     payload: buffer
   };

   // Route the request to the handelr specified in the router
   chosenHandler(data, (statusCode, payload) => {
     // Use the status code called back by the handler, or default status code 200
     statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

     // use the payload called back by the handler, or default to empty object
     payload = typeof(payload) == 'object' ? payload : {};

     // Cpmvert the pauload to a string
     let payloadString = JSON.stringify(payload);

     // Return the response
     res.setHeader('Content-Type', 'application/json');
     res.writeHead(statusCode);      
     res.end(payloadString);

     console.log('we are returning the response ', statusCode, payloadString);
   });
 });

 // log the request
 console.log('Request received on this path ', trimmedPath , ' with this method ', method, 'and had these query params ', querysStringObject);
 console.log('Request headers are ', headers);
}

// Define the Handlers
var handlers = {};

//Sample handler
handlers.sample = (data , callback) => {
  // Callback a http status code and a payload object
  callback(406, { 'name': 'sample handler'});
}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
}

// Define a request router
var router = {
  'sample': handlers.sample
}