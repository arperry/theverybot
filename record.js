// record.js
// Storing feedback, storing and recalling W/L records
function error(message) {
	'use strict';
	var fs = require('fs');
	fs.write('error.log', message + '\n', 'a');
}

function getLifetimeRecord() {
	'use strict';
	var fs = require('fs'), record = { overall: { win: 0, loss: 0, tie: 0 } };
	if (fs.exists('./record.json')) {
		record = JSON.parse(fs.read('./record.json'));
	}
	if (record[window.version] === undefined) {
		record[window.version] = { win: 0, loss: 0, tie: 0 };
	}
	return record;
}

function getRecord(opponent) {
	'use strict';
	var fs = require('fs'), record = false;
	if (fs.exists('./records') && fs.exists('./records/' + encodeURI(opponent))) {
		record = JSON.parse(fs.read('./records/' + encodeURI(opponent)));
	}
	return record;
}

function recordFeedback(feedback) {
	'use strict';
	var fs = require('fs');
	if (!config.feedback) {
		return;
	}
	if (typeof feedback !== 'string') {
		feedback = feedback.join('\n');
	}
	fs.write(config.feedback, feedback + '\n', 'a');
}

function recordMatch(opponent, result) {
	'use strict';
	var fs = require('fs'), record = getRecord(opponent), lifetime = getLifetimeRecord();
	if (!fs.exists('./records')) {
		fs.makeDirectory('./records');
	}
	if (record === false) {
		record = { overall: { win: 0, loss: 0, tie: 0 } };
	}
	if (record[window.version] === undefined) {
		record[window.version] = { win: 0, loss: 0, tie: 0 };
	}
	switch(result) {
		case -1:
			record.overall.tie++;
			record[window.version].tie++;
			lifetime.overall.tie++;
			lifetime[window.version].tie++;
			break;
		case 0:
			record.overall.win++;
			record[window.version].win++;
			lifetime.overall.win++;
			lifetime[window.version].win++;
			break;
		case 1:
			record.overall.loss++;
			record[window.version].loss++;
			lifetime.overall.loss++;
			lifetime[window.version].loss++;
			break;
		default:
			console.log('*ERROR* Bad match result ' + result);
	}
	fs.write('./records/' + encodeURI(opponent), JSON.stringify(record), 'w');
	fs.write('./record.json', JSON.stringify(lifetime), 'w');
}

module.exports = {
	error: error,
	getLifetimeRecord: getLifetimeRecord,
	getRecord: getRecord,
	recordFeedback: recordFeedback,
	recordMatch: recordMatch
};