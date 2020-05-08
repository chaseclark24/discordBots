const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const { wclToken } = require('./wclToken.json');
const client = new Discord.Client();
var request = require('request');
var cheerio = require('cheerio');
var statePops = require('./statePops.json');
client.once('ready', () => {
        console.log('Ready!');
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
                        if (args[2]){
                                message.channel.send(`too many args`);
                        }

                        else if (args.length === 1){
                                var url = 'https://classic.warcraftlogs.com/character/us/skeram/' + args[0];
                            request(url, function(err, resp, body){

                                $ = cheerio.load(body);
                                var list = [];
                                $('div[id="character-inset"]').find('div > div > div > div > div > div > span').each(function (index, element) {
                                list.push($(element).html())
                                 });
                                var bwlRank = list[1]
                                var mcRank = list[3]

                                                        
                                const rankReport = new Discord.MessageEmbed()
                                    .setColor('#4A24D4')
                                    .setTitle('Current Player Ranking')
                                    .setURL(url)
                                    //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                                    .setDescription(args[0] + ' - Skeram')
                                    .setThumbnail('https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/favicon.png')
                                    .addFields(
                                        { name: 'BWL Ranking', value: `${bwlRank}`, inline: true},
                                        { name: 'MC Ranking', value: `${mcRank}`, inline: true }
                                    )
                                    //.addField('Inline field title', 'Some value here', true)
                                    //.setImage('https://i.imgur.com/wSTFkRM.png')
                                    .setTimestamp()
                                    .setFooter('Data: classic.warcraftlogs.com/');
                                message.channel.send(rankReport);


                                 });

                        }

                        else if (args[1].toUpperCase() === "BWL") {

                            var url = 'https://classic.warcraftlogs.com/character/us/skeram/' + args[0];
                            request(url, function(err, resp, body){

                                $ = cheerio.load(body);
                                console.log(body.length)
                                                                var list = [];
                                $('div[id="character-inset"]').find('div > div > div > div > div > div > span').each(function (index, element) {
                                        list.push($(element).html())
                                });

                                var bwlRank = list[1]
                                var mcRank = list[3]
                                var url2 = 'https://classic.warcraftlogs.com/v1/rankings/character/' + args[0] + '/skeram/us?api_key=' + wclToken ;
                                var rankings = []
                                var ranking = {}
                                request(url2, function (error, response, body) {
                                        var bwlJson = JSON.parse(body);
                                                                if (typeof bwlJson[0] != 'undefined') {/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                    
                                                                    

                                    for (var i=0;i<bwlJson.length;i++) {
                                        ranking = {encounterName: bwlJson[i].encounterName, rank: bwlJson[i].rank, outOf: bwlJson[i].outOf, percentile: bwlJson[i].percentile }                                                 
                                        rankings.push(ranking)
                                       
                                    }
                                    var fields = []
                                                                        var field = {}
                                    bwlRankField = { name: 'BWL Ranking', value: `${bwlRank}`, inline: true}
                                                                        //mcRankField = { name: 'MC Ranking', value: `${mcRank}`, inline: true }
                                                                        spaceField = { name: 'BWL Ranking', value: `${bwlRank}`, inline: true}
                                                                        //fields.push({ name: 'MC Ranking', value: `${mcRank}`, inline: true })
                                                                        fields.push({ name: 'BWL Ranking', value: `${bwlRank}`, inline: true})
                                                                        fields.push({ name: 'Class/Spec', value: `${bwlJson[0].class}/${bwlJson[0].spec}`, inline: true})

                                                                        for (var i=0;i<rankings.length;i++) {
                                                                                field = { name: `${rankings[i].encounterName} Rank - Out Of - Percentile`, value: `${rankings[i].rank} - ${rankings[i].outOf} - ${Math.round(rankings[i].percentile * 100) / 100}`}
                                                                                fields.push(field)
                                                                        } 
                                                        
                                        const rankReport = new Discord.MessageEmbed()
                                        .setColor('#4A24D4')
                                        .setTitle('Current Player Rankings')
                                        .setURL(url)
                                        .setDescription(args[0] + ' - Skeram')
                                        .setThumbnail('https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/favicon.png')
                                        .addFields(fields)
                                                .setTimestamp()
                                                .setFooter('Data: classic.warcraftlogs.com/');
                                            message.channel.send(rankReport);

                                         }


                                        else{
                                                message.channel.send("Complete rank record unavailable.");

                                        }
                                     }); //end req2       

                                });//req 1
                                                

                                        }


                                        else if (args[1].toUpperCase() === "MC") {

                            var url = 'https://classic.warcraftlogs.com/character/us/skeram/' + args[0];
                            request(url, function(err, resp, body){

                                $ = cheerio.load(body);
                                                                var list = [];
                                $('div[id="character-inset"]').find('div > div > div > div > div > div > span').each(function (index, element) {
                                        list.push($(element).html())
                                });

                                var bwlRank = list[1]
                                var mcRank = list[3]
                                var url2 = 'https://classic.warcraftlogs.com/v1/rankings/character/' + args[0] + '/skeram/us?zone=1000&api_key=' + wclToken ;
                                var rankings = []
                                var ranking = {}
                                request(url2, function (error, response, body) {
                                        var mcJson = JSON.parse(body);
                                                                if (typeof mcJson[0] != 'undefined') {
                                                                    
                                                                    

                                    for (var i=0;i<mcJson.length;i++) {
                                        ranking = {encounterName: mcJson[i].encounterName, rank: mcJson[i].rank, outOf: mcJson[i].outOf, percentile: mcJson[i].percentile }
                                        rankings.push(ranking)
                                    }
                                    var fields = []
                                                                        var field = {}
                                    //bwlRankField = { name: 'BWL Ranking', value: `${bwlRank}`, inline: true}
                                                                        mcRankField = { name: 'MC Ranking', value: `${mcRank}`, inline: true }
                                                                        //spaceField = { name: 'BWL Ranking', value: `${bwlRank}`, inline: true}
                                                                        fields.push({ name: 'MC Ranking', value: `${mcRank}`, inline: true })
                                                                        fields.push({ name: 'Class/Spec', value: `${mcJson[0].class}/${mcJson[0].spec}`, inline: true})
                                                                        //fields.push({ name: 'BWL Ranking', value: `${bwlRank}`, inline: true})

                                                                        for (var i=0;i<rankings.length;i++) {
                                                                                field = { name: `${rankings[i].encounterName} Rank - Out Of - Percentile`, value: `${rankings[i].rank} - ${rankings[i].outOf} - ${Math.round(rankings[i].percentile * 100) / 100}`}
                                                                                fields.push(field)
                                                                        } 
                                                        
                                        const rankReport = new Discord.MessageEmbed()
                                        .setColor('#4A24D4')
                                        .setTitle('Current Player Rankings')
                                        .setURL(url)
                                        .setDescription(args[0] + ' - Skeram')
                                        .setThumbnail('https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/favicon.png')
                                        .addFields(fields)
                                                .setTimestamp()
                                                .setFooter('Data: classic.warcraftlogs.com/');
                                            message.channel.send(rankReport);

                                         }
                                         else{
                                                message.channel.send("Complete rank record unavailable.");

                                        }
                                     }); //end req2       

                                });//req 1
                                                

                                        }

                                   
                                }


        if (command === 'tsarbot' || command === 'czarbot') {
            
                help = "```!ony " +
                                "\nReports the next reset time for onyxia. "+
                                "\n!zg "+
                                "\nReports the next reset time for Zul Gurub. "+
                                "\n!roll [x] "+
                                "\nGenerates a random number between 1 and x. "+
                                "\n!cv [state] "+
                                "\nCV will generate a COVID 19 status update. State is an optional argument. If no state is provided, worldwide counts will be provided. "+
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


        if (command === 'dmf') {
                var d = new Date(),
                        month = d.getMonth(),
                        openEndDates = [];
                        saturdays = [];
                        sat = new Date();
                        sun = new Date();
                    d.setDate(1);

                    // Get the first Monday and satuday in the month
                    while (d.getDay() !== 1) {
                        d.setDate(d.getDate() + 1);
                        sat.setDate(d.getDate()+6);
                    }
                    openEndDates.push(new Date(d.getTime()));
                    openEndDates.push(new Date(sat.getTime()));

                    // Get first monday and saturday of next month
                    while (d.getMonth() === month ) {
                        d.setDate(d.getDate() + 7);
                    }
                    openEndDates.push(new Date(d.getTime()));//push monday
                    d.setDate(d.getDate() + 6); //generate saturday
                    openEndDates.push(new Date(d.getTime()));//push saturday

                    //date formatting
                    const openDate = openEndDates[0].toString().split(" ")[0] + " " + openEndDates[0].toString().split(" ")[1] + " " + openEndDates[0].toString().split(" ")[2]  ;
                    const nOpenDate= openEndDates[2].toString().split(" ")[0] + " " + openEndDates[2].toString().split(" ")[1] + " " + openEndDates[2].toString().split(" ")[2] ;
                    const endDate = openEndDates[1].toString().split(" ")[0] + " " + openEndDates[1].toString().split(" ")[1] + " " + openEndDates[1].toString().split(" ")[2] ;
                    const nEndDate = openEndDates[3].toString().split(" ")[0] + " " + openEndDates[3].toString().split(" ")[1] + " " + openEndDates[3].toString().split(" ")[2] ;

                    


                        const dmfReport = new Discord.MessageEmbed()
                        .setColor('#9966ff')
                        .setTitle('Darkmoon Faire Schedule')
                        .setURL('https://classic.wowhead.com/guides/classic-darkmoon-faire')
                        //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                        .setDescription( 'Here is the DMF schedule for this month and next month.')
                        .setThumbnail('https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fvignette1.wikia.nocookie.net%2Fwowwiki%2Fimages%2Ff%2Ff1%2FDarkmoon_faire_banner.png%2Frevision%2Flatest%2Fscale-to-width-down%2F107%3Fcb%3D20140216194729&f=1&nofb=1')
                        .addFields(
                                { name: 'Open Date This Month', value: `${openDate}`, inline:true},
                                { name: 'End Date This Month', value: `${endDate}`, inline: true},
                                {name: '\u200b',value: '\u200b',inline: false,},
                                { name: 'Open Date Next Month', value: `${nOpenDate}`, inline:true},
                                { name: 'End Date Next Month', value: `${nEndDate}` , inline:true}
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




});

client.login(token);
