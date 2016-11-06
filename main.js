var http = require("http");
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
var events = [];

// Update events
app.post('/event',function(req,res){
    events = req.body.events
    console.log(events);
});

// Return current events
app.post('/event/fetch',function(req,res){
    //res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(events))
});
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
  console.log('listening on port 8888!')
})