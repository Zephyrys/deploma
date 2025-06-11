    const express = require('express');
    const router = express.Router();
    const { processPayment,getPaymentStatus } = require('../controllers/paymentController');
    const authenticate = require('../middleware/authenticate');
    router.post('/', authenticate, processPayment);   
 
    router.get('/:id',authenticate, getPaymentStatus);  
    module.exports = router;