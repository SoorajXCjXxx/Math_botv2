const axios = require("axios");

function makeRequest() {
    axios.get("https://533436fe-1164-4bbb-b82e-6a0b26f95cd6-00-10jreu2nfxv8g.riker.replit.dev/").then((val)=>{
        console.log(val.data);
    })
}

// Main loop to make requests every 15 seconds
setInterval(makeRequest, 15000);
