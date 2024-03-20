function sortter() {
    const fs = require('fs');

    // Read the JSON data from the file
    const jsonData = fs.readFileSync('./data/usersPointPersonal.json', 'utf8');

    // Parse the JSON data into a JavaScript object
    const data = JSON.parse(jsonData);

    // Extract user data from the 'data' object
    const userData = data.data;


    // Convert the user data into an array of objects
    const userArray = Object.entries(userData).map(([userId, userInfo]) => ({
        userId,
        ...userInfo
    }));


    userArray.sort((a, b) => {
        // console.log(a.point, b.point);
        return b.point - a.point
    });

    return userArray;
}

// // Print the top 10 users with their names and points
function topTenPointers(bot,chatId,isPrivate){
    let userArray = sortter();
    let text = "";
    // console.log('Top 10 Users:');
    userArray.slice(0, 10).forEach((user, index) => {
        let username;
        // console.log(`${index + 1}. ${user.name} ${user.point}`);
        if(user.userName==null || isPrivate==false){
            userName="Hidden"
        }
        else{
            userName = "@"+user.userName;
        }
        text+=`${index+1}.👤 ${user.name}\n\n..🅿️ ${user.point} points \n\n..🕵️ ${userName}`
        text+="\n____________________\n\n";
    });

    bot.sendMessage(chatId,text);
    
}

function myRank(fs,bot,chatId){
    let userArray = sortter();
    for(let a =0;a<userArray.length;a++){
        if(chatId==userArray[a].userId){
            bot.sendMessage(chatId,`🌎Global NO.${a+1}\n\n👤${userArray[a].name}\n\n🅿️ ${userArray[a].point} points`)
        }
    }

}

module.exports.rank = {topTenPointers,myRank};
