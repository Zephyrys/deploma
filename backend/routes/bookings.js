const express = require('express');
const {getUserBookings,createBooking, deleteBooking } = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const { accessControl } = require('../middleware/accessControl');
router.get('/', authenticate,accessControl('read'), getUserBookings);

router.post('/',authenticate,accessControl('create'), createBooking);
router.delete('/:id', authenticate,accessControl('delete'),deleteBooking)
module.exports = router;