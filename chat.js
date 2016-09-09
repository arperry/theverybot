// chat.js
// Responding to messages from other users
var VeryBotChat = {
	_unknownUser: false,
	getSpeaker: function(line) {
		var match = line.match(/<span class="username" data-name="([^"]+)">/);
		if (match && match.length >= 2) {
			return match[1];
		}
		return VeryBotChat._unknownUser;
	},
	getText: function(line) {
		var match = line.match(/<em>([^<]+)<\/em>/);
		if (match && match.length >= 2) {
			return match[1];
		}
		return '';
	},
	listen: function(lines, record, opponent, version, acceptFeedback) {
		var i, speaker, text, feedback = new Array();
		for(i = 0; i < lines.length; ++i) {
			speaker = VeryBotChat.getSpeaker(lines[i]);
			text = VeryBotChat.getText(lines[i]);
			if (lines[i].indexOf('#about') >= 0) {
				VeryBotChat.sayAbout(room);
			}
			if (lines[i].indexOf('#feedback') >= 0) {
				feedback = VeryBotChat.sayFeedback(room, acceptFeedback, speaker, text, feedback);
			}
			if (lines[i].indexOf('#help') >= 0) {
				VeryBotChat.sayHelp(room, acceptFeedback);
			}
			if (lines[i].indexOf('#record') >= 0) {
				VeryBotChat.sayRecord(room, opponent, speaker, record, version);
			}
		}
		return feedback;
	},
	say: function(room, message) {
		room.$chatbox.val(message).trigger($.Event('keydown', {which: 13, keyCode: 13}));
	},
	sayAbout: function(room) {
		VeryBotChat.say(room, 'I was programmed by Showdown user Mogri. You can learn more at my Github repo: https://github.com/arperry/theverybot');
	},
	sayFeedback: function(room, acceptFeedback, speaker, text, feedback) {
		if (!acceptFeedback) {
			VeryBotChat.say(room, 'Sorry, but I\'m not taking feedback right now.');
		} else if (text.trim() === '#feedback') {
			VeryBotChat.say(room, 'You can leave a note for the developer by saying something in the same line of chat as this command.');
		} else {
			feedback.push(speaker + ': ' + text);
			console.log('**FEEDBACK from user ' + speaker + ': ' + text);
			VeryBotChat.say(room, 'Thanks! Your feedback has been logged.');
		}
		return feedback;
	},
	sayHello: function(room, record, opponent) {
		if (record === false) {
			VeryBotChat.say(room, 'Hello, ' + opponent + '. I am a CC1v1 bot. Say "#help" for a list of commands.');
		} else {
			VeryBotChat.say(room, 'Hello again, ' + opponent + '. Say "#help" for a list of commands.');
		}
	},
	sayHelp: function(room, acceptFeedback) {
		VeryBotChat.say(room, 'I respond to the following commands: #about '
			+ (acceptFeedback ? '#feedback ' : '')
			+ '#help #record');
	},
	sayRecord: function(room, opponent, speaker, record, version) {
		var address = (opponent === speaker) ? 'you' : opponent;
		if (record === false) {
			VeryBotChat.say(room, 'This is the first time I\'ve battled ' + address + '.');
		} else {
			VeryBotChat.say(room, 'My record to date against ' + address + ' is '
				+ record.overall.win + ' win' + (record.overall.win === 1 ? '' : 's') + ', '
				+ record.overall.loss + ' loss' + (record.overall.loss === 1 ? '' : 'es') + ', and '
				+ record.overall.tie + ' tie' + (record.overall.tie === 1 ? '' : 's') + '.');
			if (!record[version]) {
				VeryBotChat.say(room, 'Since our last match, my AI has changed. I keep a separate record for each version of my AI.');
			} else if (record[version].win !== record.overall.win || record[version].loss !== record.overall.loss || record[version].tie !== record.overall.tie) {
				VeryBotChat.say(room, 'Since the last change to my AI, my record against ' + address + ' is '
					+ record[version].win + ' win' + (record[version].win === 1 ? '' : 's') + ', '
					+ record[version].loss + ' loss' + (record[version].loss === 1 ? '' : 'es') + ', and '
					+ record[version].tie + ' tie' + (record[version].tie === 1 ? '' : 's') + '.');
			}
		}
	}
};