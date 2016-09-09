// scrape.js
// Grabbing data from the page
// Despite the name, we actually want to keep scraping to a minimum, preferring to grab from the internals
var VeryBotScrape = {
	assign: function(obj1, obj2) {
		// PhantomJS doesn't support Object.assign
		var clone = {}, i;
		for(i in obj1) {
			if (obj1.hasOwnProperty(i)) {
				clone[i] = obj1[i];
			}
		}
		for(i in obj2) {
			if (obj2.hasOwnProperty(i)) {
				clone[i] = obj2[i];
			}
		}
		return clone;
	},
	getChat: function(room, lastChat) {
		var chats = new Array(),
			$chats = room.$chat.children(':eq(' + lastChat + ')').nextAll('.chat').not('.mine');
		lastChat = room.$chat.children(':last').index();
		$chats.each(function() {
			chats.push(this.innerHTML);
		})
		return {
			chats: chats,
			lastChat: lastChat
		};
	},
	getEnemyActivePokemon: function(room) {
		return {
			name: room.battle.sides[1].active[0].name,
			level: room.battle.sides[1].active[0].level,
			stats: room.battle.sides[1].active[0].baseStats,
			types: room.battle.sides[1].active[0].types
		}
	},
	getEnemyData: function(room) {
		var i, team = new Array(), poke;
		for(i = 0; i < room.battle.sides[1].pokemon.length; ++i) {
			poke = {
				name: room.battle.sides[1].pokemon[i].name,
				ability: room.battle.sides[1].pokemon[i].baseAbility,
				level: room.battle.sides[1].pokemon[i].level,
				stats: room.battle.sides[1].pokemon[i].baseStats,
				types: room.battle.sides[1].pokemon[i].types
			}
			team.push(poke);
		}
		return team;
	},
	getMoveData: function(room, movedex, move) {
		if ((move == 'frustration' || move == 'return') && room.id.indexOf('challengecup') >= 0) {
			// Don't count on these being any good in CC
			return VeryBotScrape.assign(movedex[move], { basePower: 40 });
		}
		if (movedex[move]) {
			return movedex[move];
		}
		if (movedex[move.replace(/0-9/g, '')]) {
			return movedex[move.replace(/0-9/g, '')];
		}
		throw "What the heck kind of move is '" + move + "'?";
	},
	getMoves: function(room, movedex) {
		var move, moves = new Array();
		room.$controls.find('[name=chooseMove]').not(':disabled').each(function() {
			var $this = room.$controls.find(this);
			if ($this.find('.pp').text().substr(0, 2) === '0/') {
				return;
			}
			move = VeryBotScrape.assign(VeryBotScrape.getMoveData(room, movedex, $this.attr('data-move').toLowerCase().replace(/[^a-z]/g, '')), {
				type: $this.find('.type').text(),
				index: $this.val()
			});
			moves.push(move);
		});
		return moves;
	},
	getTeamData: function(room) {
		var i, team = new Array(), poke;
		for(i = 0; i < room.myPokemon.length; ++i) {
			poke = {
				name: room.myPokemon[i].name,
				level: room.myPokemon[i].level,
				stats: room.myPokemon[i].stats,
				hp: room.myPokemon[i].hp,
				moves: room.myPokemon[i].moves,
				types: room.battle.sides[0].pokemon[i].types
			}
			team.push(poke);
		}
		return team;
	},
	getWinner: function(room) {
		// -1/0/1 = tie/win/loss
		// -2 = no winner
		var oppName = room.battle.sides[1].name,
			winMsg = ' won the battle!',
			winText = room.$chat.find('div:not(.chat):contains(' + winMsg + ')').text();
		if (winText === '') {
			return room.battleEnded ? -1 : -2;
		} else if (winText === oppName + winMsg) {
			return 1;
		} else {
			return 0;
		}
	}
};