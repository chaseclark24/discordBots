const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'roll') {
		max = Math.floor(parseInt(args[0]));
		min = Math.ceil(1);

		if (isNaN(max)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		} 

		return message.reply(Math.floor(Math.random() * (max - min + 1)) + min);
	}
});

client.login(token);