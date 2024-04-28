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
    isSeen: {
        type: Boolean,
        default: false,
    },

    // to check is this a message which is send in group
    isInGroup: {
        type: Boolean,
        default: false,
    },

    // Group id
    groupId: {
        type: mongoose.Schema.ObjectId,
        ref: "Group",
    },

    membersInGroup: {
       type: [String],
    }

    // // store the user id who send message in the group if this is a group message
    // sendBy: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "User",
    //     required: false,
    // }
}, { timestamps: true });

const Message = new mongoose.model(
    "Message",
    MessageSchema
);
module.exports = Message;
