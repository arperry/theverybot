# (I Wanna Be) The Very Bot

###### Like No Bot Ever Was

The Very Bot is a PhantomJS bot for Challenge Cup 1v1 battles on [Pokémon Showdown](http://www.pokemonshowdown.com). In this format, players are presented with a randomly-generated team. They must choose one Pokémon on their team to do battle, and they can't switch. The limited scope of the format makes the AI for this bot _relatively_ simple.

The same AI used for CC1v1 could easily be applied to the 1v1 format, which is the same except that players supply their own teams. I don't currently have any plans to attempt this, but if you do it, I'd love to hear about it.

## State of the Bot

The Very Bot is battle-capable. It will log on and patiently wait for someone to challenge it. It will reject any formats it isn't explicitly designed to accept (as specified in `formats.json`), and it will do its best to battle in any formats it does accept. It can pick up and play existing battles, and it will eagerly do so with no regard to whether it knows the format.

It can be configured to play ranked battles when it has nothing else going on. See [Configuration](#configuration) below for more details.

The Very Bot records its win-loss records against individual opponents. It remembers both the cumulative record and the record for the current version of its AI.

## AI limitations

The current version of this bot (AI version 0.2) has a fairly simple AI, which can be summarized as follows:
* For each matchup, determine each team member's optimal move (based on how much damage it is expected to deal). Pick the Pokémon with the best matchups.
* Once battle has started, pick the most damaging move.

The bot doesn't currently care about boosting its stats, inflicting status, or anything else that isn't pure damage, although it knows how to deal with these things if they happen during a match. That said, it's more effective than you might expect.

### To-do list

In roughly descending order by priority:
* Adjust for type-boosting held items
* Properly evaluate and use status-inflicting moves and Recover/Roost/Rest
* Take Speed and bulk into account when deciding which Pokémon to pick
* Eliminate penalty for "must recharge" moves (e.g. Hyper Beam) when it appears the move will KO
* Properly evaluate the power of Return/Frustration
* Don't use Future Sight/Doom Desire when it's already active

### Version history

In AI v0.2, the bot learned to recognize stat boosts, status effects, and type-nullifying abilities.

In AI v0.1 (the initial version), the bot was able to pick Pokémon and moves based on how much damage it expected them to deal under normal circumstances.

## Running the bot

Want to run the bot on your own computer? You'll need the following:
* A Showdown account
* [PhantomJS](http://phantomjs.org)
* The code in this repository

Once you've downloaded PhantomJS and The Very Bot, edit `credentials.json` with your Showdown credentials. (You can run The Very Bot on your own account, but you may want to make a separate account for it -- see below.) After that, to get the bot running:
```
phantomjs showdown.js
```
(This assumes that your working directory contains the Very Bot scripts and that the PhantomJS executable is in your path or in that directory. Adjust accordingly.)

**WARNING:** The Very Bot will hijack any and all games on its account after it starts running, whether or not it has any idea how to play that format. Don't use the bot on an account that you're currently using to battle.

### Configuration

The following options are available in `config.json`:
* `ranked`: The name of a format to autoqueue (e.g. `challengecup1v1`), or `false` if you don't want the bot to queue. Despite the name, unranked formats are OK. The bot only queues when it has no ongoing battles.
* `queueInterval`: How many three-second intervals to wait before autoqueueing. At 0 or 1, it will queue immediately as soon as it realizes it has nothing going on. A value of at least 2 is recommended so that you have an opportunity to halt the bot between matches if desired.
* `feedback`: The path to the file where feedback should be gathered, or `false` if you don't want to accept feedback. The path to this file must already exist (although the file itself will be created if it doesn't exist).

## Is this OK?

Showdown staff member blizzardq said,
```
a cc1v1 bot should be ok
```
So yeah, it should be!
