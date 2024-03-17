const express = require('express');
const { addMessage, getMessage } = require('../controllers/message');
const { isAuthenticate } = require('../middlewares/auth');
const router = express.Router();


router.post('/addMessage', isAuthenticate, addMessage);
router.post('/getMessage', isAuthenticate, getMessage);

module.exports = router; // Export the router
