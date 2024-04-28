const Friend = require("../models/Friend");
const User = require("../models/User")
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { isValidString } = require("../utils/main");
const Group = require("../models/Group");

exports.getAllUsers = async (req, res) => {
    try {
        const userDB = req.user;

        // removing extra fields in all users object
        const allUsers = await User.find({}).select("-password -achieveChat -pinChat -createdAt -updatedAt -avatar -__v -chatWallpaper")

        let users = allUsers.filter(user => user.userName !== userDB.userName);
        // console.log(users, "-<< all users")
        users = Object.values(users)
        
        const group = await Group.find({})
        // console.log(group, "<- group")
        let filteredGroup = group.filter(group => group.members.includes(userDB._id));
        filteredGroup = Object.values(filteredGroup)
        console.log(Array.isArray(users), "<-- before type")
        console.log(Array.isArray(filteredGroup), "<-- before type")
        console.log(typeof filteredGroup)
        // console.log(typeof users, typeof filteredGroup, "-<<  users")
        let allContact = users.concat(filteredGroup);
        // let allContact = {...users, ...filteredGroup}
        // console.log(allContact, "-<< all users")
        

        return res.json({ success: true, statusCode: 200, message: "Successfully get all users", data: { ...allContact } })
        // return res.json(new ApiResponse(200, true, "Get all user successfully", { ...Object.values(filteredGroup) }))

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}

exports.addFriend = async (req, res) => {
    try {
        const user = req.user;
        if (req.body?.friendName == undefined) {
            throw new ApiError(400, "Friend name is required");
        }
        const { friendName } = req.body;
        if (!isValidString(friendName)) {
            throw new ApiError(400, "Friend name must be required");
        }

        // user id is wrong as user is not in the database
        if (!user) {
            throw new ApiError(404, "Please log in again");
        }

        // check username and friend name are the same, meaning the same user, and return a bad request
        if (friendName == user.userName) {
            throw new ApiError(300, "You can't become a friend of yourself");
        }

        const friendDB = await User.findOne({ userName: friendName });
        if (!friendDB) {
            throw new ApiError(400, "No friend found with this name.");
        }

        // Check if the users are already friends
        const isAlreadyFriend = await Friend.findOne({
            $or: [
                { user1: friendDB._id, user2: user._id },
                { user1: user._id, user2: friendDB._id },
            ],
        });

        if (isAlreadyFriend) {
            throw new ApiError(200, `'You' and '${friendDB.userName}' are already friends`);
        }

        const newFriendDB = await Friend.create({ user1: user._id, user2: friendDB._id });

        if (!newFriendDB) {
            throw new ApiError(500, "Internal server error. Try later");
        }

        return res.json(new ApiResponse(200, true, "Success, both are friends now"));

    } catch (error) {
        const errorMessage = error.message || "Internal Server error, please try later";
        return res.json({
            success: false,
            statusCode: error.statusCode || 500,
            message: errorMessage,
            error: undefined,
        });
    }
};


exports.getUserInfo = (req, res) => {
    try {
        const user = req.user;

        if (!user) { throw new ApiError(400, "Please logged in again") }

        const updateUser = user._doc;
        updateUser.id = updateUser._id;
        updateUser._id = undefined;
        updateUser.name = updateUser.userName;
        updateUser.userName = undefined;
        updateUser.password = undefined;
        updateUser.createdAt = undefined;
        updateUser.updatedAt = undefined;
        updateUser.__v = undefined;

        return res.json(new ApiResponse(200, true, "Get user successfully", { ...user._doc }))

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}

exports.updateUserAbout = async (req, res) => {
    try {
        const user = req.user;
        const newAbout = req.body.newAbout;

        if (!user) { throw new ApiError(400, "Please logged in again") }

        if (!(newAbout.length > 5 && newAbout.length <= 30)) {
            throw new ApiError(400, "User about should be in range of 5 to 30 character")
        }


        const updateUser = await User.findByIdAndUpdate(user._id, { about: newAbout })

        return res.json(new ApiResponse(200, true, "User about updated successfully", { about: newAbout }))

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}