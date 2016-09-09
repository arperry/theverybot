# (I Wanna Be) The Very Bot

###### Like No Bot Ever Was

The Very Bot is a PhantomJS bot for Challenge Cup 1v1 battles on [Pokémon Showdown](http://www.pokemonshowdown.com). In this format, players are presented with a randomly-generated team. They must choose one Pokémon on their team to do battle, and they can't switch. The limited scope of the format makes the AI for this bot _relatively_ simple.

The same AI used for CC1v1 could easily be applied to the 1v1 format, which is the same except that players supply their own teams. I don't currently have any plans to attempt this, but if you do it, I'd love to hear about it.

## State of the Bot

The Very Bot is currently battle-capable. It will log on and patiently wait for someone to challenge it. It will reject any formats it isn't explicitly designed to accept (as specified in `formats.json`), and it will do its best to battle in any formats it does accept.

In the future, The Very Bot will attempt to play ranked battles when it has nothing else going on.

### Missing features

The bot cannot currently determine if it won or lost. It therefore does not track its win/loss record.

The bot will eventually have an interface to solicit feedback from its opponents. I may regret this feature.

## AI limitations

The initial commit of this bot has a very simple AI, which can be summarized as follows:
* For each matchup, determine each team member's optimal move (based on how much damage it is expected to deal). Pick the Pokémon with the best matchups.
* Once battle has started, pick the most damaging move.

That's _it,_ which means, among other things:
* The bot will never use non-damaging moves if it can help it.
* The bot has no concept of status effects, stat boosts, and so forth.
* The bot thinks you are just as likely to pick Magikarp as Mewtwo, and it will weigh its choices accordingly.

That said, even with this limited AI, it's more effective than you might expect.

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

**WARNING:** The Very Bot will hijack any games on its account that begin after it starts running, whether or not it has any idea how to play that format. Don't use the bot on an account that you're currently using to battle.

## Is this OK?

Showdown staff member blizzardq said,
```
a cc1v1 bot should be ok
```
So yeah, it should be!
