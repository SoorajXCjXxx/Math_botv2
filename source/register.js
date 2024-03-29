function register(bot,fs,type,chatId,name,userName){
    let urls = ["./data/usersPointPersonal.json","./data/groupPoint.json"];
    let url;
    if(type=="private"){
        url = urls[0];
    }
    else{
        url = urls[1];
    }

    let data = fs.readFileSync(url,"utf-8");
    data = JSON.parse(data);
    
    if(data.data[chatId]==undefined){
        let dataObj = new Object();
        dataObj.name = name;
        dataObj.userName = userName;
        dataObj.point =0;
        data.data[chatId] = dataObj;
        fs.writeFileSync(url,JSON.stringify(data));
        bot.sendMessage(chatId,"Reigistering successfull🎉🎉");
    }

    if(type=="private"){
        let rigisterUsers = fs.readFileSync("./data/users.json", "utf-8");
            rigisterUsers = JSON.parse(rigisterUsers);
            if (rigisterUsers.data[chatId] == undefined) {
                rigisterUsers.data[chatId] = chatId;
                fs.writeFileSync("./data/users.json", JSON.stringify(rigisterUsers));
            }
    }
    return 0;
}

module.exports.register = register;