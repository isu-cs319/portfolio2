var http = require("http");
var express = require('express')
var app = express()
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// respond with "<index.html>" when a GET request is made to the homepage
app.get('/', function (req, res) {
  var options = {
    //root: __dirname,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };
  var file = '/index.html'
  res.sendFile(file, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', file);
    }
  });
})

app.listen(8888, function () {
  console.log('Example app listening on port 8888!')
})