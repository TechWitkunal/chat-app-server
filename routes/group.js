const express = require('express');
const { createGroup, updateMembers, userBlockGroup } = require('../controllers/group');
const { isAuthenticate } = require('../middlewares/auth');
const router = express.Router();

router.post('/createGroup', isAuthenticate, createGroup);
router.post('/addNewMembers', isAuthenticate, updateMembers);
router.post('/userBlockGroup', isAuthenticate, userBlockGroup);

module.exports = router; // Export the router
