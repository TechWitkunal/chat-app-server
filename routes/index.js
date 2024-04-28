const router = require("express").Router();


const messageRoute = require("./message");
const authRoute = require("./auth")
const userRoute = require("./user")
const groupRoute = require("./group")

router.use("/auth", authRoute);
router.use("/group", groupRoute);
router.use("/user", userRoute);
router.use("/message", messageRoute);

module.exports = router;