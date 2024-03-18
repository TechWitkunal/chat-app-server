const mongoose = require('mongoose');
// const mongoURL = "mongodb://localhost:27017/onlineChat";
const mongoURL = "mongodb+srv://kunal:kunal@cluster0.mzr9pwe.mongodb.net/";
// const mongoURL = "mongodb+srv://kunal:kunal@cluster0.mzr9pwe.mongodb.net";
// const mongoURL = "mongodb+srv://kunal:kunal@cluster0.mzr9pwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectToMongoose = async () => {
    try {
        // await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        // await mongoose.connect("mongodb+srv://kunal:kunal@cluster0.mzr9pwe.mongodb.net/chat")
        await mongoose.connect("mongodb+srv://kunal:kunal1287@cluster0.j5dtzfz.mongodb.net/chat-app", {  useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Socket timeout after 45 seconds
    })
        console.log('Connected to MongoDB..................');
    } catch (error) {
        console.error('Internal Server Error.................');
    }
}

module.exports = connectToMongoose;
