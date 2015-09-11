var express = require('express');
var router = express.Router();

// var Client = require('ftp');
var JSFtp = require("jsftp");
var FTPCredentials = require('../supporting/credentials');

var ftp = new JSFtp(FTPCredentials.creds);

router.get('/', function(req, res, next) {
	sendResponse(res, 'Welcome', 'Enter a member name above to begin your search', 'result');
})

/* GET users listing. */
router.post('/', function(req, res, next) {
	requestHandler(req, res, next);
});

router.get('/:filename', function(req, res, next) {
	req.body.fileName = req.params.filename;
	requestHandler(req, res, next);
})

var sendResponse = function(res, programName, programContents, layout) {
	res.render(layout, {
		programName: programName,
		programContents: programContents
	});
}

var requestHandler = function(req, res, next) {
	var str = ""; // Will store the contents of the file
	ftp.get(req.body.fileName, function(err, socket) {
		if (err) {
			console.log(err.code);
			var responseMessage;
			switch (err.code) {
				case 430:
					responseMessage = 'Username and/or password provided is incorrect. Please updated your credentials.';
				case 550:
					responseMessage = 'File ' + req.body.fileName + ' not found. Please try again';
			}
			sendResponse(res, req.body.fileName, responseMessage, 'result');
			return;
		}

		socket.on("data", function(d) {
			str += d.toString();
		})
		socket.on("close", function(hadErr) {
			if (hadErr) {
				console.error('There was an error retrieving the file.');
				sendResponse(res, req.body.fileName, 'There was an error retrieving the file.', 'result');
				return;
			}
			sendResponse(res, req.body.fileName, str, 'result');
		});
		socket.resume();
	});
}

module.exports = router;