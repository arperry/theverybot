// showdown.js
// Main function
(function() {
	'use strict';
	var page = require('webpage').create();
	phantom.onError = function(msg, trace) {
		console.log(msg);
		trace.forEach(function(item) {
			console.log('   ', item.file, ':', item.line);
		});
		if (page) {
			page.render('error.png');
		}
		phantom.exit(1);
	}

	page.onConsoleMessage = function(msg) {
		if (msg.indexOf('**') >= 0) {
			console.log('*DEBUG*: ' + msg);
		}
	};

	page.open('http://play.pokemonshowdown.com', function(status) {
		var login = require('./login.js'),
			wait = require('./wait.js'),
			listener = require('./listener.js');
		console.log('Status: ' + status);
		window.state = { battles: [] };
		page.evaluate(function() { localStorage.setItem('foo', 'bar'); });
		if (status === 'success') {
			wait.waitFor(login.login(page), 'login complete', function() { listener.listen(page); }, -1);
		}
	});
})();