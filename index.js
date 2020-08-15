var fs = require('fs');
const path = require('path');
var http = require('http');
var sane = require('./sane-wrapper.js');
const { v4: uuidv4 } = require('uuid');
var express = require('express');
var dateFormat = require('dateformat');
const processes = require('child_process');
var increment = 0;
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
	filename = "scans/" + filename
	console.log(filename)
	let incOk = false
	if(filename.includes("%i")) incOk = true
	filename = filename.replace("%i",increment)
	filename = filename.replace("%d",dateFormat(new Date(), "yyyy-mm-dd"))
	console.log(filename)
	if(incOk) increment++
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

app.get("/files", (req,res) => {
	const directoryPath = path.join(__dirname, 'html/scans');
	if(req.query.increment)
		increment = parseInt(req.query.increment)

	if(req.query.delete)
		fs.unlink("./html/scans/" + req.query.delete , () => {})

	fs.readdir(directoryPath, function (err, files) {
		res.send({files : files, increment: increment})
	})
})

app.get("/group", (req,res) => {
	let args = []
	Object.keys(req.query).forEach(o => {
		console.log(o)
		if(o.includes("file")) {
			console.log("push")
			args.push("./html/scans/" + req.query[o])
		}
	})
	args.push("./html/scans/" + req.query.destination)
	console.log(args)
	let convert = processes.spawn("convert",args)
	convert.stdout.once('end', () => {
		res.send({ ok: true})
	});
})

var httpServer = http.createServer(app);

sane.listDevices().then(
	(a) => {
		devices = a
		httpServer.listen(7080);
		console.log("started")
	}
);
