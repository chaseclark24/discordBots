const Discord = require('discord.js');
const {
    prefix,
    token
} = require('./config.json');
const client = new Discord.Client();
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const sourceChannel="749435709097639946"; //cisum buff channel
const SYMBOL_MAP = {
    "👹": "rend",
    "🐉": "ony",
    "🐲": "nef",
    "💗": "hakkar",
    "🥀": "bvsf",
    "👑": "dmt",
    "⚠️": "griefer"
};
const TIMER_NAMES = new Set(Object.values(SYMBOL_MAP));
const DATABASE_FILE_NAME = "bt.db";

/**
 * Send all unhandled rejections to the database for analysis
 */
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at - 🛑 - ', promise, 'reason:', reason);
    logError(reason.path, reason);

    if (reason.message === 'Cannot edit a message authored by another user') {
        let cid = reason.path.split('/')[2];
        console.log("mid =" + cid)
        removeChannel(cid, 'Cannot edit a message authored by another user');
        console.log("reason message is :" + reason.message);
        console.log("reason errno is :" + reason.errno);
        console.log("reason code is :" + reason.code);
    } else if (reason.message === 'Missing Permissions') {
        console.log("reason message is :" + reason.message);
        console.log("reason errno is :" + reason.errno);
        console.log("reason code is :" + reason.code);
    } else if (reason.message === 'Missing Access' ) {
        let cid = reason.path.split('/')[2];
        removeChannel(cid, 'Missing Access');
        console.log("reason message is :" + reason.message);
        console.log("reason errno is :" + reason.errno);
        console.log("reason code is :" + reason.code);
        console.log("restarting execution in 20 seconds")
        setTimeout(checkTimers, 20 * 1000);
    }
    else if (reason.message === "Cannot read property 'fetchMessages' of undefined"
        || reason.message === "Cannot read property 'edit' of undefined"
        || reason.message === "Cannot read property 'messages' of undefined"
        || reason.errno === 'EAI_AGAIN'
        || reason.code === 'ECONNRESET'
        || reason.code === 500
        || reason.errno === 'ENETUNREACH'
        || reason.path === '/api/v7/channels/644061609240690699/messages?limit=1'
    ){
        console.log("reason message is :" + reason.message);
        console.log("reason errno is :" + reason.errno);
        console.log("reason code is :" + reason.code);
        console.log("restarting execution in 20 seconds")
        setTimeout(checkTimers, 20 * 1000);
    } else {
        console.log("undefined exception");
        console.log("reason message is :" + reason.message);
        console.log("reason errno is :" + reason.errno);
        console.log("reason code is :" + reason.code);
    }
});

client.once('ready', () => {
    console.log('running version: 9_4_2020');
    checkTimers();
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'wb') {
        console.log("inside wb")
        const channel = client.channels.cache.get(sourceChannel); //set this var to source channel 
        channel.messages.fetch({
            limit: 1
        }).then(messages => { //pull the latest message from source channel
            const lastMessage = messages.first();
            console.log(lastMessage)
            //ignore messages from bots

            if (lastMessage.author.bot) {///////////////////needs to be changed back to !lastMessage.author.bot
                message.reply(lastMessage.content);
                const timestampDateFormatted = new Date().toUTCString();
                const db = getDatabase();

                db.run(`INSERT INTO wb(time) VALUES(?)`, [timestampDateFormatted], function (err) {
                    if (err) {
                        logError(error, "wb - insert");
                        return console.log(err.message);
                    }
                    // get the last insert id
                    console.log(`A wb request row has been inserted with rowid ${this.lastID}`);
                });

                // close the database connection
                db.close();
            }
        })
    }
    else if (command === 'subs' ) {
        const db = getDatabase();

        //check to see if this user already has a notification sub for this location
        const sql = `SELECT user,location FROM notifications WHERE user = ? and type = ?`;
        db.all(sql, [message.author.id, 'sub'], (err, rows) => {
            const subs = rows.map(row => row.location);
            if (subs.length === 0) {
                message.reply("You have no active subscriptions at this time.")
            } else {
                const flashReport = new Discord.MessageEmbed()
                    .setColor('#66ffff')
                    .setTitle("BRB - Sub Check")
                    //.setDescription(newUpdated)
                    .addFields({"name": "Active Subscriptions", "value": subs})
                    .setTimestamp();
                //.setFooter('To unsubscribe from th message type !' + locationName + 'sub')
                message.reply(flashReport)
            }
        });

        //insertNotification(message.author.id,"","subs")
        insertNotificationLog(message.author.id, "", "", "subs");
        //insertNotificationLog(user, command, type, "insert")

        db.close();
    }
    else if (TIMER_NAMES.has(command)) {
        //message.reply("notification logic")
        //console.log(message)
        const db = getDatabase();

        // check to see if this user already has a notification sub for this location
        const sql = `SELECT user,location,type FROM notifications WHERE user = ? AND location = ?`;

        db.get(sql, [message.author.id, command] , (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            //if there is no previous notification sub for this user+location then insert it
            if (!row) {
                insertNotification(message.author.id,command,"single");
                message.reply(`You will be notified with the latest on ${command}`);
            } else if (row.type === 'sub') {
                message.reply(`You already have an active subscription for updates on ${command}. This command was ignored. If you'd like to cancel the subscription and allow for one time updates, type !${command}sub`);
            } else if(row.type === 'single') {
                message.reply(`You already have a request pending for the latest update on ${command}. This command was ignored.`);
            }
        });
        db.close();
    }
    else if (command.endsWith("sub") && TIMER_NAMES.has(command.slice(0, -3))) {
        //message.reply("notification logic")
        //console.log(message)
        const db = getDatabase();
        let commandLocation = command.slice(0, -3);
        //check to see if this user already has a notification sub for this location
        const sql = `SELECT user,location,type FROM notifications WHERE user = ? AND location = ?`;
        db.get(sql, [message.author.id, commandLocation] , (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (!row) {
                // if there is no previous notification sub for this user+location then insert it
                insertNotification(message.author.id, commandLocation,"sub");
                message.reply(`You will receive a message with every update to ${commandLocation}. To unsubscribe from further updates, retype !${commandLocation}`);
            } else if (row.type === 'sub') {
                // if there is a previous notification sub for this location+user, unsub the user
                notificationRemoval(commandLocation, message.author.id, row.type);
                message.reply(`You have unsubscribed to updated on ${commandLocation}. To resubscribe to updates type !${commandLocation}` )
            } else if (row.type === 'single') {
                //if there is a single notification already for this location+user, overwrite with sub.
                notificationRemoval(commandLocation, message.author.id, row.type);
                message.reply(`You have a one-time request for updates on !${commandLocation} that was overwritten by this subscription. \n` +
                    `You will receive a message with every update to ${commandLocation}. To unsubscribe from further updates, retype !${commandLocation}`);
                insertNotification(message.author.id, commandLocation, "sub")
            }
        });
        db.close();
    }
    else if (command === 'unsuball') {
        const db = getDatabase();
        db.run(`DELETE FROM notifications WHERE user=? and type=?`, [message.author.id, "sub"], function (err) {
                if (err) {
                        return console.error(err.message);
                }
                onsole.log(`UNSUB: Row(s) deleted ${this.changes}`);
                message.reply(`Subs cleared: ${this.changes}`)
        });

            // close the database connection
        insertNotificationLog(message.author.id, "all", "all", "removal-unsuball")
        db.close();
    }
    else if (command === 'suball') {
        vals =[]
        Object.values(SYMBOL_MAP).forEach(val => {
                insertNotification(message.author.id, val,"sub")
                vals.push(val)
        })
        message.reply(`Subbed to: ` + vals)
        ;
    }
    else if (command === 'repost') {
        //pull server ID and channel ID from message details
        //console.log(message.channel.guild)
        if (message.channel.guild == null){
                message.reply('Currently reposting to DMs is not supported.')
                logError('repost', "repost requested to DM");
                return
        }
        const serverId = message.channel.guild.id;
        const channelId = message.channel.id;


        //pull the latest timers and reply to the !repost
        let db = getDatabase();
        const sql = `SELECT bufftimers FROM bufftimers`;
        db.get(sql, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            message.reply(row.buffTimers)
        });
        db.close();

        //pull the latest message from the bot and add it to the repost database
        if (client.user.lastMessage == null) {
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === client.user.id, { time: 10000 });
            collector.on('collect', message => {
                collector.stop("Got my message");
                let db = getDatabase();
                db.run(`INSERT OR REPLACE INTO repostLocations VALUES(?, ?, ?)`, [serverId, channelId, message.id], function (err) {
                    if (err) {
                        logError(err.message, "repost - insert statement");
                        return console.log(err.message);
                    }
                    // get the last insert id
                    console.log(`A repost location row has been inserted with rowid ${this.lastID}`);
                    console.log("sid: " + serverId);
                    console.log("cid: " + channelId);
                    console.log("mid: " + message.id);
                });

                // close the database connection
                db.close();
            })
        }
    }
    else if (command === 'brb' || command === 'buffreposterbot') {
        const help = "```!wb " +
            "\nReports the latest world buff times. " +
            "\n" +
            "\n!repost " +
            "\nMake a post that will automatically update with the latest buff times. " +
            "\nOne !repost is allowed per server. Only the latest !repost will be recognized by the bot. " +
            "\n" +
            "\n!ony !nef !rend !bvsf !hakkar !dmt"+
            "\nRequest a one time notification for updates." +
            "\nFor example, to get a one time update for ony buff, message !ony" +
            "\n" +
            "\n!onysub !nefsub !rendsub !bvsfsub !hakkarsub !dmtsub"+
            "\nRequest notifications for every update until unsubscribed." +
            "\nFor example, to get every update for ony buff, message !onysub" +
            "\nTo unsubscribe, simply message the original command again, in this example !onysub" +
            "\n" +
            "\n!subs" +
            "\nCheck on currently active subscriptions." +
            "\n" +
            "\n!brb or !buffreposterbot"+
            "\nRequest this help information. " +
            "\n" +
            "\nIf you find Buff Reposter Bot useful, consider donating to the developer: https://www.paypal.me/buffreposterbot" +
            "\nQuestions/Comments: buffreposterbot@gmx.com```";

        message.channel.send(help);
    }
});

/**
 * Log in to discord client.
 */
client.login(token);

function insertNotification(user, command, type){
    const db = getDatabase();

    db.run(`INSERT OR REPLACE INTO notifications VALUES(?, ?, ?)`, [user, command, type], function (err) {
        if (err) {
            logError(err.message, "n - insert statement");
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A notification row has been inserted with rowid ${this.lastID}`);
        console.log("user: " + user + " notification: " + command);
        //console.log();
    });

    // close the database connection
    db.close();
    insertNotificationLog(user, command, type, "insert")
}

function insertNotificationLog(user, location, type, status) {
    const timestampDateFormatted = new Date().toUTCString();
    const db = getDatabase();

    db.run(`INSERT INTO notificationLog VALUES(?, ?, ?, ?, ?)`, [timestampDateFormatted, user, location, type, status], function (err) {
        if (err) {
            logError(err.message, "n - insert statement");
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A notificationLog row has been inserted 📢 with rowid ${this.lastID}`);
        //console.log("user: " + user + " notification: " + command);
        //console.log();
    });

    // close the database connection
    db.close();
}

function checkTimers() {
    const channel3 = client.channels.cache.get(sourceChannel); // needs to be set to skeram disc
    if (!channel3) {
        console.log("error at check timers - get channel");
        logError("error at check timers - get channel", "check timers");
        setTimeout(checkTimers, 20 * 1000);
    }
    channel3.messages.fetch({
        limit: 1
    }).then(messages => {
        const lastMessage3 = messages.first();

        //select statement needed here
        const db = getDatabase();

        const sql = `SELECT bufftimers FROM bufftimers`;

        db.get(sql, (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            // if the new timers match the old timers, do not continue
            const timers = lastMessage3.content;
            if (timers === row.buffTimers) {
                //exit this function
                const timestampDateFormatted = new Date().toUTCString();
                console.log("current buff timers match ✅" + timestampDateFormatted);
                setTimeout(checkTimers, 5000);
                return;
            } else {
                console.log("Calling update timer");
                updateTimers(timers);
                remindMe(timers, row.buffTimers);
            }
            return row;
        });
        db.close();
    });
}

function createTimersMap(timerString) {
    let timersArray = timerString.trim().split(/\r?\n/);
    const timerMap = {};
    timersArray.forEach(item => {
        // the first word in the split should be the timer symbol of "Updated"X
        let firstWord = item.split(" ")[0];
        //let firstWord = item.split(" ")[0];
        if (firstWord ===">"){
            firstWord = item.split(" ")[1];
        }
        if (SYMBOL_MAP.hasOwnProperty(firstWord)) {
            timerMap[SYMBOL_MAP[firstWord]] = item
        } else if (firstWord === "Updated" || firstWord === "**Updated" ) {
            timerMap["Updated"] = item;
        } 
    });
    return timerMap;
}

function remindMe(newTimers, oldTimers){
    let oldTimersMap = createTimersMap(oldTimers);
    let newTimersMap = createTimersMap(newTimers);
    // query the existing notification requests
    let db = getDatabase();

    let sql = `SELECT user,location,type FROM notifications`;
    const locations = [];

    db.all(sql, [], (err, rows) => {
        if (err) {
            logError(error, "updateTimers - query");
            return console.log(err.message);
        }
        if (!rows.length) {
            console.log("No rows in notifications db. ");
            return;
        }

        rows.forEach(row => {
            //push all notification requests into an array
            locations.push({"location": row.location, "user": row.user, "type": row.type});
            return row
        });

        //if any of the buff timers are not matching, update the notification requests that match the buffs that changed
        Object.entries(oldTimersMap).forEach(entry => {
            const [key, value] = entry;
            //if this is NOT the update as of line & this line ? & old timer does not equal new timer
            if (key !== "Updated" && newTimersMap.hasOwnProperty(key) && oldTimersMap[key] !== newTimersMap[key]) {
                const oldVal = oldTimersMap[key];
                const newVal = newTimersMap[key];
                console.log(oldVal);
                console.log(newVal);
                sendNotifications(newTimersMap["Updated"], oldVal, newVal, locations, key)
            }
        });
    });

    db.close();
}

function sendNotifications(newUpdated, oldTimer, newTimer, locations, locationName) {
    locations.forEach(locationObj => {
        if (locationObj.location === locationName) {
            const user = client.users.cache.get(locationObj.user);
            let flashReport = new Discord.MessageEmbed()
                .setColor('#66ffff')
                .setTitle("Buff Timer Update")
                .setDescription(newUpdated)
                .addFields(
                    { name: 'Old Timer', value: oldTimer, inline: false},
                    //{ name: '\u200B', value: '\u200B' },
                    { name: 'New Timer', value: newTimer, inline: false},
                )
                .setTimestamp();
            if (locationObj.type === 'single') {
                //user.send(newUpdated + " Old Timer: " + oldRend + " -- > New Timer: " + newRend);
                user.send(flashReport);
                insertNotificationLog(locationObj.user, locationName, locationObj.type, "sent notification")
                notificationRemoval(locationObj.location, locationObj.user, locationObj.type)
            } else if (locationObj.type === 'sub') {
                //user.send(newUpdated + " Old Timer: " + oldRend + " -- > New Timer: " + newRend);
                flashReport = flashReport.setFooter(`To unsubscribe from this message type !${locationName}sub`);
                user.send(flashReport);
                insertNotificationLog(locationObj.user, locationName, locationObj.type, "sent notification")
            }
        }
    });
}



function notificationRemoval(location, user, type) {
    let db = getDatabase();

    db.run(`DELETE FROM notifications WHERE user=? and location=? and type=?`, [user, location, type], function (err) {
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
    insertNotificationLog(user, location, type, "removal")
}

function updateTimers(timers) {
    let db = getDatabase();

    db.run(`UPDATE buffTimers SET buffTimers = (?)`, [timers], function (err) {
        if (err) {
            return console.log(err.message);
        }
    });

    db.all("SELECT sid, cid, mid FROM repostLocations", [], (err, rows) => {
        if (err) {
            logError(error, "updateTimers - query");
            return console.log(err.message);
        }
        if (!rows.length) {
            console.log("No rows in db. Calling checkTimers.");
            checkTimers();
            return;
        }
        let channel = client.channels.cache.get(sourceChannel);

        channel.messages.fetch({
            limit: 1
        }).then(messages => {
                let lastMessage = messages.first(); //get the latest message from the channel to use as a source of information

                let promises = rows.map((row, index) => { // iterate over all of the post locations
                let channel2 = client.channels.cache.get(row.cid); // get information about the message to be updated

                if (!channel2) {
                    removeChannel(row.cid, "Channel is undefined");
                }
                return channel2.messages
                    .fetch({
                        around: row.mid,
                        limit: 1
                    })
                    .then(msg => {
                        console.log("editting message - 🔄 -" + row.mid + " - " + index);
                        const fetchedMsg = msg.first();
                        if (!fetchedMsg) {
                            removeChannel(row.cid, "message is undefined");
                        }
                        fetchedMsg.edit(timers); //update the message pulled from the database
                    })
            });

            Promise.all(promises).then(() => {
                console.log("calling check timers in 20 sec")
                setTimeout(checkTimers, 20000);
            });



        });
    });

    // close the database connection
    db.close();
}

function removeChannel(cid, error) {
    let db = getDatabase();

    db.run(`DELETE FROM repostLocations WHERE cid=?`, cid, function (err) {
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

    logError(error, "channel removal from handled exception");
}



function logError(error, programLocation) {
    console.log("************************");
    console.log(error);
    var timestamp = new Date();
    var timestampDateFormatted = timestamp.toUTCString();

    let db = getDatabase();

    // TODO: need to double check the correct values are being passed to the database
    db.run(`INSERT INTO errors VALUES(?, ?, ?)`, [error, timestampDateFormatted, programLocation], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`An error row has been inserted with rowid ${this.lastID}`);
    });

    // close the database connection
    db.close();
}

/**
 * Opens a database connection to DATABASE_FILE_NAME
 *
 * @returns {sqlite3.Database}
 */
function getDatabase() {
    return new sqlite3.Database(DATABASE_FILE_NAME, (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}
