require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app.js');

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Auth Service listening on port ${PORT}`);
    
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
        .then(() => console.log("✅ Auth Service Database Connected"))
        .catch((err) => console.error("❌ Auth Service DB Error:", err));
});
