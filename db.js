const mongoose = require('mongoose');

const connectToMongoose = async () => {
    try {
        await mongoose.connect("mongodb+srv://kunal:kunal1287@cluster0.j5dtzfz.mongodb.net/chat-app", {  useNewUrlParser: true, 
        // await mongoose.connect("mongodb://localhost:27017/chat", {  useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Socket timeout after 45 seconds
    })
        console.log('Connected to MongoDB..................');
    } catch (error) {
        // console.error('Internal Server Error.................');
        console.error("DB connection failed with error -> ", error)
    }
}

module.exports = connectToMongoose;
