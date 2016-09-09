// battle.js
// Interacting with the battle interface
'use strict';
function Battle(challenge, page) {
	this.id = challenge.id;
	this.opponent = challenge.opponent;
	this.interval = setInterval(function() { this.processBattle(page) }.bind(this), 2000);
	this.Record = require('./record.js');
	this.state = {
		feedbackEnabled: !!window.config.feedback,
		finishCountdown: 0,
		started: 0,
		record: this.Record.getRecord(this.opponent),
		version: window.version
	};
	console.log('Starting battle ' + this.id + ' against ' + this.opponent);
}

Battle.prototype.processBattle = function(page) {
	this.state = page.evaluate(function(id, state) {
		try {
			var $tab = $('.roomtab[href*=' + id + ']'),
				$room,
				$move,
				chat,
				choice;
			if (!$tab.length) {
				if (state.started) {
					state.finished = 1;
				}
				return;
			}
			$tab.click();
			$room = window.room.$battle.parent();
			if (!state.started) {
				VeryBotChat.sayHello(window.room, state.record, room.battle.sides[1].name);
				state.team = VeryBotScrape.getTeamData(window.room);
				state.enemyTeam = VeryBotScrape.getEnemyData(window.room);
				state.started = 1;
				state.lastChat = 0;
			}
			if (state.started) {
				// Check chat
				chat = VeryBotScrape.getChat(room, state.lastChat);
				state.lastChat = chat.lastChat;
				state.feedback = VeryBotChat.listen(chat.chats, state.record, room.battle.sides[1].name, state.version, state.feedbackEnabled);
				
				// Do some deciding
				// For some reason, clicking on the buttons does nothing, so we have to fiddle with the Showdown internals.
				if ($room.find('[name=chooseTeamPreview]').length) {
					choice = VeryBotDecide.choosePokemon(state.team, state.enemyTeam, BattleMovedex, BattleTypeChart);
					state.active = choice;
					window.room.chooseTeamPreview(choice);
					state.message = 'Choosing ' + state.team[choice].name;
				} else if ($room.find('[name=chooseMove]').length) {
					choice = VeryBotDecide.chooseMove(state.team[state.active],
						VeryBotScrape.getEnemyActivePokemon(window.room),
						VeryBotScrape.getMoves(window.room, BattleMovedex),
						BattleTypeChart);
					$move = $room.find('[name=chooseMove][value=' + choice + ']');
					state.message = 'Choosing move #' + choice + ' (' + $move.attr('data-move') + ')';
					$room.find('input[name=megaevo]:not(:checked)').click(); // I mean, you never know
					window.room.chooseMove(choice, $move[0]);
				} else if ($room.find('[name=setTimer][value=on]').length) {
					$room.find('[name=setTimer][value=on]').click();
				} else if (window.room.battleEnded) {
					state.finishCountdown++;
					if (state.finishCountdown >= 5) {
						state.finished = 1;
						state.winner = VeryBotScrape.getWinner(window.room);
						state.message = 'Battle ended in ';
						switch(state.winner) {
							case -1:
								state.message += 'a tie';
								break;
							case 0:
								state.message += 'victory';
								break;
							case 1:
								state.message += 'defeat';
								break;
							default:
								state.message += 'an uncertain state';
						}
						$('.closebutton[value=' + id + ']').click();
					}
				}
			}
		} catch(e) {
			state.error = e + '\n' + e.stack;
		}
		// End by returning the updated state
		return state;
	}, this.id, this.state);
	
	if (this.state.message !== undefined && this.state.message !== '') {
		console.log(this.id + ': ' + this.state.message);
		this.state.message = '';
	}
	if (this.state.error !== undefined && this.state.error !== '') {
		console.log(this.id + ' *ERROR*: ' + this.state.error);
		this.state.error = '';
	}
	if (this.state.feedback !== undefined && this.state.feedback.length) {
		this.Record.recordFeedback(this.state.feedback);
		this.state.feedback = [];
	}
	if (this.state.finished) {
		clearInterval(this.interval);
		this.Record.recordMatch(this.opponent, this.state.winner);
	}
}


module.exports = {
	Battle: Battle
};