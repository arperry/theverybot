// decide.js
// Choosing what to do given all of the data in a convenient format
var VeryBotDecide = {
	chooseMove: function(poke, enemy, moves, typeChart) {
		'use strict';
		var i,
			score,
			bestScore = -1,
			bestMove = 0;
		for(i = 0; i < moves.length; ++i) {
			score = VeryBotDecide.getMoveEffectivePower(poke, moves[i], enemy, typeChart);
			console.log('**' + moves[i].name + ' score: ' + score);
			if (score > bestScore) {
				bestScore = score;
				bestMove = moves[i].index;
			}
		}
		return bestMove;
	},
	choosePokemon: function(team, enemyTeam, movedex, typeChart) {
		'use strict';
		var i,
			score,
			bestScore = 0,
			bestPoke = 0;
		for(i = 0; i < team.length; ++i) {
			score = VeryBotDecide.getPokemonScore(team[i], enemyTeam, movedex, typeChart);
			if (score > bestScore) {
				bestScore = score;
				bestPoke = i;
			}
		}
		return bestPoke;
	},
	getAdjustedStat: function(poke, stat) {
		var value = poke.stats[stat] || 100, boost = poke.boosts[stat];
		if (boost) {
			if (stat === 'accuracy' || stat === 'evasion') {
			} else {
				if (boost > 0) {
					value *= (boost + 2) / 2;
				} else {
					value *= 2 / (boost + 2);
				}
			}
		}
		if (stat === 'atk' && poke.status === 'brn') {
			value *= 0.5;
		}
		return value;
	},
	getDesirabilityModifier: function(poke) {
		// Adjust score for each enemy based on how likely it is to be picked
		'use strict';
		var modifier = 1;
		switch(poke.tier) {
			case 'LC':
			case 'NFE':
				if (poke.speciesid === 'magikarp' || poke.speciesid === 'feebas') {
					// Some special cases: these are strictly inferior to their evos
					modifier = 0.5;
				} else if (poke.evos && poke.evos.length && BattlePokedex[poke.evos[poke.evos.length - 1]]) {
					// For most cases, rank this based on the tier of the highest evo with a slight penalty
					modifier = VeryBotDecide.getDesirabilityModifier(BattlePokedex[poke.evos[poke.evos.length - 1]]) * 0.9;
				}
				break;
			case 'PU':
				modifier = 0.6;
				break;
			case 'NU':
				modifier = 0.7;
				break;
			case 'BL3': // I'm not convinced this is actually in use
				modifier = 0.75;
				break;
			case 'RU':
				modifier = 0.8;
				break;
			case 'BL2':
				modifier = 0.85;
				break;
			case 'UU':
				modifier = 0.9;
				break;
			case 'BL':
				modifier = 0.95;
				break;
			case 'OU':
				modifier = 1;
				break;
			case 'Ubers':
				modifier = 1.1;
				if ([
						'arceus', 'dialga', 'giratina', 'giratinaorigin', 'groudon', 'hooh', 'kyogre', 'kyuremwhite',
						'lugia', 'mewtwo', 'palkia', 'rayquaza', 'reshiram', 'xerneas', 'yveltal', 'zekrom'
					].indexOf(poke.speciesid) >= 0) {
					// For the actual real Uber ubers, add a little extra oomph
					// Not only are they more appealing, but legendary movesets also tend to lack junk moves
					modifier = 1.3;
				}
				break;
		}
		return modifier;
	},
	getItemDamageModifier: function(poke, movedata, enemy, effectiveness) {
		// TODO: Fill all of this in
		'use strict';
		switch(poke.item) {
			case 'choiceband':
				return movedata.category === 'Physical' ? 1.5 : 1;
			case 'choicespecs':
				return movedata.category === 'Special' ? 1.5 : 1;
			case 'expertbelt':
				return effectiveness > 1 ? 1.2 : 1;
			case 'lifeorb':
				return 1.3;
		}
		return 1;
	},
	getMoveEffectivePower: function(poke, movedata, enemy, typeChart) {
		// Heuristic for determining how much damage to expect from a move
		'use strict';
		var baseDamage = 0,
			baseDefense = 60, // Multiplier for attacks mitigated by def/spd
			baseFixed = 100, // Multiplier for fixed-damage attacks
			effectiveness = (poke && enemy && movedata) ? VeryBotDecide.getTypeEffectiveness(poke, movedata, enemy, typeChart) : 1;
		if (!movedata || !poke || effectiveness === 0 || movedata.sleepUsable) {
			// TODO: Consider sleep-usable moves when asleep
			return 0;
		} else if (movedata.category === 'Status') {
			return 3;
		} else if (movedata.selfdestruct) {
			return 2; // we'd rather not
		} else if (movedata.shortDesc && movedata.shortDesc.indexOf('Fails') === 0) {
			return 1; // TODO: Last Resort strats (forget about Focus Punch)
		} else if (movedata.damage === 'level') {
			baseDamage = poke.level * baseFixed;
		} else if (movedata.damage) {
			baseDamage = movedata.damage * baseFixed;
		} else {
			if (movedata.category === 'Special') {
				baseDamage = movedata.basePower * VeryBotDecide.getAdjustedStat(poke, 'spa');
				if (enemy) {
					baseDamage *= baseDefense / VeryBotDecide.getAdjustedStat(enemy, 'spd');
				}
			} else {
				baseDamage = movedata.basePower * VeryBotDecide.getAdjustedStat(poke, 'atk');
				if (poke.ability === 'purepower' || poke.ability === 'hugepower') {
					baseDamage *= 2;
				}
				if (enemy) {
					baseDamage *= baseDefense / VeryBotDecide.getAdjustedStat(enemy, 'def');
				}
			}
			if (poke.types.indexOf(movedata.type) >= 0) {
				// STAB
				baseDamage *= poke.ability === 'adaptability' ? 2 : 1.5;
			}
			baseDamage *= effectiveness;
			baseDamage *= VeryBotDecide.getItemDamageModifier(poke, movedata, enemy, effectiveness);
		}
		if (movedata.desc && (movedata.desc.match(/charges on the first turn/) || movedata.desc.match(/user must recharge/) || movedata.desc.match(/two turns/))) {
			// TODO: Recharge moves should be considered at full strength if they are expected to KO
			baseDamage *= 0.5;
		}
		if (movedata.accuracy !== true) {
			baseDamage *= movedata.accuracy / 100 * VeryBotDecide.getAdjustedStat(poke, 'accuracy') / VeryBotDecide.getAdjustedStat(enemy, 'evasion');
		}
		return baseDamage;
	},
	getPokemonScore: function(poke, enemyTeam, movedex, typeChart) {
		'use strict';
		var totalScore = 0,
			moveScoreSoftCap = 5000,
			bestMoveScore,
			enemy,
			move;
		// The primary determiner: how much damage will it do to the enemy?
		for(enemy = 0; enemy < enemyTeam.length; ++enemy) {
			bestMoveScore = 0;
			for(move = 0; move < poke.moves.length; ++move) {
				bestMoveScore = Math.max(bestMoveScore, VeryBotDecide.getMoveEffectivePower(poke, movedex[poke.moves[move]], enemyTeam[enemy], typeChart));
			}
			if (bestMoveScore > moveScoreSoftCap) {
				// Limit how much we value Hydro Pump Magikarp when there's a Camerupt on the other side
				bestMoveScore = moveScoreSoftCap * Math.pow(1.3, (bestMoveScore / moveScoreSoftCap) - 1);
			}
			totalScore += bestMoveScore * VeryBotDecide.getDesirabilityModifier(enemyTeam[enemy]);
		}
		// TODO: Take other factors into consideration
		if (poke.ability === 'slowstart' || poke.ability === 'truant') {
			totalScore *= 0.5; // I'm not sure this is low enough for Truant, really
		}
		if (poke.ability === 'defeatist') {
			totalScore *= 0.75;
		}
		totalScore = Math.floor(totalScore);
		console.log('**' + poke.name + ' score: ' + totalScore);
		return totalScore;
	},
	getTypeEffectivenessModifier: function(movedata, enemy) {
		// Check for things (mostly abilities) that grant type modifiers (mostly immunities)
		// http://pokemon.wikia.com/wiki/Move_Immunity_Abilities
		'use strict';
		var effectiveness = 1, i, ability = enemy.ability, item = enemy.item, atkType = movedata.type;
		if (!ability && enemy.abilities && enemy.abilities.length) {
			effectiveness = 0;
			for (i = 0; i < enemy.abilities.length; ++i) {
				effectiveness += VeryBotDecide.getTypeEffectivenessModifier(atkType, { ability: enemy.abilities[i], item: enemy.item });
			}
			return effectiveness / enemy.abilities.length;
		}
		if (movedata.flags && movedata.flags.sound && ability === 'soundproof') {
			return 0;
		}
		switch(atkType) {
			case 'Electric':
				if (ability === 'lightningrod' || ability === 'motordrive' || ability === 'voltabsorb') {
					return 0;
				}
				break;
			case 'Fire':
				if (ability === 'flashfire') {
					return 0;
				} else if (ability === 'dryskin') {
					effectiveness *= 2;
				} else if (ability === 'thickfat') {
					effectiveness *= 0.5;
				}
				break;
			case 'Grass':
				if (ability === 'sapsipper') {
					return 0;
				}
				break;
			case 'Ice':
				if (ability === 'thickfat') {
					effectiveness *= 0.5;
				}
				break;
			case 'Ground':
				if (ability === 'levitate' || item === 'airballoon') {
					return 0;
				}
				break;
			case 'Water':
				if (ability === 'dryskin' || ability === 'stormdrain' || ability === 'waterabsorb') {
					return 0;
				}
				break;
		}
		return effectiveness;
	},
	getTypeEffectiveness: function(poke, movedata, enemy, typeChart) {
		'use strict';
		var effectiveness = 1, i, atkType = movedata.type, defTypes = enemy.types;
		effectiveness *= VeryBotDecide.getTypeEffectivenessModifier(movedata, enemy);
		if (effectiveness === 0) {
			return 0;
		}
		for(i = 0; i < defTypes.length; ++i) {
			if (poke.ability === 'scrappy' && (atkType === 'Normal' || atkType === 'Fighting') && defTypes[i] === 'Ghost') {
				continue;
			}
			if (typeChart[defTypes[i]] && typeChart[defTypes[i]].damageTaken) {
				// Don't ask me why the Showdown type chart uses these numbers, but they do.
				switch(typeChart[defTypes[i]].damageTaken[atkType]) {
					case 1: // Super effective
						effectiveness *= 2;
						break;
					case 2: // Less effective
						effectiveness *= 0.5;
						break;
					case 3: // Ineffective
						return 0;
				}
			}
		}
		if (enemy.ability === 'wonderguard' && effectiveness <= 1) {
			return 0;
		}
		return effectiveness;
	}
};