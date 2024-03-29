const express = require('express');
const { getAllUsers, addFriend, getUserInfo, updateUserAbout } = require('../controllers/user');
const { isAuthenticate } = require('../middlewares/auth');
const router = express.Router();

router.post('/getAllUsers', isAuthenticate, getAllUsers);
router.post('/addFriend', isAuthenticate, addFriend);
router.post('/getUserInfo', isAuthenticate, getUserInfo);
router.post('/updateUserAbout', isAuthenticate, updateUserAbout);


module.exports = router; // Export the router
