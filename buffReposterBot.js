const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
const fs = require('fs') 
const sqlite3 = require('sqlite3').verbose();


process.on('unhandledRejection', (reason, promise) => { //send all unhandled rejections to the database for analysis
        console.log('Unhandled Rejection at:', promise, 'reason:', reason); 
        logError(reason.path,reason);

        if (reason.message === 'Cannot edit a message authored by another user'){
                cid = reason.path.split('/')[4]
                removeChannel(cid);
        }
        
});




client.once('ready', () => {
        console.log('Ready!');
        setInterval(function() {
        checkTimers();
        }, 5 * 1000); //update every 5 seconds

});




client.on('message', message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        var args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();


        if (command === 'wb') {
                let channel = client.channels.get("717143529150873620"); //set this var to source channel 717143529150873620

                        channel.fetchMessages({ limit: 1 }).then(messages => { //pull the latest message from source channel
                        let lastMessage = messages.first(); 

                        if (!lastMessage.author.bot) {} //ignore messages from bots



                        message.reply(lastMessage.content)





                        let db = new sqlite3.Database('bt.db', (err) => {
                                if (err) {
                                    logError(error, "wb - db connect")
                                    console.error(err.message);
                                }
                                console.log('Connected to the bt database.');
                        });

                        db.run(`INSERT INTO buffTimers(buffTimers) VALUES(?)`, [lastMessage.content], function(err) {
                                if (err) {
                                        logError(error, "wb - insert")
                                        return console.log(err.message);
                                }
                                // get the last insert id
                                console.log(`A wb request row has been inserted with rowid ${this.lastID}`);
                        });

                        // close the database connection
                        db.close();

                })
             

        }



        if (command === 'repost') {

                var serverId = message.channel.guild.id;
                var channelId = message.channel.id;

                message.reply("Buff Timers will be reposted here.")

                let channel = client.channels.get(message.channel.id);


                channel.fetchMessages({ limit: 5 }).then(messages => { 
                        const botMessages = messages.filter(msg => msg.author.bot);


                        for (let [key, value] of messages) {

                          if (value.author.id = '734570898929090590'){



                                let db = new sqlite3.Database('bt.db', (err) => {
                                        if (err) {
                                            logError(error, "repost - db connect")
                                            console.error(err.message);
                                        }
                                        console.log('Connected to the bt database.');
                                });

                                db.run(`INSERT OR REPLACE INTO repostLocations VALUES(?, ?, ?)`, [serverId,channelId,key], function(err) { //need to double check the correct values are being passed to the database
                                        if (err) {
                                                logError(err.message, "repost - insert statement")
                                                return console.log(err.message);
                                        }
                                        // get the last insert id
                                        console.log(`A repost location row has been inserted with rowid ${this.lastID}`);
                                });

                                // close the database connection
                                db.close();

                                break;

                          }
                          

                        }
                        //console.log(botMessages)
                        //console.log(messages.message)



                })


        }



});

client.login(token);


var channel2 = ""


function checkTimers(){

        channel3 = client.channels.get("717143529150873620");
        channel3.fetchMessages({ limit: 1 }).then(messages => {
                var lastMessage3 = messages.first();

                //select statement needed here
                let db4 = new sqlite3.Database('bt.db');

                let sql = `select bufftimers from bufftimers`;

                db4.get(sql, (err, row) => {
                        if (err) {
                                return console.error(err.message);
                        }

                        //if the new timers match the old timers, do not continue
                        timers = lastMessage3.content;
                        if (lastMessage3.content === row.buffTimers){
                                //exit this function
                                console.log("current buff timers match ✅ not updating messages")
                                return;
                        }
                        else{
                                updateTimers(lastMessage3.content)
                        }

                        return row
                        
                

                });

                db4.close();



        })


}

function updateTimers(timers){

        //insert statement to add the latest timers
        let db5 = new sqlite3.Database('bt.db');

                
        db5.run(`UPDATE buffTimers SET buffTimers = (?)`, [timers], function(err) {
                if (err) {
                        return console.log(err.message);
                }
                
                console.log(`buffTimers Updated`);
        });

        // close the database connection
        db5.close();


        let statement2 = "SELECT sid, cid, mid FROM repostLocations";

        let db = new sqlite3.Database('bt.db', (err) => {
        if (err) {
                logError(error, "updateTimers - db connect")
                console.error(err.message);
        }
        console.log('Connected to the bt database.');
        });

        db.all(statement2, [], (err, rows) => {
                if (err) {
                        logError(error, "updateTimers - query")
                        return console.log(err.message);
                }
                // get the last insert id
                rows.forEach((row) => {    //iterate over all of the post locations


                        
                        channel = client.channels.get("717143529150873620");//ID SOURCE CHANNEL - this will need to be updated to skeram disc once approved

                        channel.fetchMessages({ limit: 1 }).then(messages => {
                                let lastMessage = messages.first();   //get the latest message from the channel to use as a source of information

                                if (!lastMessage.author.bot) {// The author of the last message wasn't a bot
                                }

                                channel2 = client.channels.get(row.cid)         //get information about the message to be updated
                               
                                if(!channel2){ 
                                        removeChannel(row.cid)
                                };

                                console.log("channel ID -" + channel2.id)
                                channel2.fetchMessages({around: row.mid, limit: 1})
                                        .then(msg => {
                                                console.log("editting message -" + row.mid)
                                                const fetchedMsg = msg.first();
                                                fetchedMsg.edit(lastMessage.content);   //update the message pulled from the database
                                        });
                                

                                    
                        })
                                            






                        console.log("query output - ")
                        console.log(row)
                        //console.log(row);
                });
                
        });



        // close the database connection
        db.close();


};


function removeChannel(cid){
        let db = new sqlite3.Database('bt.db', (err) => {
                if (err) {
                        console.error(err.message);
                }               
        });

        db.run(`DELETE FROM repostLocations WHERE cid=?` , cid, function(err) {
                if (err) {
                        return console.error(err.message);
                }
                console.log(`Row(s) deleted ${this.changes}`);
                });

        // close the database connection
        db.close((err) => {
                if (err) {
                        return console.error(err.message);
                }
        }); 

        logError("channel removal from handled exception","record deleted");  


};


function logError(error, programLocation){
        console.log("************************")
        console.log(error)
        var timestamp = new Date();
        var timestampDateFormatted = timestamp.toUTCString();

        let db = new sqlite3.Database('bt.db', (err) => {
                if (err) {
                        console.error(err.message);
                }
                console.log('Connected to the bt database.');
        });

        db.run(`INSERT INTO errors VALUES(?, ?, ?)`, [error,timestampDateFormatted,programLocation], function(err) { //need to double check the correct values are being passed to the database
                if (err) {
                        return console.log(err.message);
                }
        // get the last insert id
        console.log(`An error row has been inserted with rowid ${this.lastID}`);
        });

        // close the database connection
        db.close();


}