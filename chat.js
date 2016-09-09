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
	listen: function(lines) {
		var i, speaker;
		for(i = 0; i < lines.length; ++i) {
			speaker = VeryBotChat.getSpeaker(lines[i]);
			if (lines[i].indexOf('#about') >= 0) {
				VeryBotChat.sayAbout(room);
			}
			if (lines[i].indexOf('#help') >= 0) {
				VeryBotChat.sayHelp(room);
			}
			if (lines[i].indexOf('#record') >= 0) {
				VeryBotChat.sayRecord(room, speaker);
			}
		}
	},
	say: function(room, message) {
		room.$chatbox.val(message).trigger($.Event('keydown', {which: 13, keyCode: 13}));
	},
	sayAbout: function(room) {
		VeryBotChat.say(room, 'I was programmed in PhantomJS. You can learn more at my Github repo: https://github.com/arperry/theverybot');
	},
	sayHello: function(room) {
		VeryBotChat.say(room, 'Hello, I am a CC1v1 bot made by Showdown user Mogri. Say "#help" for a list of commands.');
	},
	sayHelp: function(room) {
		VeryBotChat.say(room, 'I respond to the following commands: #about #help #record');
	},
	sayRecord: function(room, speaker) {
		if (speaker === VeryBotChat._unknownUser) {
			VeryBotChat.say(room, 'Sorry, but I couldn\'t determine who was asking for our matchup record.');
		} else {
			VeryBotChat.say(room, speaker + ', in future versions, I will keep track of our matches. For now, I can\'t do that.');
		}
	}
};