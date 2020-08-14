var fs = require('fs');
const path = require('path');
var http = require('http');
var sane = require('sane-scanimage-wrapper');
const { v4: uuidv4 } = require('uuid');
var express = require('express');

var app = express();

var devices = null
//
//
//
//
//
//

app.use(express.static('html'));
app.get('/listdevices', (req, res) => {
    sane.listDevices().then(
	     (a) => {
			 devices = a
			 res.send(a)
		 }
	);
})
app.get('/scannow', (req, res) => {
	let device = req.query.device || 0
	let filename = req.query.file || "temp" + Date.now() + ".jpg"
	let scanner = new sane.Scanner(devices[device]);
	let extension = filename.split(".")[1]
	if(extension == "jpg") extension = "jpeg"
	let args = { format: extension }
	Object.keys(req.query).forEach(a => {
		if(a != "device" && a != "file")
			args[a] = req.query[a]
	})
	let stream = scanner.scan(args).pipe(fs.createWriteStream('./html/'+filename));
	stream.on('finish', function () { 
		res.send("{\"file\":\""+filename+"\"}")
 	});
})
app.get("/options", (req,res) => {
	let device = req.query.device || 0
	let scanner = new sane.Scanner(devices[device]);
	scanner.infos().then(l => res.send(l))
})

var httpServer = http.createServer(app);

sane.listDevices().then(
	(a) => {
		devices = a
		httpServer.listen(7080);
		console.log("started")
	}
);
