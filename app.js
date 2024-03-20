const fs = require("fs"); 

let format = ["abcd","abcd1","abcd2"];
// format is the name of the type of Math question like ab+c =d, that name is abcd
// and abcd1 = a/b+c =d like that
let formatDetails = fs.readFileSync("formatDetails.json","utf-8");
formatDetails = JSON.parse(formatDetails);

function numberGenerator(max,type){
    let number = Math.floor(Math.random()*max);
    if(type){
        if(number==0){
            number = 10;
            return number;
        }
        if(number%2!=0){
            number++;
        }
    }
    return number;
}

function formatNameGenerator(){
    return format[Math.floor(Math.random()*format.length)];
}

function equationGenerator(){
    let formatName = formatNameGenerator();
    let fDetails = formatDetails[0][formatName];
    let format  = fDetails.format;
    let dataObj = new Object(); 


    for(let a =0;a<format.length;a++){
        if(format[a]==fDetails.target){
            continue;
        }
        dataObj[format[a]] = numberGenerator(fDetails[format[a]],fDetails.type);
    }
    dataObj.formula = fDetails.formula;
    dataObj.eq = fDetails.eq;
    dataObj.target = fDetails.target;
    dataObj.type = fDetails.type;
    return dataObj;
}

// equationGenerator();

function calculator(dataObj){
    let  cal = "";
    let formula = dataObj.formula;
    let data = new Object();
    for(let a =0;a<formula.length;a++){
        if(dataObj[formula[a]]!=undefined){
            cal = cal.concat(dataObj[formula[a]]);
            // formula = formula.replace(format[a],dataObj[format[a]]);
            // console.log(formula);
        }
        else{
            cal = cal.concat(formula[a]);
        }
    }
    data.ans  = eval(cal);

    let equation = "";
    let eq = dataObj.eq;

    for(let a =0;a<eq.length;a++){
        if(dataObj[eq[a]]!=undefined){
            equation = equation.concat(dataObj[eq[a]]);
        }
        else{
            equation = equation.concat(eq[a]);
        }
    }
   

    // console.log(equation);
    data.target = dataObj.target;
    data.eq = equation;
    return data;
}

// equationGenerator();

function main(){
    return calculator(equationGenerator());
}

module.exports.math = main;