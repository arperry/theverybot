// decide.js
// Choosing what to do given all of the data in a convenient format
var VeryBotDecide = {
	chooseMove: function(poke, enemy, moves, typeChart) {
		var i,
			score,
			bestScore = -1,
			bestMove = 0;
		for(i = 0; i < moves.length; ++i) {
			score = VeryBotDecide.getMoveEffectivePower(poke, moves[i], enemy, typeChart);
			if (score > bestScore) {
				bestScore = score;
				bestMove = moves[i].index;
			}
		}
		return bestMove;
	},
	choosePokemon: function(team, enemyTeam, movedex, typeChart) {
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
	getItemDamageModifier: function(poke, movedata, enemy, effectiveness) {
		// TODO: Fill all of this in
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
		var baseDamage = 0,
			baseDefense = 60, // Multiplier for attacks mitigated by def/spd
			baseFixed = 100, // Multiplier for fixed-damage attacks
			effectiveness = (poke && enemy && movedata) ? VeryBotDecide.getTypeEffectiveness(poke, movedata.type, enemy.types, typeChart) : 1;
		if (!movedata || !poke || movedata.category === 'Status' || effectiveness === 0 || movedata.sleepUsable) {
			// TODO: Consider sleep-usable moves when asleep
			return 0;
		} else if (movedata.selfdestruct) {
			return 1; // we'd rather not
		} else if (movedata.shortDesc && movedata.shortDesc.indexOf('Fails') === 0) {
			return 0; // TODO: Last Resort strats (forget about Focus Punch)
		} else if (movedata.damage === 'level') {
			baseDamage = poke.level * baseFixed;
		} else if (movedata.damage) {
			baseDamage = movedata.damage * baseFixed;
		} else {
			if (movedata.category === 'Special') {
				baseDamage = movedata.basePower * poke.stats.spa;
				if (enemy) {
					baseDamage *= baseDefense / enemy.stats.spd;
				}
			} else {
				baseDamage = movedata.basePower * poke.stats.atk;
				if (poke.ability === 'purepower' || poke.ability === 'hugepower') {
					baseDamage *= 2;
				}
				if (enemy) {
					baseDamage *= baseDefense / enemy.stats.def;
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
		return baseDamage * (movedata.accuracy === true ? 1 : movedata.accuracy / 100);
	},
	getPokemonScore: function(poke, enemyTeam, movedex, typeChart) {
		var totalScore = 0,
			moveScoreSoftCap = 5000,
			bestMoveScore,
			enemy,
			move;
		for(enemy = 0; enemy < enemyTeam.length; ++enemy) {
			bestMoveScore = 0;
			for(move = 0; move < poke.moves.length; ++move) {
				bestMoveScore = Math.max(bestMoveScore, VeryBotDecide.getMoveEffectivePower(poke, movedex[poke.moves[move]], enemyTeam[enemy], typeChart));
			}
			if (poke.ability === 'slowstart' || poke.ability === 'truant') {
				bestMoveScore *= 0.5;
			}
			if (poke.ability === 'defeatist') {
				bestMoveScore *= 0.75;
			}
			if (bestMoveScore > moveScoreSoftCap) {
				// Limit how much we value Hydro Pump Magikarp when there's a Camerupt on the other side
				bestMoveScore = moveScoreSoftCap * Math.floor(Math.pow(1.3, (bestMoveScore / moveScoreSoftCap) - 1));
			}
			totalScore += bestMoveScore;
		}
		console.log('**' + poke.name + ' score: ' + totalScore);
		return totalScore;
	},
	getTypeEffectiveness: function(poke, atkType, defTypes, typeChart) {
		var effectiveness = 1, i;
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
		return effectiveness;
	}
};