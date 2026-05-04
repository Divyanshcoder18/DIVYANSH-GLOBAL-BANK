require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app.js');
const { connectRabbitMQ } = require('./src/utils/producer.js');

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Transaction Service listening on port ${PORT}`);

    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
        .then(async () => {
            console.log("✅ Transaction Service Database Connected");
            await connectRabbitMQ();
        })
        .catch((err) => console.error("❌ Transaction Service DB Error:", err));
});
