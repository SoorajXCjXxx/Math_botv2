function registerFirst(bot,chatId,fs,targetId,messageId){
    const keyboardMarkup = {
        inline_keyboard: [
            [
                {
                    text: 'Single click to rigister❤️',
                    url: "tg://resolve?domain=Math_mm_bot"
                },

            ]
        ]
    };

    let rigisterUsers = fs.readFileSync("./data/users.json","utf-8");
    rigisterUsers = JSON.parse(rigisterUsers);

    if(rigisterUsers.data[chatId]==undefined){
        try{
            bot.sendMessage(targetId, 'To use this bot you need to register first😅', {
                reply_markup: JSON.stringify(keyboardMarkup),
                reply_to_message_id: messageId
            })
            return 1;
        }
        catch(err){
            return 1;
        }
    }
    else{
        return 0;
    }

}

module.exports.registerFirst = registerFirst;
