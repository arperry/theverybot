// login.js
// You know... login
function login(page) {
	'use strict';
	var credentials = require('./credentials.json'),
		wait = require('./wait.js'),
		loggedIn = false;
	wait.waitFor(function() {
		return page.evaluate(function(name) { return $('.username').text().trim() === name || $('button[name=login]').text() == 'Choose name'; }, credentials.username);
	}, 'page load', function() {
		if (page.evaluate(function(name) { return $('.username').text().trim() === name; }, credentials.username)) {
			// Already logged in
			loggedIn = true;
			return;
		}
		page.evaluate(function() { $('button[name=login]').click(); });
		page.evaluate(function(name) { $('input[name=username]').val(name).parents('form').find('[type=submit]').click(); }, credentials.username);
		wait.waitForPage(page, function() { return $('[name=password]').length > 0 }, 'password entry', function() {
			page.evaluate(function(pass) { $('[name=password]').val(pass).parents('form').find('[type=submit]').click(); }, credentials.password);
			wait.waitFor(function() { return page.evaluate(function(name) { return $('.username').text().trim() === name; }, credentials.username); }, 'logged in', function() {
				loggedIn = true;
			});
		});
	});
	return function() { return loggedIn; };
}

module.exports = {
	login: login
};