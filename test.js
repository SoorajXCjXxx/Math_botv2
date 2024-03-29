const TelegramBot = require('node-telegram-bot-api');

const botToken = '7055471875:AAGLgqTg2m_wa5CzJrJkO820GTMzaX_SF5g';
const ownerId = '6798013182'; // Your Telegram user ID

const bot = new TelegramBot(botToken, { polling: true });

let messageQuee = new Object();
const perosnalQuee = new Object();

const math = require("./app.js");
const fs = require("fs");
const express = require("express");
const app = express();
const rankDetetor = require("./source/rankDetetor.js");
const register = require("./source/register.js");
const pointHandler = require("./source/pointHandlerForGp.js");
const registerFirst = require("./source/rigisterFirst.js");
const gpRank = require("./source/gpRankDetetor.js");

function sendQuestion(chatId, isPersonal) {
    try {
        let MathData = math.math();
        bot.sendMessage(chatId, `🤔${MathData.eq}, ${MathData.target}=?\n\n↩️ Answer with reply\n\n✔️ Right answer will add 3 points\n\n❌ Wrong answer will deduct 3 points`).then((msg) => {
            let messageId = msg.message_id;
            let name;
            let username = null;

            // for private
            if (isPersonal) {
                if (msg.chat.username != undefined) {
                    username = msg.chat.username;
                }

                name = msg.chat.first_name;
                if (msg.chat.last_name != undefined) {
                    name += " " + msg.chat.last_name;
                }

                // reducing 1 point because of new request
                pointHandlerForPersonal(chatId, -1, username, name, false);
                if (perosnalQuee[chatId] != undefined) {
                    bot.clearReplyListeners(chatId, perosnalQuee[chatId]);
                }
                perosnalQuee[chatId] = messageId;
            }

            // for groups
            else {
                name = msg.chat.title;
                if (msg.chat.username != undefined) {
                    username = msg.chat.username;
                }

                pointHandler.pointHandler(chatId, -1,  username, name,fs,false);
                if (messageQuee[chatId] != undefined) {
                    bot.clearReplyListeners(chatId, perosnalQuee[chatId]);
                }
                messageQuee[chatId] = messageId;
            }

            bot.onReplyToMessage(chatId, messageId, (newMsg) => {
                let userChatId = newMsg.from.id;
                // cheacking does current user it register or not
                if (isPersonal == false) {

                    try {
                        let status = registerFirst.registerFirst( bot,userChatId, fs, chatId, newMsg.message_id);
                        if (status != 0) {
                            return 1;
                        }
                    }
                    catch (err) {
                        console.log(err);
                        return 1;
                    }

                }
                // conveting newMsg.text to number 
                let answer = newMsg.text;
                try {
                    answer = Number(answer);
                    answer = Math.floor(answer);
                }
                catch (err) {
                    console.log("cannot convert to number");
                }

                // for right anser
                if (answer == Number(Math.floor(MathData.ans))) {
                    bot.sendMessage(chatId, funnyWordTeller(true, MathData.ans), { reply_to_message_id: newMsg.message_id }).catch((err) => {
                        console.log(err);
                    })
                    bot.clearReplyListeners(chatId, messageId);
                    // for personal
                    if (isPersonal) {
                        pointHandlerForPersonal(chatId, 4, username, name, true)
                    }
                    // for group
                    else {
                        try {
                            pointHandler.pointHandler(chatId, 4,  username, name,fs,true);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
                // for wrong answer
                else {
                    bot.sendMessage(chatId, funnyWordTeller(false, MathData.ans), { reply_to_message_id: newMsg.message_id }).catch((err) => {
                        console.log(err);
                    })
                    bot.clearReplyListeners(chatId, messageId);
                    if (isPersonal) {
                        pointHandlerForPersonal(chatId, -2, username, name, true);
                    }
                    else {
                        pointHandler.pointHandler(chatId, -4, username, name,fs,true);
                    }
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

function funnyWordTeller(status, ans) {
    let words = fs.readFileSync("./data/extra.json", "utf-8");
    words = JSON.parse(words);

    if (status) {
        words = words["right"];
        let length = words.length;

        let randomNumber = Math.floor(Math.random() * length);
        return words[randomNumber];
    }
    else {
        words = words["wrong"];
        let length = words.length;
        let randomNumber = Math.floor(Math.random() * length);
        return words[randomNumber] + `\🥲Correct answer it ${Math.round(ans)}`;
    }

}

function pointHandlerForPersonal(chatId, point, username, name, sendNextButton) {


    let points = fs.readFileSync("./data/usersPointPersonal.json", "utf-8");
    points = JSON.parse(points);
    if (point > 0) {
        points.data[chatId].point += point;
    }
    else {
        
        let value = points.data[chatId].point + point;
        if (value >= 0) {
            points.data[chatId].point = value;
        }
        else {
            points.data[chatId].point = 0;
        }
    }
    points.data[chatId].userName = username;
    points.data[chatId].name = name;
    fs.writeFileSync("./data/usersPointPersonal.json", JSON.stringify(points));

    if (sendNextButton) {
        setTimeout(() => {
            nextQuestionButton(chatId);
        }, 1000);

    }
} //verified

function nextQuestionButton(chatId) {
    const keyboardMarkup = {
        inline_keyboard: [
            [
                {
                    text: "Next⏭️",
                    callback_data: 'next'
                }
            ]
        ]
    };

    // Send the message with the inline keyboard
    bot.sendMessage(chatId, 'Next Question\n👇👇👇👇👇', {
        reply_markup: JSON.stringify(keyboardMarkup)
    }).then((val) => {

    }).catch((err) => {
        console.log(err);
    })
}



bot.on("callback_query", (msg) => {
    try {
        let clickedButton = msg.data;
        if (msg.message.chat.type == "private") {
            if (clickedButton == "next") {
                sendQuestion(msg.message.chat.id, true);
            }
        }
        else{
            if (clickedButton == "next") {
                sendQuestion(msg.message.chat.id, false);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
})


bot.on('new_chat_members', (msg) => {
    try {
        let botChatId = msg.new_chat_members[0].id;
        if (botChatId == "7055471875") {
            bot.sendMessage(6798013182, `A new group add me to a group`);
            bot.sendMessage(6798013182, `Group name: ${msg.chat.title}\nUsername: @${msg.chat.username}`);
            if (msg.from.username != undefined) {
                bot.sendMessage(6798013182, `Adder details:${msg.from.username}`);
            }
        }
    }
    catch (err) {
        bot.sendMessage(6798013182, `An error fouond ${err.message}`);
        console.log("There is an error in comming bot.on new chat memeber", err.message);
    }
});



bot.onText(/\/start/, (msg) => {
    try {
        let chatId = msg.chat.id;
        let name = msg.chat.first_name;
        if (msg.chat.last_name != undefined) {
            name += ' ' + msg.chat.last_name;
        }
        let userName = msg.chat.username;
        if (userName == undefined) {
            userName = null;
        }

        if (msg.chat.type == "supergroup") {
            name = msg.chat.title;
        }
        register.register(bot, fs, msg.chat.type, chatId, name, userName);
        let status = false;
        if (msg.chat.type == "private") {
            status = true;
        }
        sendQuestion(chatId, status)

    } catch (err) {
        console.log(err);
    }

});

bot.onText(/\/next/, (msg) => {
    try {
        let check1;
        let check2;
        let userChatId;
        let status = false;
        // getting user chatId
        // if chat type is not private then we have to get it from msg.from;
        if (msg.chat.type != "private") {

            userChatId = msg.from.id;
        }
        else {
            status = true; // ture means user using the bot in private not in group
            userChatId = msg.chat.id;
        }

        // cheching user is rigistered or not
        let userData = fs.readFileSync("./data/users.json","utf-8");
        userData = JSON.parse(userData);
        // if the use does not exist in users.json it will be undefined 
        // so user needs to /start the bot
        if(userData.data[userChatId]==undefined){
            registerFirst.registerFirst(bot,userChatId,fs,msg.chat.id,msg.message_id);
            if(status==true){
                bot.sendMessage(userChatId,"Just /start the bot");
            }
        }
        else{
            check1 = true;
        }

        if(status==false){
            let groupData = fs.readFileSync("./data/groupPoint.json","utf-8");
            groupData = JSON.parse(groupData);

            if(groupData.data[msg.chat.id]==undefined){
                bot.sendMessage(msg.chat.id,"Pls use the command /start to start using the bot❤️");
            }
            else{
                check2 = true;
            }
        }
        
        sendQuestion(msg.chat.id, status);
    } catch (err) {
        console.log(err);
    }
})

bot.on("message", (msg) => {
    if (msg.chat.type != "private" && msg.chat.type != "channel") {
        let chatId = msg.chat.id;
        let currentMessageId = msg.message_id;

        if (currentMessageId - messageQuee[chatId] == 100) {
            bot.clearReplyListeners(chatId, messageQuee[chatId]);
            sendQuestion(chatId, false);
            messageQuee[chatId] = currentMessageId;
        }
    }
})

bot.onText(/\/rank/, (msg) => {
    try {
        if (msg.chat.type == "private") {
            rankDetetor.rank.topTenPointers(bot, msg.chat.id, true);
        }
        else {
            rankDetetor.rank.topTenPointers(bot, msg.chat.id, false);
        }
    }
    catch (error) {
        console.log(error)
    }
})

bot.onText(/\/rank/, (msg) => {
    try{
       if(msg.chat.type=="private"){
            rankDetetor.rank.topTenPointers(bot,msg.chat.id,true);
       }
       else{
            rankDetetor.rank.topTenPointers(bot,msg.chat.id,false);
       }
    }
    catch(error){
        console.log(error)
    }
    
})

bot.onText(/\/myrank/, (msg) => {
    rankDetetor.rank.myRank(fs, bot, msg.chat.id);
})

bot.onText(/\/gprank/, (msg) => {
    let isPrivate = false;
    if(msg.chat.type=="private"){
        isPrivate = true;
    }
    // fs,bot,chatId,isPrivate
    try{
        gpRank.gpRank(fs,bot,msg.chat.id,isPrivate);
    }
    catch(err){
        console.log(err);
    }
})


bot.onText(/\/rule/, (msg) => {
    bot.sendMessage(msg.chat.id, `👮🏻 RULES

👮🏻 /start command is used to start the bot.
   
👮🏻 /next command is used to get a new question. While requesting a new question, 1 point will be deducted. If you give the right answer, you will get 4 points; otherwise, 2 points will be deducted.

👮🏻 /rank command is used to get the list of top 10 players who have the highest points.

👮🏻 /myrank command is used to get your points and current rank position.
   
🥳🥳 At the end of the season, all points will be set to 0. 🥳🥳`);
});



app.get("/", (req, res) => {
    res.send("server is on!");
})

app.listen(8000, () => {
    console.log("server is running...");
})

module.exports.nextQuestionButton = nextQuestionButton;