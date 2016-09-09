// listener.js
// Listening for challenges
'use strict';
function listen(page) {
	var interval;
	page.injectJs('scrape.js');
	page.injectJs('decide.js');
	page.injectJs('chat.js');
	console.log('Starting to listen for challenges.');
	setInterval(function() { checkChallenges(page); }, 3000);
}

function checkChallenges(page) {
	var challenges = [],
		battles = window.state.battles,
		Battle = require('./battle.js').Battle,
		formats = require('./formats.json'),
		i;
	challenges = page.evaluate(function(formats) {
		var challenges = new Array();
		$('[name=acceptChallenge]').each(function() {
			var $form = $(this).parents('form'),
				$format = $form.find('.formatselect'),
				$chatbox = $(this).parents('.pm-window').find('form.chatbox textarea');
			if ($format.is('.preselected') && formats.indexOf($format.val()) !== -1) {
				// Accept
				$form.find('[name=acceptChallenge]').click();
			} else {
				// Reject
				$chatbox.val("Sorry, but I don't know how to play that format. I only know these formats: " + formats.join(' '));
				challenges.push({ id: undefined, opponent: $(this).parents('.pm-window').attr('data-name'), format: $format.val() });
				$form.find('[name=rejectChallenge]').click();
				$chatbox.trigger($.Event('keydown', {which: 13, keyCode: 13}));
			}
		});
		$('.roomtab[href*=battle]').each(function() {
			var challenge = { id: undefined, opponent: undefined };
			$(this).click();
			challenge.id = window.room.id;
			challenge.opponent = window.room.$battle.find('.trainer:last strong').text().trim();
			challenges.push(challenge);
		});
		return challenges;
	}, formats);
	for(i = 0; i < challenges.length; ++i) {
		if (!challenges[i].id) {
			console.log('Rejected ' + challenges[i].format + ' battle from ' + challenges[i].opponent ? challenges[i].opponent.trim() : 'a mystery user');
		} else if (battles[challenges[i].id] === undefined) {
			battles[challenges[i].id] = { opponent: challenges[i].id, battle: new Battle(challenges[i], page) };
		}
	}
	for(i in battles) {
		if (battles.hasOwnProperty(i) && battles[i].state && battles[i].state.finished) {
			console.log('Closing battle ' + i);
			delete(battles[i]);
		}
	}
}

module.exports = {
	listen: listen
}