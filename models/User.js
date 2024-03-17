const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        require: true,
        unique: true,
    },
    about: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        validate: {
            validator: function (email) {
                return String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );
            },
            message: (props) => `Email (${props.value}) is invalid!`,
        },
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Online", "Offline"]
    },
    pinChat: [
        {
            type: mongoose.Schema.Types.ObjectId,
        },
    ],
    achieveChat: [
        {
            type: mongoose.Schema.Types.ObjectId,
        },
    ],
    chatWallpaper: {
        type: String,
        default: "",  //  === TODO: set default chat wallpaper ====
    },
    profilePhoto: {
        type: String, //  === TODO: set default profile photo ====
        default: "",
    },
    socket_id: {
        type: String
    },
    isUserOnline: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


const User = new mongoose.model("User", UserSchema);
module.exports = User;
