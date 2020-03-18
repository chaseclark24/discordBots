const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
var request = require('request');
client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();


	if (command === 'ony') {
		const DAYS = 24 * 3600 * 1000;
		var resetTime = new Date("Dec 6, 2019 11:00:00 GMT-05:00").getTime()
		var interval = 5 * DAYS
		const now = new Date().getTime();
		while (resetTime < now) resetTime += interval
		const tSecs = Math.floor((resetTime - now) / 1000);
		const secs = tSecs % 60;
		const tMins = (tSecs - secs) / 60;
		const mins = tMins % 60;
		const tHours = (tMins - mins) / 60;
		const hours = tHours % 24;
		const days = (tHours - hours) / 24;
		const reset = new Date(resetTime);

		console.log(`${days}d ${hours}h ${mins}m ${secs}s`);
		message.reply("Time Until Ony Reset: " + `${days}d ${hours}h ${mins}m ${secs}s`);
		//console.log( $('#onyReset')[1].text() ); // input 
		message.reply("Ony Reset Date and Time: " + `${reset}`);
	}


});

client.login(token);