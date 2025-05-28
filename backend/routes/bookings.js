const express = require('express');
const {getUserBookings,createBooking} = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/', authenticate, getUserBookings);

router.post('/',authenticate, createBooking);

module.exports = router;