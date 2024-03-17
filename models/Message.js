const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    to: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    from: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["Text", "Media", "Document"],
    },
    text: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
}, { timestamps: true });

const Message = new mongoose.model(
    "Message",
    MessageSchema
);
module.exports = Message;
