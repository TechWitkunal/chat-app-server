const express = require('express');
const router = express.Router();
const { messages, messagesTypes } = require('../controllers/analytics');

router.get("/messages", messages)
router.get("/messageTypes", messagesTypes)

module.exports = router; // Export the router
