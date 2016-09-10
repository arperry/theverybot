// showdown.js
// Main function
(function() {
	'use strict';
	var version = '0.2',
		page = require('webpage').create(),
		Record = require('./record.js');
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
			console.log('CONSOLE: ' + msg.substr(2));
			if (msg.indexOf('ERROR') >= 0) {
				Record.error(msg);
			}
		}
	};

	page.open('http://play.pokemonshowdown.com', function(status) {
		var login = require('./login.js'),
			wait = require('./wait.js'),
			listener = require('./listener.js');
		console.log('Status: ' + status);
		window.config = require('./config.json');
		window.state = { challenges: [], queueCounter: 0 };
		window.version = version;
		page.evaluate(function() { localStorage.setItem('foo', 'bar'); });
		if (status === 'success') {
			wait.waitFor(login.login(page), 'login complete', function() { listener.listen(page); }, -1);
		}
	});
})();