// NOTE: This server is for testing, not safe for production
// It just serves everything in .
var express = require("express");
var app = express();
var http = require("http").Server(app);

// Serve static files
app.use(express.static('.'));

http.listen(3001);
