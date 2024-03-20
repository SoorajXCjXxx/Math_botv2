const axios = require("axios");

function makeRequest() {
    axios.get("https://math-botv2.onrender.com/").then((val)=>{
        console.log(val.data);
    })
}

// Main loop to make requests every 15 seconds
setInterval(makeRequest, 15000);
