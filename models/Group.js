const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    // Group Name
    // description
    // group owner
    // group admin

    // array which store user id who can send message <- array can obly be update by owner
    // block user list -array so that no one can add again that user in that
    // boolean is admin are allowed to change setting
    // all user mongoose id - array

    // group photo

    groupName: {
        type: String,
        require: true,
    },
    
    description: {
        type: String,
    },
    
    groupLeader: {
        type: mongoose.Schema.ObjectId,
        require: true,
    },
    
    groupAdmin: {
        type: Array,
        default: [],
    },

    groupPhoto: {
        type: String,
        default: "https://firebasestorage.googleapis.com/v0/b/online-chat-app-d822f.appspot.com/o/default%20images%2Fgorup%20icon.png?alt=media&token=8c9f50e1-f492-4dc5-a89e-5b86dbade2f8",
    },

    members: {
        type: Array,
        required: true,
    },

    userBlockGroup: {
        type: Array,
        default: [],
    },

    canAdminChangeSetting: {
        type: Boolean,
        require: true,
    },

    canMemberSendMessage: {
        type: Boolean,
        require: true,
    },

    canMemberAddOther: {
        type: Boolean,
        require: true,
    },

}, { timestamps: true });


const Group = new mongoose.model("Group", GroupSchema);
module.exports = Group;