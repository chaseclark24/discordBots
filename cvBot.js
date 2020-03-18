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