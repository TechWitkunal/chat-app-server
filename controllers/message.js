const ApiResponse = require("../utils/ApiResponse");
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const ApiError = require("../utils/ApiError");

const Message = require("../models/Message");

function isValidString(str) {
    try {
        return str !== null && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

function isValidUserId(id) {
    try {
        return mongoose.Types.ObjectId.isValid(id)
    } catch (error) {
        return false;
    }
}

function filterMessages(obj, from, to) {
    let newObj = [];
    obj.forEach(message => { if (message.to.toString() === to && message.from.toString() === from) { newObj.push(message); } });
    obj.forEach(message => { if (message.to.toString() === from && message.from.toString() === to) { newObj.push(message); } });
    return newObj;
}

exports.addMessage = async (message, from, to, messageType, fileUrl) => {
    try {
        // const { from, to, message, messageType, fileUrl } = req.body;
        console.log(message, from, to, messageType, fileUrl)
        let message2 = message, fileUrl2 = fileUrl;

        if (!isValidString(from) || !isValidString(to) || !isValidString(messageType)) {
            throw new ApiError(300, "all field is required");
        }

        if (!isValidUserId(from) || !isValidUserId(to)) {
            throw new ApiError(400, "Invalid user id");
        }

        if (from === to) {
            throw new ApiError(300, "You can't send a message to yourself");
        }

        console.log(from, to, message);

        if (messageType === "Text") {
            if (!isValidString(message)) { throw new ApiError(300, "Message is required"); }
            fileUrl2 = ""
        }
        else if (messageType === "Media") {
            if (!isValidString(fileUrl)) { throw new ApiError(300, "file url (media url) is required"); } message2 = ""
        }
        else { throw new ApiError(300, "invalid file type not allowed"); }

        console.log(message2, fileUrl2)

        const data = await Message.create({
            to, from, type: messageType,
            text: message2, fileUrl: fileUrl2
        });
        console.log(data)

        if (!data) { throw new ApiError(500, "Internal Server Error. Try later"); }

        // return res.json(new ApiResponse(200, true, "Successfully, messgae has been send"));
        return data;

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
}

exports.getMessage = async (req, res) => {
    try {
        const { to, from } = req.body;

        const allMessage = await Message.find({});

        let filteredMessage = filterMessages(allMessage, from, to)

        return res.json(new ApiResponse(200, true, "Successfully, get all message", {...filteredMessage}));


    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}