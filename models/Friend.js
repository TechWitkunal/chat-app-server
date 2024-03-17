const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    user2: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

const Friend = new mongoose.model(
    "Friend",
    FriendSchema
);
module.exports = Friend;
