const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function isValidString(str) {
    try {
        return str !== null && typeof str === 'string' && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

exports.isAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers?.authorization;
        const cookieToken = req.cookies?.token;

        if (!authHeader && !cookieToken) {
            return res.status(401).json({ success: false, message: "Authentication required: No token provided." });
        }

        let token;
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring(7, authHeader.length); // Skip 'Bearer '
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (!isValidString(token)) {
            return res.status(401).json({ success: false, message: "Authentication failed: Invalid token format." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Authentication failed: Invalid token." });
        }

        console.log(decoded.userId, "<- decoded id in auth")
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication failed: User no longer exists." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};
