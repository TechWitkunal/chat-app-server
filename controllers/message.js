const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const Message = require("../models/Message");
const { isValidString, filterMessages, isValidMongooseId, objectToArray } = require("../utils/main");
const Group = require("../models/Group");

exports.addMessage = async (message, from, to, messageType, fileUrl) => {
    try {
        // const { from, to, message, messageType, fileUrl } = req.body;
        // console.log(message, from, to, messageType, fileUrl)
        let fileUrl2 = fileUrl;

        if (!isValidString(from) || !isValidString(to) || !isValidString(messageType)) {
            throw new ApiError(300, "all field is required");
        }

        if (!isValidMongooseId(from) || !isValidMongooseId(to)) {
            throw new ApiError(400, "Invalid user id");
        }

        if (from === to) {
            throw new ApiError(300, "You can't send a message to yourself");
        }

        // console.log(from, to, message);

        if (messageType === "Text") {
            if (!isValidString(message)) { throw new ApiError(300, "Message is required"); }
            fileUrl2 = ""
        }
        else if (messageType === "Media") {
            if (!isValidString(fileUrl)) { throw new ApiError(300, "file url (media url) is required"); }
        }
        else { throw new ApiError(300, "invalid file type not allowed"); }

        // console.log(message2, fileUrl2)

        const data = await Message.create({
            to, from, type: messageType,
            text: message, fileUrl: fileUrl2
        });
        // console.log(data)

        if (!data) { throw new ApiError(500, "Internal Server Error. Try later"); }

        // return res.json(new ApiResponse(200, true, "Successfully, messgae has been send"));
        return data;

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        if (errorMessage) { throw new ApiError(500, errorMessage); }
        // return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
}

exports.addGroupMessage = async (message, from, messageType, fileUrl, groupId) => {
    try {
        // const { from, to, message, messageType, fileUrl } = req.body;
        // console.log(message, from, messageType, fileUrl, groupId)
        let fileUrl2 = fileUrl;

        if (!isValidString(from) || !isValidString(messageType) || !isValidString(groupId)) {
            throw new ApiError(300, "all field is required");
        }

        if (!isValidMongooseId(from) || !isValidMongooseId(groupId)) {
            throw new ApiError(400, "Invalid User Id or group Id");
        }

        // console.log(from, to, message);

        if (messageType === "Text") {
            if (!isValidString(message)) { throw new ApiError(300, "Message is required"); }
            fileUrl2 = ""
        }
        else if (messageType === "Media") {
            if (!isValidString(fileUrl)) { throw new ApiError(300, "file url (media url) is required"); }
        }
        else { throw new ApiError(300, "invalid file type not allowed"); }

        // console.log(message2, fileUrl2)

        const group = await Group.findById( groupId );
        let memberList = {...group.members};
        memberList = objectToArray(memberList);
        // console.log(memberList);


        const data = await Message.create({
            from, type: messageType,
            text: message, fileUrl: fileUrl2,
            isInGroup: true, groupId: groupId,
            membersInGroup: memberList
        });
        // console.log(data)

        if (!data) { throw new ApiError(500, "Internal Server Error. Try later"); }

        // return res.json(new ApiResponse(200, true, "Successfully, messgae has been send"));
        return data;

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        if (errorMessage) { throw new ApiError(500, errorMessage); }
        // return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
}

exports.getMessage = async (req, res) => {
    try {
        const { to, from } = req.body;

        const allMessage = await Message.find({});
        // console.log(from, to, "<-- message")
        let filteredMessage = filterMessages(allMessage, from, to)

        return res.json(new ApiResponse(200, true, "Successfully, get all message", { ...filteredMessage }));


    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}