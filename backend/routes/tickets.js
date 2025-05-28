const express = require('express');
const { getUserTickets } = require('../controllers/ticketController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/', authenticate, getUserTickets);

module.exports = router;
