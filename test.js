const TelegramBot = require('node-telegram-bot-api');

const botToken = '7055471875:AAGLgqTg2m_wa5CzJrJkO820GTMzaX_SF5g';
const ownerId = '6798013182'; // Your Telegram user ID

const bot = new TelegramBot(botToken, { polling: true });

let messageQuee = new Object();
let perosnalMessageQuee = new Object();
const math = require("./app.js");
const fs = require("fs");
const express = require("express");
const app = express();
const perosnalQuee = require("./source/messageQueeHandlerPersonal.js");
const rankDetetor = require("./source/rankDetetor.js");

function sendQuestion(chatId, isPersonal) {
    try {
        let MathData = math.math();
        bot.sendMessage(chatId, `🤔${MathData.eq}, ${MathData.target}=?\n\n↩️ Reply လုပ်ပြီး ​ဖြေးပါ\n\n✔️ မှန်ပါက 3 မှတ်ရပါမည်\n\n❌ မှားရင် 3 မှတ်လျော့ပါမည်`).then((msg) => {
            let messageId = msg.message_id;
            let name;
            let username;
            if(isPersonal){
                if(msg.chat.username!=undefined){
                    username = msg.chat.username;
                }
                else{
                    username = null;
                }
                name = msg.chat.first_name;
                if(msg.chat.last_name!=undefined){
                    name += " "+msg.chat.last_name;
                }
                pointHandlerForPersonal(chatId,-1,username,name,false);
                if(perosnalQuee[chatId]!=undefined){
                    bot.clearReplyListeners(chatId,perosnalQuee[chatId]);
                }
                perosnalQuee[chatId] = messageId;
            }
            else{
                if(messageQuee[chatId]!=undefined){
                    bot.clearReplyListeners(chatId,perosnalQuee[chatId]);
                }
                messageQuee[chatId] = messageId;
            }

            bot.onReplyToMessage(chatId, messageId, (newMsg) => {
                let userChatId = newMsg.from.id;
                if (newMsg.text == MathData.ans) {

                    bot.sendMessage(chatId, funnyWordTeller(true,MathData.ans), { reply_to_message_id: newMsg.message_id });
                    bot.clearReplyListeners(chatId, messageId);
                    if (isPersonal) {
                        pointHandlerForPersonal(userChatId, 4,username,name,true)

                    }
                    else {

                        let username = newMsg.from.username;
                        if(username==undefined){
                            username = null;
                        }
                        let name = newMsg.from.first_name;
                        if(newMsg.from.last_name!=undefined){
                            name = name+" "+newMsg.from.last_name;
                        }
                        pointHandler(userChatId, 3, newMsg.message_id,chatId,username,name);
                    }
                }
                else {
                    bot.sendMessage(chatId, funnyWordTeller(false,MathData.ans), { reply_to_message_id: newMsg.message_id });
                    bot.clearReplyListeners(chatId, messageId);
                    if (isPersonal) {
                        pointHandlerForPersonal(userChatId, -2,username,name,true);

                    }
                    else {
                        let username = newMsg.from.username;
                        if(username==undefined){
                            username = null;
                        }
                        let name = newMsg.from.first_name;
                        if(newMsg.from.last_name!=undefined){
                            name = name+" "+newMsg.from.last_name;
                        }
                        pointHandler(userChatId, -3, newMsg.message_id,chatId,username,name);
                    }
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

function funnyWordTeller(status,ans) {
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
        return words[randomNumber]+`\n😔အဖြေမှန်က ${ans}`;
    }

}

function pointHandlerForPersonal(chatId, point,username,name,sendNextButton) {

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
    if(sendNextButton){
        setTimeout(() => {
            nextQuestionButton(chatId); 
        }, 1000);
    
    }
}

function nextQuestionButton(chatId) {
    const keyboardMarkup = {
        inline_keyboard: [
            [
                {
                    text: "Next",
                    callback_data: 'next'
                }
            ]
        ]
    };

    // Send the message with the inline keyboard
    bot.sendMessage(chatId, 'နောက်တစ်ခု ဖြေးရန်\n👇👇👇👇👇', {
        reply_markup: JSON.stringify(keyboardMarkup)
    }).then((val) => {

    }).catch((err) => {
        console.log(err);
    })
}

function pointHandler(chatId, point, messageId, groupId,userName,name) {
    console.log("in point hndler");
    try {
        let dataObj = new Object();
        const keyboardMarkup = {
            inline_keyboard: [
                [
                    {
                        text: 'Rigister လုပ်ရန်',
                        url: "tg://resolve?domain=math_bot_by_yebot"
                    },

                ]
            ]
        };
        let data = fs.readFileSync("./data/users.json", "utf-8");
        data = JSON.parse(data);
        // checking does  the user exist or not 

        if (data.data[chatId] == undefined) {
            bot.sendMessage(groupId, 'အမှန်ကို သိမ်းဆည်း ရန် rigister လုပ်ရန်လိုအပ်ပါသည်', {
                reply_markup: JSON.stringify(keyboardMarkup),
                reply_to_message_id: messageId
            }).catch((err) => {
                console.log("error");
            })
        }

        let userPoint = fs.readFileSync("./data/usersPoint.json", "utf-8");
        userPoint = JSON.parse(userPoint);
        if (userPoint.data[chatId]!= undefined) {
            if (userPoint.data[chatId].point == 0 && point < 0) {
                dataObj.point = 0;
            }
            else {
                let value = userPoint.data[chatId].point + point
                if (value >= 0) {
                    dataObj.point = value;
                }
                else {
                    dataObj.point = 0;
                }
            }
        }
        else {
            if (point > 0) {
                dataObj.point = point;
            }
            else {
                dataObj.point = 0;
            }
        }

        dataObj.userName = userName;
        dataObj.name = name;
        userPoint.data[chatId] = dataObj;
        
        fs.writeFileSync("./data/usersPoint.json", JSON.stringify(userPoint));
    }
    catch (err) {
        console.log(err);
    }
}


bot.on("callback_query", (msg) => {
    try {
        if (msg.message.chat.type == "private") {
            let clickedButton = msg.data;
            if (clickedButton == "next") {
                sendQuestion(msg.message.chat.id, true);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
})


bot.on('new_chat_members', (msg) => {
    try {
        console.log("yes it is here");
        console.log(msg);
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
        if (msg.chat.type != "private" && msg.chat.type != "channel") {
            let chatId = msg.chat.id;
            
            sendQuestion(chatId, false);
        }
        else {
            let data = fs.readFileSync("./data/users.json", "utf-8");
            data = JSON.parse(data);
            if (data.data[msg.chat.id] != undefined) {
                sendQuestion(msg.chat.id, true);
            }
            else {
                data.data[msg.chat.id] = msg.chat.id;
                fs.writeFileSync("./data/users.json", JSON.stringify(data));

                // opening poiont account for perosnal users
                let points = fs.readFileSync("./data/usersPointPersonal.json", "utf-8");
                points = JSON.parse(points);
                let dataObj = new Object();
                let username = msg.chat.username;
                let name = msg.chat.first_name;
                if(username==undefined){
                    username = null
                }
                else if(msg.chat.last_name != undefined){
                    name = name+" "+msg.chat.last_name
                }
                dataObj.name = name;
                dataObj.userName = username;
                dataObj.point = 0;
                points.data[msg.chat.id] = dataObj;
                console.log(points);
                fs.writeFileSync("./data/usersPointPersonal.json",JSON.stringify(points));
                bot.sendMessage(msg.chat.id,"Register အောင်မြင်ပါသည်။");
                sendQuestion(msg.chat.id,true);
            }

        }
    } catch (err) {
        console.log(err);
    }

});

bot.onText(/\/next/, (msg) => {
    sendQuestion(msg.chat.id,true);
})

bot.on("message", (msg) => {


    if (msg.chat.type != "private" && msg.chat.type != "channel") {
        let chatId = msg.chat.id;
        let currentMessageId = msg.message_id;

        if (currentMessageId - messageQuee[chatId] == 10) {
            bot.clearReplyListeners(chatId,messageQuee[chatId]);
            sendQuestion(chatId,false);
            messageQuee[chatId] = currentMessageId;
        }
    }
})

bot.onText(/\/rank/, (msg) => {
    console.log("code is here");
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
    rankDetetor.rank.myRank(fs,bot,msg.chat.id);
})

bot.onText(/\/rule/, (msg) => {
    bot.sendMessage(msg.chat.id,`👮🏻စည်းကမ်း ချက်များ

👮🏻 /start command သည် bot ကိုစတင်ရန် ဖြစ်သည်။
   
👮🏻 /next command သည် question အသစ်တစ်ခု တောင်းဆိုရန်ဖြစ်သည်။
Question တစ်ခု တောင်းရာတွင် point 1ခု အာ လျော့သွားပြီး အဲ့ question ကိုမှန်အောင်ဖြေးပါက points 4 မှတ်ရရှိပြီး မှားပါက 2 မှတ်လျော့သွားပါမည်။
   
👮🏻 /rank commad သည် အမှတ်များဆုံး 10 ယောက်ရဲ့ မှတ်များနှင့် နာမည် များကို ပို့ပေးပါမည်။

👮🏻 /myrank commad သည်သင်းရဲ့အမှတ်နှင့်လက်ရှိ rank position ကို ပြောပြပါမည်။
   
   
🥳🥳လကုန်တိုင်း Global 1ကို 10k mmk Global 2ကို 5k mmk နှင့် Global 3ကို 3k mm ဆုအနေဖြင့်ပေးပါမည် ဖြစ်ပါသည်🥳🥳`)
})
// bot.sendMessage(5801747705,"if u want then its fine 💘");


function questionSender(questionData, chatId) {
    bot.sendMessage(chatId, `  ${questionData.eq}, ${questionData.target}=?\n\n✅Right answer = -3 points\n\n❌Wrong answer = -3 points\n**Reply to the message for answer**\n**reply လုပ်ပြီး ဖြေးရပါမည်။**`).then((msg) => {

    })
}

app.get("/",(req,res)=>{
    res.send("server is on!");
})

app.listen(8000,()=>{
    console.log("server is running...");
})