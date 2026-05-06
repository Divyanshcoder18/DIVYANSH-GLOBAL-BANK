const axios = require('axios');

async function test() {
    const payload = {
        key: "542f6fb3-4cfc-46ab-a110-cb5e885d45f2",
        client_txn_id: "test_" + Date.now(),
        amount: "10",
        p_info: "Test Deposit",
        customer_name: "Divyansh Kalia",
        customer_email: "kaliadivyansh77@gmail.com",
        customer_mobile: "9999999999",
        redirect_url: "https://divyansh-global-bank.vercel.app/dashboard",
        udf1: "test_acc"
    };

    console.log("Sending payload:", payload);

    try {
        const res = await axios.post('https://merchant.upigateway.com/api/create_order', payload);
        console.log("Response status:", res.status);
        console.log("Response body:", res.data);
    } catch (err) {
        console.error("Error occurred:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

test();
