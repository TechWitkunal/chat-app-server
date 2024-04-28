const Group = require("../models/Group");
const ApiResponse = require("../utils/ApiResponse");
const { isValidString, getDayAndTime, isValidUserIdInArray, isValidMongooseId, convertIds } = require("../utils/main");
const User = require("../models/User");

exports.createGroup = async (req, res) => {
    try {
        // const cookie = req.cookies['name'];
        // console.log(cookie, "<- cookie")
        const userDB = req.user;
        const { groupName, desc, members, gropuPhotoUrl } = req.body;

        if (!isValidString(groupName)) {
            return res.json({ success: false, statusCode: 300, message: "All Fields are required", error: undefined });
        }

        if (members.length <= 0) {
            return res.json({ success: false, statusCode: 300, message: "Two member must be there", error: undefined });
        }

        if (!isValidUserIdInArray(members)) {
            return res.json({ success: false, statusCode: 400, message: "all member id should be valid", error: undefined });
        }

        let time = getDayAndTime();

        members.push(userDB._id);

        const isAllUserIdPresentInDb = await User.find({ _id: { $in: members } });

        // res.cookie('name', `kartik`, {
        //     maxAge: 86400000, // 24 hours in milliseconds
        //     httpOnly: true,   // true means the cookie is not accessible via JavaScript in the browser
        //     secure: false      // true means cookie will only be sent over HTTPS
        // });

        if (isAllUserIdPresentInDb.length !== members.length) {
            return res.json({ success: false, statusCode: 400, message: "Some user IDs do not exist in the database", error: undefined });
        }

        let membersMongooseId = convertIds(members);


        const newGroup = await Group.create({
            groupName: groupName,
            description: desc || `This group is created by ${userDB.userName}, on ${time[0]} at ${time[1]}`,
            groupLeader: userDB._id,
            groupPhoto: gropuPhotoUrl,
            members: membersMongooseId,
            canAdminChangeSetting: true,
            canMemberSendMessage: true,
            canMemberAddOther: true,
            groupAdmin: [],
            userBlockGroup: [],
        })

        if (!newGroup) {
            return res.json({ success: false, statusCode: 500, message: "Internal server error", error: undefined });
        }


        res.json(new ApiResponse(200, true, { newGroup }));

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}

exports.updateMembers = async (req, res) => {
    try {
        const { groupId, updateMembers } = req.body;

        if (!isValidString(groupId) || updateMembers.length <= 0 || updateMembers === undefined) { return res.json({ success: false, statusCode: 400, message: "All fields is required", error: undefined }); }
        if (!isValidUserIdInArray(updateMembers)) { return res.json({ success: false, statusCode: 400, message: "all member id should be valid", error: undefined }); }
        if (!isValidMongooseId(groupId)) { return res.json({ success: false, statusCode: 404, message: "Group Id is not valid", error: undefined }); }

        const group = await Group.findOne({ _id: groupId });

        if (!group) { return res.json({ success: false, statusCode: 401, message: "Group is does not exist", error: undefined }); }

        let initialGroupMembers = updateMembers;
        group.members = initialGroupMembers;

        await group.save();
        console.log(initialGroupMembers);

        res.json(new ApiResponse(200, true, { group }));

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}

exports.userBlockGroup = async (req, res) => {
    try {
        const { groupId, blockMemberId } = req.body;

        // Validate inputs
        if (!isValidString(groupId) || !isValidString(blockMemberId)) {
            return res.json({ success: false, statusCode: 400, message: "All fields are required", error: undefined });
        }
        if (!isValidMongooseId(groupId) || !isValidMongooseId(blockMemberId)) {
            return res.json({ success: false, statusCode: 404, message: "ID format is wrong", error: undefined });
        }

        // Find the group
        const group = await Group.findOne({ _id: groupId });
        if (!group) {
            return res.json({ success: false, statusCode: 401, message: "Group does not exist", error: undefined });
        }

        // Check if blockMemberId is in the members array and remove it if present
        const indexInMembers = group.members.indexOf(blockMemberId);
        if (indexInMembers !== -1) {
            group.members.splice(indexInMembers, 1);
        }

        // Check if blockMemberId is not in the userBlockGroup array and add it if absent
        if (!group.userBlockGroup.includes(blockMemberId)) {
            group.userBlockGroup.push(blockMemberId);
        }

        // Save the updated group document
        await group.save();
        res.json(new ApiResponse(200, true, { group }));

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
};
