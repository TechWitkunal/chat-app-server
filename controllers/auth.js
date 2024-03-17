require('dotenv').config();
// const multer = require('multer');

// const upload = multer({ storage: storage });

const User = require('../models/User');
const bcrypt = require('bcryptjs'); // for hash passwords saving in database
var jwt = require('jsonwebtoken'); // for token authentication of users
// const { ApiError } = require('../utils/ApiError');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');


// this function will return you jwt token
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// check email is vaild or not ( return true or false )
function isValidEmail(email) {
    try {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email.toLowerCase());
    } catch (error) {
        return false;
    }
}

// check field is not only contain empty string or not null
function isValidString(str) {
    try {
        return str !== null && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

// default chat wallpaper
// const defaultChatWallpaper = "https://firebasestorage.googleapis.com/v0/b/online-chat-app-d822f.appspot.com/o/default%20images%2FScreenshot%202024-02-12%20164943_cleanup.png?alt=media&token=10e2f5ca-45a0-4d2d-b57b-c9737e1a40e4";
const defaultChatWallpaper = "https://firebasestorage.googleapis.com/v0/b/online-chat-app-d822f.appspot.com/o/default%20images%2Fchat%20wallpaper.png?alt=media&token=cdae4e95-da12-4255-8711-4b5efa6f7d35";


exports.register = async (req, res) => {
    try {
        // check email valid
        // check existing user exist with same email and username in db or not if yes than return bad res
        // using bcryptjs to modify password
        // update profile photo and avatar to firebase and upate in user
        // create user

        // { console.log(req.body);
        // return res.json({"Email is valid or not ->":isValidEmail(req.body.email)}); }
        const { name, about, email, password, imageUrl } = req.body;
        // console.log(imageUrl);

        // Validation
        if (!isValidString(name) || !imageUrl || !isValidString(about) || !isValidString(email) || !isValidString(password)) {
            throw new ApiError(400, "All fields are required")
        }
        if (!isValidEmail(email)) {
            throw new ApiError(400, "Email is not valid")
        }
        if (!(about.length > 5 && about.length <= 30)) {
            throw new ApiError(400, "About should be in range of 5 to 30 character")
        }
        if (password.length < 8) {
            throw new ApiError(300, "Password should be greater than or equal to 8 characters")
        }

        // Check if user exists with the same username or email
        const isUserExistWithSameUserName = await User.findOne({ userName: name });
        const isUserExistWithSameEmail = await User.findOne({ email: email });

        if (isUserExistWithSameUserName) {
            throw new ApiError(300, "Another User with this name already exists. Try something else")
        }

        if (isUserExistWithSameEmail) {
            throw new ApiError(300, "Another User with this email already exists. Try something else")
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            userName: name,
            password: bcryptPassword,
            about: about,
            email: email,
            chatWallpaper: defaultChatWallpaper,
            profilePhoto: imageUrl,
        });

        if (!newUser) {
            throw new ApiError(500, "here is some internal server error please try again later")
        }

        const token = signToken(newUser._id)

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            secure: true, // Set to true if served over HTTPS
            sameSite: 'None' // Set to 'None' for cross-origin requests
        });
        // return res.json( new ApiResponse ( 200, true, "Register successfully", { 
        // userId: newUser._id, token }) )

        return res.json(
            new ApiResponse(200, true, "Yor are register Successfully",
                {
                    token, userId: newUser._id, userDetails: {
                        name: newUser.userName,
                        about: newUser.about,
                        email: newUser.email,
                        pinChat: newUser.pinChat,
                        achieveChat: newUser.achieveChat,
                        chatWallpaper: newUser.chatWallpaper,
                        profilePhoto: newUser.profilePhoto
                    }
                })
        );

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(req.body)
        // Validation
        if (!isValidString(email) || !isValidString(password)) {
            throw new ApiError(404, "Email and password are required")
        }

        // Check if user exists with the provided email
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new ApiError(404, "Please provide correct credentials")
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Please provide correct credentials")
        }

        const token = signToken(user._id)

        // If everything is fine, return success message or token
        res.cookie('token', token);
        // console.log(res)

        return res.json(
            new ApiResponse(200, true, "Login Successfully",
                {
                    token, userId: user._id, userDetails: {
                        name: user.userName,
                        about: user.about,
                        email: user.email,
                        pinChat: user.pinChat,
                        achieveChat: user.achieveChat,
                        chatWallpaper: user.chatWallpaper,
                        profilePhoto: user.profilePhoto
                    }
                })
        );
    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }

}

exports.isUserOnline = async (req, res) => {
    try {
        // console.log(req , "JHGFDSA<++++++")
        if (!req.userName || !req.is) return;
        // Find the user by userName
        const user = await User.findOne({ userName: req.userName });

        // If user is not found, return appropriate response
        if (!user) {
            throw new ApiError(401, "Please provide correct credentials");
        }

        // Update the isUserOnline property
        user.isUserOnline = req.is;

        // Save the updated user
        await user.save();

        // Return success response
        return res.json(
            new ApiResponse(200, true, "Login Successfully",null));

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
};

exports.updateSocketId = async (req, res) => {
    try {
        // console.log(req , "JHGFDSA<++++++")
        if (!req.userName || !req.is) return;
        // Find the user by userName
        const user = await User.findOne({ userName: req.userName });

        // If user is not found, return appropriate response
        if (!user) {
            throw new ApiError(401, "Please provide correct credentials");
        }

        // Update the isUserOnline property
        user.socket_id = req.is;

        // Save the updated user
        await user.save();

        // Return success response
        return res.json(
            new ApiResponse(200, true, "Login Successfully",null));

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
};

exports.getUserNameBySocket = async (req, res) => {
    try {
        // console.log(req , "JHGFDSA<++++++")
        if (!req.id) return;
        // Find the user by userName
        const user = await User.findOne({ _id: req.id });
        // console.log(user)

        return user.userName;
        // return res.json(
            // new ApiResponse(200, true, "Login Successfully", {"name": user.userName}));

    } catch (error) {
        console.error("Error updating user status:", error);
        const errorMessage = error.message || "Internal Server error, please try later";
        return res.status(error.statusCode || 500).json({ success: false, statusCode: error.statusCode || 500, message: errorMessage });
    }
};

exports.logout = (req, res) => {
    try {

        res.clearCookie('token');
        res.json(new ApiResponse(200, true, "User logout successfully"));

    } catch (error) {
        const errorMessage = error.message || "Internal Server error please try later";
        return res.json({ success: false, statusCode: error.statusCode || 500, message: errorMessage, error: undefined });
    }
}