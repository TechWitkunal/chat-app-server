const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function isValidString(str) {
    try {
        return str !== null && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

exports.isAuthenticate = async (req, res, next) => {
    try {
     
        let token;
        if (req.headers?.authorization == undefined && req.cookies?.token === undefined) {
            return res.json({ statusCode: 404, success: false, message: "Please login..." });
        }

        let headerTokenSplit = req.headers?.authorization.split(" ")[0];

        if (req.headers?.authorization && headerTokenSplit === "Bearer") { token = req.headers.authorization.split(" ")[1]; } 
        else if (req.cookies.token) { token = req.cookies.token; }

        if (!isValidString(token)) { return res.json({ statusCode: 404, success: false, message: "You are not logged in! Please log in to get access." }); }

        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify) { return res.json({ statusCode: 404, success: false, message: "Please login again" }); }

        // 3) Check if user still exists
        const this_user = await User.findById(verify.userId);
        if (!this_user) { return res.json({ statusCode: 300, success: false, message: "The user belonging to this token does no longer exists." }); }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = this_user;
        next(); // Call next to proceed to the next middleware
    } catch (error) {
        return res.json({ success: false, statusCode: 500, message: "Internal Server error please try later", error: error });
    }
};
