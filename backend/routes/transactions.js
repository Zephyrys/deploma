const express = require('express');
const router = express.Router();
const { createBookingWithPayment } = require('../controllers/transactionController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, createBookingWithPayment);
module.exports = router;