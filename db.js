const mongoose = require('mongoose');
const mongoURL = "mongodb://localhost:27017/onlineChat";

const connectToMongoose = async () => {
    try {
        await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB..................');
    } catch (error) {
        console.error('Internal Server Error.................');
    }
}

module.exports = connectToMongoose;
