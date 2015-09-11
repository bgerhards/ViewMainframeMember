var express = require('express');
var router = express.Router();

// var Client = require('ftp');
var JSFtp = require("jsftp");
var FTPCredentials = require('../supporting/credentials');

router.get('/', function(req, res, next) {
	sendResponse(res, 'Welcome', 'Enter a member name above to begin your search', 'result');
})

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

	var ftp = new JSFtp(FTPCredentials.creds);


	ftp.raw.type("a", function(err, data) {
	})

	var str = ""; // Will store the contents of the file
	var inFilename = "'" + req.body.fileName + "'";
	ftp.get(inFilename, function(err, socket) {
		if (err) {
			console.log(err.code);
			var responseMessage;
			switch (err.code) {
				case 430:
					responseMessage = 'Username and/or password provided is incorrect. Please updated your credentials.';
				case 550:
					responseMessage = '<p>File ' + inFilename + ' not found. Please try again</p> <p><strong>Tip:</strong> If your member path contains a pound sign "#", replace it with %23.</p><p>Example: <br> Before: CMNSTAGE.FMT0.#003950.BTS(FMP025MC)<br />After: CMNSTAGE.FMT0.%23003950.BTS(FMP025MC)</p>';
			}
			sendResponse(res, inFilename, responseMessage, 'result');
			return;
		}

		socket.on("data", function(d) {
			str += d.toString();
		})
		socket.on("close", function(hadErr) {
			if (hadErr) {
				console.error('There was an error retrieving the file.');
				sendResponse(res, inFilename, 'There was an error retrieving the file.', 'result');
				return;
			}
			sendResponse(res, inFilename, str, 'result');
		});
		socket.resume();

	});
}

module.exports = router;