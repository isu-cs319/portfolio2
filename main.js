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
fs = require('fs')
var obj = JSON.parse(fs.readFileSync('auth.cfg', 'utf8'));  // Hide file from git
var accountSid = obj.account;
var authToken = obj.auth;
var twilio = require('twilio')(accountSid, authToken);

// Routing Config
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
var events = [];
var js = {}; // associative array
// Add new event
app.post('/event',function(req,res){
    // Check for duplicates
    var duplicate = false;
    for (var i = 0; i < events.length; i++) {
        if (req.body.newEvent.id == events[i].id) {
            duplicate = true;
        }
    }
    if (!duplicate){
	events.push(req.body.newEvent);
        var phones = req.body.newEvent.sendTo.split(',');
	var j = schedule.scheduleJob(req.body.newEvent.start,function(){
	    for (var i = 0; i < phones.length; i++) {
		if (phones[i] != null && phones[i] != "") {
		    console.log("Sending SMS to " + phones[i]);
		    twilio.messages.create({
			from: "+14242312096",
			to: phones[i],
			body: req.body.newEvent.message
		    }, function(err, message) {
			console.log(message.sid);
			if (err != null)
			    console.log(err);
		    });
		}
	    }
	});
	js[req.body.newEvent.id] = j;
    }
});

// Remove an event
app.post('/event/cancel', function(req,res){
    console.log("Cancelling event with id " + req.body.id);
    if (js[req.body.id] != null) {
        console.log("Cancelling job");
        js[req.body.id].cancel(); // cancel job
        delete js[req.body.id];  // Remove from list
    }
    for (var i = 0; i < events.length; i++) {
        if (req.body.id == events[i].id){
            events.splice(i,1);
            res.send(JSON.stringify(events));
        }
    }
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
