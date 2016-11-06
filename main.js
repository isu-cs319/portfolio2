// Globals
var http = require("http");
var express = require('express')
var app = express()
var schedule = require('node-schedule')
var bodyParser = require('body-parser')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// Twilio Stuff
var accountSid = 'ACe95176a3665dff3c959b81a7830b8797';
var authToken = '';  //TODO: changeme, do not upload to github!
var twilio = require('twilio')(accountSid, authToken);

// Routing Config
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
var events = [];
var js = {}; // associative array
// Add new event
app.post('/event',function(req,res){
    events.push(req.body.newEvent);
    console.log(events);
    var j = schedule.scheduleJob(req.body.newEvent.start,function(){
        console.log("Sending SMS to " + req.body.newEvent.sendTo);
        twilio.messages.create({
            from: "+14242312096",
            to: req.body.newEvent.sendTo,
            body: req.body.newEvent.title
        }, function(err, message) {
            console.log(message.sid);
            if (err != null)
                console.log(err);
        });

    });
    js[req.body.newEvent.id] = j;
});

app.post('/event/cancel', function(req,res){
    delete js[req.body.id];
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