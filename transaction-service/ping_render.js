const axios = require('axios');

async function test() {
    try {
        console.log("Pinging live Render server root...");
        const res1 = await axios.get('https://banking-transaction-service.onrender.com/');
        console.log("Root status:", res1.status, "Body:", res1.data);

        console.log("Pinging live Render server /health...");
        const res2 = await axios.get('https://banking-transaction-service.onrender.com/health');
        console.log("Health status:", res2.status, "Body:", res2.data);
    } catch (err) {
        console.error("Error pinging live Render server:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

test();
