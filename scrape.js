// scrape.js
// Grabbing data from the page
// Despite the name, we actually want to keep scraping to a minimum, preferring to grab from the internals
var VeryBotScrape = {
	assign: function(obj1, obj2) {
		'use strict';
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
	formatAbilities: function(abilities) {
		'use strict';
		var abilityList = new Array(), i;
		for(i in abilities) {
			if (abilities.hasOwnProperty(i)) {
				abilityList.push(abilities[i].toLowerCase().replace(/[^a-z]/g, ''));
			}
		}
		return abilityList;
	},
	getActivePokemon: function(room) {
		'use strict';
		if (room.battle.sides[1].active && room.battle.sides[1].active[0]) {
			return {
				abilities: VeryBotScrape.formatAbilities(room.battle.sides[0].active[0].abilities),
				ability: room.battle.sides[0].active[0].ability || room.battle.sides[1].active[0].baseAbility,
				boosts: room.battle.sides[1].active[0].boosts,
				evos: room.battle.sides[1].active[0].evos,
				lastmove: room.battle.sides[1].active[0].lastmove,
				level: room.battle.sides[1].active[0].level,
				name: room.battle.sides[1].active[0].name,
				stats: room.battle.sides[1].active[0].baseStats,
				status: room.battle.sides[1].active[0].status,
				tier: room.battle.sides[1].active[0].tier,
				types: room.battle.sides[1].active[0].types
			};
		}
		return false;
	},
	getChat: function(room, lastChat) {
		'use strict';
		var chats = new Array(),
			$chats = room.$chat.children(':eq(' + lastChat + ')').nextAll('.chat').not('.mine');
		lastChat = room.$chat.children(':last').index();
		$chats.each(function() {
			chats.push(this.innerHTML);
		});
		return {
			chats: chats,
			lastChat: lastChat
		};
	},
	getEnemyAbility: function(room, enemyName) {
		'use strict';
		var match, $chats = room.$chat.find('div small:contains([Opposing ' + enemyName + '\'s ):last');
		if ($chats.length) {
			match = $chats.text().match(/\[Opposing [^']+'s ([^!]+)!\]/);
			if (match && match.length >= 2) {
				return match[1].toLowerCase.replace(/[^a-z]/g, '');
			}
		}
		return false;
	},
	getEnemyActivePokemon: function(room) {
		'use strict';
		if (room.battle.sides[1].active && room.battle.sides[1].active[0]) {
			return {
				abilities: VeryBotScrape.formatAbilities(room.battle.sides[1].active[0].abilities),
				ability: room.battle.sides[1].active[0].ability || VeryBotScrape.getEnemyAbility(room, room.battle.sides[1].active[0].name),
				boosts: room.battle.sides[1].active[0].boosts,
				evos: room.battle.sides[1].active[0].evos,
				lastmove: room.battle.sides[1].active[0].lastmove,
				level: room.battle.sides[1].active[0].level,
				name: room.battle.sides[1].active[0].name,
				stats: room.battle.sides[1].active[0].baseStats,
				status: room.battle.sides[1].active[0].status,
				tier: room.battle.sides[1].active[0].tier,
				types: room.battle.sides[1].active[0].types
			};
		}
		return false;
	},
	getEnemyData: function(room) {
		'use strict';
		var i, team = new Array(), poke;
		for(i = 0; i < room.battle.sides[1].pokemon.length; ++i) {
			poke = {
				ability: false,
				abilities: VeryBotScrape.formatAbilities(room.battle.sides[1].pokemon[i].abilities),
				boosts: {},
				evos: room.battle.sides[1].pokemon[i].evos,
				level: room.battle.sides[1].pokemon[i].level,
				name: room.battle.sides[1].pokemon[i].name,
				stats: room.battle.sides[1].pokemon[i].baseStats,
				tier: room.battle.sides[1].pokemon[i].tier,
				types: room.battle.sides[1].pokemon[i].types
			};
			team.push(poke);
		}
		return team;
	},
	getMoveData: function(room, movedex, move) {
		'use strict';
		if ((move === 'frustration' || move === 'return') && room.id.indexOf('challengecup') >= 0) {
			// Don't count on these being any good in CC
			return VeryBotScrape.assign(movedex[move], { basePower: 40 });
		}
		if (movedex[move]) {
			return movedex[move];
		}
		if (movedex[move.replace(/0-9/g, '')]) {
			return movedex[move.replace(/0-9/g, '')];
		}
		if (move === 'recharge') {
			// This is a pseudomove - it doesn't really exist, but it shows up after Hyper Beam, et al.
			return movedex.splash;
		}
		console.log("**ERROR: Unrecognized move '" + move + "'");
		return movedex.splash;
	},
	getMoves: function(room, movedex) {
		'use strict';
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
		'use strict';
		var i, team = new Array(), poke;
		for(i = 0; i < room.myPokemon.length; ++i) {
			poke = {
				ability: room.myPokemon[i].ability || room.myPokemon[i].baseAbility,
				boosts: {},
				hp: room.myPokemon[i].hp,
				level: room.myPokemon[i].level,
				moves: room.myPokemon[i].moves,
				name: room.myPokemon[i].name,
				stats: room.myPokemon[i].stats,
				types: room.battle.sides[0].pokemon[i].types
			};
			team.push(poke);
		}
		return team;
	},
	getWinner: function(room) {
		// -1/0/1 = tie/win/loss
		// -2 = no winner
		'use strict';
		var oppName = room.battle.sides[1].name,
			winMsg = ' won the battle!',
			winText = room.$chat.find('div:not(.chat):contains(' + winMsg + ')').text();
		if (winText === '') {
			// In the absence of the gsme telling us who won, try to deduce it from the game state
			if (!room.battleEnded) {
				// well, no wonder
				return -2;
			}
			if (room.battle.sides[0].active[0] === null && room.battle.sides[1].active[0] !== null) {
				return 1;
			}
			if (room.battle.sides[0].active[0] !== null && room.battle.sides[1].active[0] === null) {
				return 0;
			}
			return -1;
		} else if (winText === oppName + winMsg) {
			return 1;
		} else {
			return 0;
		}
	}
};