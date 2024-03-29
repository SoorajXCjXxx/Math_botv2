const nextQuestionButton = require("../test.js");

function pointHandler(chatId, point, userName, name,fs,nextButton) {

    try {
        let dataObj = new Object();
    
            let userPoint = fs.readFileSync("./data/groupPoint.json", "utf-8");
            userPoint = JSON.parse(userPoint);
            if (userPoint.data[chatId] != undefined) {
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

            fs.writeFileSync("./data/groupPoint.json", JSON.stringify(userPoint));
        
    }
    catch (err) {
        console.log(err);
    }
    
  if(nextButton){
    setTimeout(() => {
        nextQuestionButton.nextQuestionButton(chatId);
    }, 1000);
    
  }
}

module.exports.pointHandler = pointHandler;
