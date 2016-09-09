// record.js
// Storing feedback, storing and recalling W/L records
function getRecord(opponent) {
	var fs = require('fs'), record = false;
	if (fs.exists('./records') && fs.exists('./records/' + encodeURI(opponent))) {
		record = JSON.parse(fs.read('./records/' + encodeURI(opponent)));
	}
	return record;
}

function recordFeedback(feedback) {
	var i, fs = require('fs');
	if (!config.feedback) {
		return;
	}
	if (typeof feedback !== 'string') {
		feedback = feedback.join('\n');
	}
	fs.write(config.feedback, feedback + '\n', 'a');
}

function recordMatch(opponent, result) {
	var fs = require('fs'), record = getRecord(opponent);
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
			break;
		case 0:
			record.overall.win++;
			record[window.version].win++;
			break;
		case 1:
			record.overall.loss++;
			record[window.version].loss++;
			break;
		default:
			console.log('*ERROR* Bad match result ' + result);
	}
	fs.write('./records/' + encodeURI(opponent), JSON.stringify(record), 'w');
}

module.exports = {
	getRecord: getRecord,
	recordFeedback: recordFeedback,
	recordMatch: recordMatch
};