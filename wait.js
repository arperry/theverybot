// wait.js
// Introducing delay
function waitForPage(page, testFn, desc, onReady, timeout) {
	'use strict';
	return waitFor(function() { return page.evaluate(testFn) }, desc, onReady, timeout);
}

function waitFor(testFn, desc, onReady, timeout) {
	'use strict';
	var maxtimeout = timeout ? timeout : 3000,
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
			if (testFn()) {
				clearInterval(interval);
				console.log('Wait for ' + desc + ' finished in ' + (new Date().getTime() - start) + 'ms.');
				if (typeof onReady === 'function') {
					onReady();
				}
			} else if (maxtimeout > 0 && new Date().getTime() - start >= maxtimeout) {
				clearInterval(interval);
				throw 'Timeout waiting for ' + desc;
			}
		}, 100);
}

module.exports = {
	waitFor: waitFor,
	waitForPage: waitForPage
};