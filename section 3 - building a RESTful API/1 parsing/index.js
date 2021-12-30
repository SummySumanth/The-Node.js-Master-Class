
// PARSING
// Dependencies 
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respont to all requests with a string
const server = http.createServer((req, res) => {

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

    // Sebd the response
    res.end('Hello World\n');  

    console.log('request was recieved with the pay load : ', buffer);
  });

  // Send the response
  res.end('Hello World\n');

  // log the request
  console.log('Request received on this path ', trimmedPath , ' with this method ', method, 'and had these query params ', querysStringObject);
  console.log('Request headers are ', headers);
});

server.listen(1000, () => {
  console.log('Listening on port 1000 now');
})