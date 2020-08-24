const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { wclToken } = require('./wclToken.json');
const { Client } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
var request = require('request');
var cheerio = require('cheerio');
var statePops = require('./statePops.json');
client.once('ready', () => {
        console.log('Ready!');
});



//singe choice polls
client.on('messageReactionAdd', async (reaction, user) => {

    currentReaction = reaction.emoji.name;
    currentReactor = user.id;

    
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    //only review single choice poll reactions
    if (client.user.id === reaction.message.author.id && reaction.message.embeds[0].description === 'single choice poll'){

        channel = client.channels.cache.get(reaction.message.channel.id);

        channel.messages.fetch(reaction.message.id).then(messages => {
           
            fullReactorsList = []

            //two for loops to look through keys and values of previous reactions, ugly code
            for (let entry of messages.reactions.cache) { 
             
                 for (let key of entry[1].users.cache.keys()){
                    reaction = {}
                    emoji = entry[0]
                    reaction = {emoji : entry[0], reactor: key}
                    fullReactorsList.push(reaction)    //push the emoji and reactor of previous reactions for this post

                 }


            }

            fullReactorsList.forEach(function (item, index) {
              //if current reactor already exist in the list of reactors
              //AND the current reactor is not the bot
              //AND the current reaction does not equal the emoji found in previous reactions list
              //remove previous reaction  
                if (item.reactor === currentReactor && currentReactor != client.user.id && currentReaction != item.emoji){
                    messages.reactions.resolve(item.emoji).users.remove(currentReactor);
                }
            });
        

        });

        

    }

});




client.on('message', message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        var args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();



        

        if (command === 'roll') {
                max = Math.floor(parseInt(args[0]));
                min = Math.ceil(1);

                if (isNaN(max)) {
                        return message.reply('that doesn\'t seem to be a valid number.');
                }

                return message.reply(Math.floor(Math.random() * (max - min + 1)) + min);
        }



        if (command === 'rank') {
            if (args.length > 1){
                    message.channel.send(`too many args`);
            }

            else if (args.length === 1){
                var url = 'https://classic.warcraftlogs.com/character/us/skeram/' + args[0];
                request(url, function(err, resp, body){

                    $ = cheerio.load(body);

                    messageFields = []

                    //loop through the header elements to find the player ranks
                    for (let i = 2; i < 5; i++) {
                        messageObj= {}
                        messageObj.name = $("#character-inset > div:nth-child("+i+") > div.header-zone-name").text()
                        messageObj.value = $("#character-inset > div:nth-child("+i+") > div.header-zone-icon-and-points > div.header-zone-ranks-container > div.header-zone-ranks > div.header-zone-positions.has-rank > div > span").text() 
                        messageObj.inline = false
                        

                        if (messageObj.name && messageObj.value ){
                            messageFields.push(messageObj)
                        }
                       
                    }

                    //custom message for players with no rankings
                    if (messageFields.length === 0){
                        return message.channel.send("Rankings do not exist for this player.");

                    }
                    

                                            
                    const rankReport = new Discord.MessageEmbed()
                        .setColor('#4A24D4')
                        .setTitle('Current Player Ranking')
                        .setURL(url)
                        //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                        .setDescription(args[0] + ' - Skeram')
                        .setThumbnail('https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/favicon.png')
                        .addFields(
                            messageFields
                        )
                        //.addField('Inline field title', 'Some value here', true)
                        //.setImage('https://i.imgur.com/wSTFkRM.png')
                        .setTimestamp()
                        .setFooter('Data: classic.warcraftlogs.com/');
                    message.channel.send(rankReport);


                     });

            }

                        
                                                

        }

                                   
                                


        if (command === 'tsarbot' || command === 'czarbot') {
            
                help = "```!ony " +
                                "\nReports the next reset time for onyxia. "+
                                "\n!zg "+
                                "\nReports the next reset time for Zul Gurub. "+
                                "\n!dmf "+
                                "\nReports the next reset time for Dark Moon Faire. "+
                                "\n!roll [x] "+
                                "\nGenerates a random number between 1 and x. "+
                                "\n!cv [state] "+
                                "\nCV will generate a COVID 19 status update. State is an optional argument. If no state is provided, worldwide counts will be provided. "+
                                "\n!poll [question] | [option 1] | [option 2] | etc..."+
                                "\nGenerates a poll. Options are optional. If no options are specified, the poll will be yes/no. You can add as many options as you like."+
                                "\n!pollmc [question] | [option 1] | [option 2] | etc... "+
                                "\nGenerates a poll, similar to above, with the only difference that people can vote on multiple options. "+
                                "\n!rank [player] [server]"+
                                "\nGenerates current warcraft logs ranking for the provided player. Server is optional. If no server is provided the default is skeram. ```"

                message.channel.send(help);
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
                const reset = new Date(resetTime).toString();
                const resetString = reset.split(" ")[0] + " " + reset.split(" ")[1] + " " + reset.split(" ")[2] ;

                const onyReport = new Discord.MessageEmbed()
                .setColor('#ff5c33')
                .setTitle('Onyxia Reset Timer')
                .setURL('https://raidreset.com/')
                .setThumbnail('https://gamepedia.cursecdn.com/hearthstone_gamepedia/thumb/7/7a/Onyxia_-_WoW.png/400px-Onyxia_-_WoW.png?version=a4ed3c4ea4d675b1472bdfc5b359c7aa')
                .addFields(
                        { name: 'Time Until Next Reset', value: `${days}d ${hours}h ${mins}m ${secs}s`, inline:true},
                        { name: 'Reset Date', value: `${resetString}`, inline: true},
                )
                .setTimestamp()
                message.channel.send(onyReport);

        }

        if (command === 'zg') {
                const DAYS = 24 * 3600 * 1000;
                var resetTime = new Date("Apr 16, 2020 11:00:00 GMT-05:00").getTime()
                var interval = 3 * DAYS
                const now = new Date().getTime();
                while (resetTime < now) resetTime += interval
                const tSecs = Math.floor((resetTime - now) / 1000);
                const secs = tSecs % 60;
                const tMins = (tSecs - secs) / 60;
                const mins = tMins % 60;
                const tHours = (tMins - mins) / 60;
                const hours = tHours % 24;
                const days = (tHours - hours) / 24;
                const reset = new Date(resetTime).toString();
                const resetString = reset.split(" ")[0] + " " + reset.split(" ")[1] + " " + reset.split(" ")[2] ;
                const nextReset = new Date(resetTime += interval).toString();
                const nextResetString = nextReset.split(" ")[0] + " " + nextReset.split(" ")[1] + " " + nextReset.split(" ")[2] ;
                const nextNextReset = new Date(resetTime += interval).toString();
                const nextNextResetString = nextNextReset.split(" ")[0] + " " + nextNextReset.split(" ")[1] + " " + nextNextReset.split(" ")[2] ;


                const zgReport = new Discord.MessageEmbed()
                .setColor('#285818')
                .setTitle('Zul Gurub Reset Timer')
                .setURL('https://us.forums.blizzard.com/en/wow/t/zulgurub-raid-resets/491994')
                //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                .setDescription( 'Here are the next 3 ZG reset dates. Resets occur at 12PM server time.')
                .setThumbnail('https://static.boostbay.com/site/images/landing/common/first-block/classic/10_raids_zulgurub-boost_max.png')
                .addFields(
                        { name: 'Time Until Next ZG Reset', value: `${days}d ${hours}h ${mins}m ${secs}s`, inline:true},
                        { name: 'ZG Reset Date and Time', value: `${resetString}`, inline: true},
                        {name: '\u200b',value: '\u200b',inline: false,},
                        { name: 'Reset Date and Time 2', value: `${nextResetString}`, inline:true},
                        { name: 'Reset Date and Time 3', value: `${nextNextResetString}` , inline:true}
                )

                //.setImage('https://i.imgur.com/wSTFkRM.png')
                .setTimestamp()
                //.setFooter('Source: us.forums.blizzard.com/en/wow/t/zulgurub-raid-resets/491994');
                message.channel.send(zgReport);

        }


        if (command === 'aq') {
                const DAYS = 24 * 3600 * 1000;
                var resetTime = new Date("Apr 16, 2020 11:00:00 GMT-05:00").getTime()
                var interval = 3 * DAYS
                const now = new Date().getTime();
                while (resetTime < now) resetTime += interval
                const tSecs = Math.floor((resetTime - now) / 1000);
                const secs = tSecs % 60;
                const tMins = (tSecs - secs) / 60;
                const mins = tMins % 60;
                const tHours = (tMins - mins) / 60;
                const hours = tHours % 24;
                const days = (tHours - hours) / 24;
                const reset = new Date(resetTime).toString();
                const resetString = reset.split(" ")[0] + " " + reset.split(" ")[1] + " " + reset.split(" ")[2] ;
                const nextReset = new Date(resetTime += interval).toString();
                const nextResetString = nextReset.split(" ")[0] + " " + nextReset.split(" ")[1] + " " + nextReset.split(" ")[2] ;
                const nextNextReset = new Date(resetTime += interval).toString();
                const nextNextResetString = nextNextReset.split(" ")[0] + " " + nextNextReset.split(" ")[1] + " " + nextNextReset.split(" ")[2] ;


                const zgReport = new Discord.MessageEmbed()
                .setColor('#ff9966')
                .setTitle('AQ20 Reset Timer')
                //.setURL('https://us.forums.blizzard.com/en/wow/t/zulgurub-raid-resets/491994')
                //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                .setDescription( 'Here are the next 3 AQ reset dates. Resets occur at 12PM server time.')
                .setThumbnail('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgamepedia.cursecdn.com%2Fwowpedia%2F0%2F0f%2FHorisath.png%3Fversion%3D00098f101a4174b305224ff985821d31&f=1&nofb=1')
                .addFields(
                        { name: 'Time Until Next AQ20 Reset', value: `${days}d ${hours}h ${mins}m ${secs}s`, inline:true},
                        { name: 'AQ20 Reset Date and Time', value: `${resetString}`, inline: true},
                        {name: '\u200b',value: '\u200b',inline: false,},
                        { name: 'Reset Date and Time 2', value: `${nextResetString}`, inline:true},
                        { name: 'Reset Date and Time 3', value: `${nextNextResetString}` , inline:true}
                )

                //.setImage('https://i.imgur.com/wSTFkRM.png')
                .setTimestamp()
                //.setFooter('Source: us.forums.blizzard.com/en/wow/t/zulgurub-raid-resets/491994');
                message.channel.send(zgReport);

        }


        if (command === 'dmf') {
                var d = new Date();
                month = d.getMonth();
                var dmfTimes = {
                        0: "01/03-01/06",
                        1: "02/10-02/16",
                        2: "03/09-03/15",
                        3: "04/06-04/12",
                        4: "05/04-05/10",
                        5: "06/08-06/14",
                        6: "07/06-07/12",
                        7: "08/10-08/16",
                        8: "09/07-09/13",
                        9: "10/05-10/11",
                        10: "11/09-11/15",
                        11: "12/07-12/13",
                        
                };

                start1=dmfTimes[month].split("-")[0];
                end1=dmfTimes[month].split("-")[1];
                start2=dmfTimes[month+1].split("-")[0];
                end2=dmfTimes[month+1].split("-")[1];     
                    


                        const dmfReport = new Discord.MessageEmbed()
                        .setColor('#9966ff')
                        .setTitle('Darkmoon Faire Schedule')
                        .setURL('https://classic.wowhead.com/guides/classic-darkmoon-faire')
                        //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                        .setDescription( 'Here is the DMF schedule for this month and next month.')
                        .setThumbnail('https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fvignette1.wikia.nocookie.net%2Fwowwiki%2Fimages%2Ff%2Ff1%2FDarkmoon_faire_banner.png%2Frevision%2Flatest%2Fscale-to-width-down%2F107%3Fcb%3D20140216194729&f=1&nofb=1')
                        .addFields(
                                { name: 'Open Date This Month', value: `${start1}`, inline:true},
                                { name: 'End Date This Month', value: `${end1}`, inline: true},
                                {name: '\u200b',value: '\u200b',inline: false,},
                                { name: 'Open Date Next Month', value: `${start2}`, inline:true},
                                { name: 'End Date Next Month', value: `${end2}` , inline:true}
                        )

                        //.setImage('https://i.imgur.com/wSTFkRM.png')
                        .setTimestamp()
                        //.setFooter('Source: us.forums.blizzard.com/en/wow/t/zulgurub-raid-resets/491994');
                        message.channel.send(dmfReport);

        }


        if (command === 'cv') {
                if (args == ''){
                        request('https://covid19.mathdro.id/api', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                                console.log()
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

                        if (args[1]){
                                args = args.join(" ");
                        }
                        else{
                                args = args[0]
                        }
                        var url = 'https://corona.lmao.ninja/v2/states'
                        request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                                var covidJson = JSON.parse(body);

                                        for (var i=0;i<covidJson.length;i++) {
                                        if (covidJson[i].state.toUpperCase() == args.toUpperCase()){

                                                for (var j=0; j < statePops.length; j++)
                                                                if (statePops[j].state.toUpperCase() == args.toUpperCase()){
                                                                        var cpm = ( covidJson[i].active / (statePops[j].pop / 1000000) ).toFixed(2);
                                                                        var recovered = covidJson[i].cases - covidJson[i].active
                                                                        console.log(recovered);
                                                                        console.log(covidJson[i].active);
                                                                        console.log(covidJson[i].deaths);

                                                                        const flashReport = new Discord.MessageEmbed()
                                                                                .setColor('#0099ff')
                                                                                .setTitle('COVID Flash Report')
                                                                                .setURL('https://www.worldometers.info/coronavirus/')
                                                                                //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                                                                                .setDescription('Breakdown of cases in ' + `${covidJson[i].state}`)
                                                                                .setThumbnail('https://assets.dmagstatic.com/wp-content/uploads/2020/03/COVID-19_2871.jpg')
                                                                                .addFields(
                                                                                        { name: 'Confirmed', value: `${covidJson[i].active.toLocaleString('en')}`, inline: true },
                                                                                        { name: 'Cases Today', value: `${covidJson[i].todayCases.toLocaleString('en')}`, inline: true },
                                                                                        { name: 'Deaths', value: `${covidJson[i].deaths.toLocaleString('en')}`, inline: true },
                                                                                        //{ name: '\u200B', value: '\u200B' },
                                                                                        { name: 'State Population', value: `${statePops[j].pop.toLocaleString('en')}`, inline: true },
                                                                                        { name: 'Cases Per Million', value: `${cpm.toLocaleString('en')}`, inline: true },
                                                                                )
                                                                                //.addField('Inline field title', 'Some value here', true)
                                                                                //.setImage('https://i.imgur.com/wSTFkRM.png')
                                                                                .setTimestamp()
                                                                                .setFooter('Data: worldometers.info/coronavirus/');
                                                                                message.channel.send(flashReport);

                                                                return
                                                        }
                                        }
                                        }
                                        }
                        })
                }
        }






        
        if (command === 'poll' || command === 'pollmc') {
                //console.log(args[0])
                args = args.join(" ");
                args = args.split("|");
                //console.log(args.length)
                if (args.length === 2 ){
                        message.reply("You have only specified one choice on your poll. When defining choices you need to select at least two.")
                        return
                }
                if (args[2]){
                        //do multiple options poll
                        //args = args.join(" ");
                        console.log(args)
                        messageFields = []
                        emojiLookup = ["🟦","🟥",  "🟧", "🟩","🟨","🟪","🟫","🔴","🟠","🟡","🟢","🔵","🟣",
                                        "🟤","🔶","🔷","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒"
                                        ,"♓","⛎","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟",
                                        "🔺","🔻","🔸","🔹"]

                                         


                        indexCount = 0
                        
                        //for each choice you define, create a field item for the embedded message
                        args.forEach(function (choice, index) {
                                //console.log(choice, index);
                                if(index > 0){
                                        indexCount = indexCount+1

                                        messageObj= {}
                                        messageObj.name = emojiLookup[index-1]
                                        messageObj.value = choice 
                                        messageObj.inline = true
                                        console.log(messageObj)
                                        messageFields.push(messageObj)
                                        //messageFields.push("{ name: '" + index + "', value: '" + choice + "', inline: true },")
                                }
                        });
                        //console.log(messageFields)

                        //generate the embedded message based on the fields we created above
                        if ( command === 'pollmc'){
                            console.log("polmc")
                            const flashReport = new Discord.MessageEmbed()
                                    .setColor('#66ffff')
                                    .setTitle(args[0])
                                    .addFields(
                                            messageFields
                                    )
                            .setTimestamp()
                            message.channel.send(flashReport)
                        } else{ //single choice poll
                            const flashReport = new Discord.MessageEmbed()
                                    .setColor('#66ffff')
                                    .setDescription('single choice poll')
                                    .setTitle(args[0])
                                    .addFields(
                                            messageFields
                                    )
                            .setTimestamp()
                            message.channel.send(flashReport)

                        }

                        //find the message and add reactions relating to each choice
                        const filter = m => m.author.id === client.user.id;
                        const collector = message.channel.createMessageCollector(filter, { time: 2000 });
                      
                        collector.on('collect', m => {
                                //console.log(`Collected ${m.id}`);
                                //console.log(indexCount)
                                for (var i = 0; i < indexCount; i++){
                                        //console.log("inside loop - indexcount " + indexCount + "index =" + i)
                                        m.react(emojiLookup[i]);  

                                }
                         });


                }
                else{   
                        //do yes/no poll
                        //console.log(args[0])
                        //generate embedded message
                        if ( command === 'pollmc'){
                            const flashReport = new Discord.MessageEmbed()
                                    .setColor('#66ffff')
                                    .setTitle(args[0])
                                    .addFields(
                                            { name: 'Yes', value: `👍`, inline: true },
                                            //{ name: '\u200B', value: '\u200B' },
                                            { name: 'No', value: `👎`, inline: true },
                                    )
                                    .setTimestamp()
                            message.channel.send(flashReport)
                        } else{ //single choice poll
                            const flashReport = new Discord.MessageEmbed()
                                    .setColor('#66ffff')
                                    .setTitle(args[0])
                                    .setDescription('single choice poll')
                                    .addFields(
                                            { name: 'Yes', value: `👍`, inline: true },
                                            //{ name: '\u200B', value: '\u200B' },
                                            { name: 'No', value: `👎`, inline: true },
                                    )
                                    .setTimestamp()
                            message.channel.send(flashReport)
                        }

                        //find the message and add reactions
                        const filter = m => m.author.id === client.user.id;
                        const collector = message.channel.createMessageCollector(filter, { time: 2000 });
                      
                        collector.on('collect', m => {
                                //console.log(`Collected ${m.id}`);
                                m.react('👍');
                                m.react('👎');
                         });


                }


        }



});






client.login(token);

