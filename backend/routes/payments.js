    // routes/payment.js
    const express = require('express');
    const router = express.Router();
    const { processPayment, handlePaymentCallback,getPaymentStatus } = require('../controllers/paymentController');
    const authenticate = require('../middleware/authenticate');
    // router.post('/pay',authenticate, processPayment);
    // router.post('/callback',authenticate, handlePaymentCallback); // Додано callback-маршрут
    router.post('/', authenticate, processPayment);       // POST /api/payments
    router.post('/callback', handlePaymentCallback);     // POST /api/payments/callback
    router.get('/:paymentId', getPaymentStatus);  
    module.exports = router;