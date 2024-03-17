const router = require("express").Router();


const messageRoute = require("./message");
const authRoute = require("./auth")
const userRoute = require("./user")

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/message", messageRoute);

module.exports = router;