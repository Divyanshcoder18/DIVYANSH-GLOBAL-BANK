const axios = require('axios');

async function test() {
    const endpoint = 'https://www.instamojo.com/api/1.1/payment-requests/';
    const params = new URLSearchParams();
    params.append('amount', '10.00');
    params.append('purpose', 'Apex Deposit Test');
    params.append('buyer_name', 'Divyansh Kalia');
    params.append('email', 'user@divyanshbank.com');
    params.append('phone', '8894004117');
    params.append('redirect_url', 'https://divyansh-global-bank.vercel.app/dashboard');
    params.append('allow_repeated_payments', 'false');

    try {
        console.log("Sending request to Instamojo...");
        const response = await axios.post(endpoint, params, {
            headers: {
                'X-Api-Key': '50f2c2ba2c472bf67c6d93b53a04fa9c',
                'X-Auth-Token': '1dad2de8fce59fbb59d0e69f4f38346f',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log("SUCCESS!", response.data);
    } catch (error) {
        console.error("FAILED!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
        }
    }
}

test();
