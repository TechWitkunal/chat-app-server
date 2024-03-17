const Friend = require("../models/Friend");
const User = require("../models/User")
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

function isValidString(str) {
    try {
        return str !== null && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        console.log("users")
        const userDB = req.user;

        // removing extra fields in all users object
        const allUsers = await User.find({}).select("-password -achieveChat -pinChat -createdAt -updatedAt -avatar -__v -chatWallpaper")

        const users = allUsers.filter(user => user.userName !== userDB.userName);

        // return res.json({ success: true, statusCode: 200, message: "Successfully get all users", users: { ...users } })
        return res.json( new ApiResponse ( 200, true, "Get all user successfully", { ...users }) )

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500 , message: errorMessage, error: undefined });
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

        return res.json( new ApiResponse ( 200, true, "Get user successfully", { ...user._doc }) )
        
    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500 , message: errorMessage, error: undefined });
    }
}