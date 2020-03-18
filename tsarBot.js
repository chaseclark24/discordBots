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

	if (command === 'roll') {
		max = Math.floor(parseInt(args[0]));
		min = Math.ceil(1);

		if (isNaN(max)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		} 

		return message.reply(Math.floor(Math.random() * (max - min + 1)) + min);
	}







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


	if (command === 'cv') {
		if (args == ''){
			request('https://covid19.mathdro.id/api', function (error, response, body) {
		    	if (!error && response.statusCode == 200) {
		    	
		        	var json = JSON.parse(body); 
		        	console.log(args)
					var confirmed = json.confirmed.value
					var recovered = json.recovered.value
					var deaths = json.deaths.value
				
					var affected = confirmed + recovered + deaths

					var confirmedPer=Math.round(confirmed/affected*100)
					var deathsPer = Math.round(deaths/affected*100)
					var recoveredPer = Math.round(recovered/affected*100)


					message.reply("Total confirmed to have CV: " + `${confirmed.toLocaleString('en')}` + " - " + `${confirmedPer}` + "%");
					message.reply("Total confirmed recovered from CV: " + `${recovered.toLocaleString('en')}` + " - " + `${recoveredPer}` + "%");
					message.reply("Total confirmed died from CV: " + `${deaths.toLocaleString('en')}` + " - " + `${deathsPer}` + "%");

		     	}
			})


		}
		else{	

			var today = new Date();
			var dd = String(today.getDate()).padStart(2, '0') -1; //subtracting one to pull yesterday
			var mm = String(today.getMonth() + 1).padStart(2, '0'); 
			var yyyy = today.getFullYear();
			today = mm + '/' + dd + '/' + yyyy;
			var url = 'https://covid19.mathdro.id/api/daily/' + mm + '-' + dd +'-' + yyyy
			request(url, function (error, response, body) {
	    		if (!error && response.statusCode == 200) {
	        		var json = JSON.parse(body); 
		 			function myFunction(dataFromServer){ 
		       			for (var i=0;i<dataFromServer.length;i++) { 
		            		if (dataFromServer[i].provinceState == args){
		            			message.reply(`${dataFromServer[i].provinceState}` + " COVID19 Cases - last update:  " + `${dataFromServer[i].lastUpdate}` + "\nConfirmed: " + `${dataFromServer[i].confirmed}` + "  Recovered: " + `${dataFromServer[i].recovered}` + "  Deaths: " + `${dataFromServer[i].deaths}`)
		            			return
		            		}       
		         		}
		 			}	
	 			myFunction(json)
	     		}
			})




		}

	}




});

client.login(token);