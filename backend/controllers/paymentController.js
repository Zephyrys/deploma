
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PaymentGateway = require('../services/PaymentGateway');
const { updateBookingStatus,markSeatsAsOccupied  } = require('./bookingController');
const { generateTickets }= require('./ticketController');
const Session = require('../models/Session');
const { validateSessionForPayment } = require('./sessionController');
const processPayment = async (req, res) => {
  const sessionTx = await mongoose.startSession();
  sessionTx.startTransaction();

  try {
    const { bookingId, amount, cardDetails, selectedSeats } = req.body;

    const booking = await Booking.findById(bookingId).session(sessionTx);
    if (!booking) throw new Error('Бронювання не знайдено');

    const session = await validateSessionForPayment(booking.sessionId, sessionTx);

    const gateway = new PaymentGateway();
    const paymentResp = await gateway.processPayment(cardDetails, amount);
    if (!paymentResp.success) throw new Error(paymentResp.message);

    const payment = new Payment({
      bookingId: booking._id,
      amount,
      status: 'success',
      paymentMethod: 'card',
      paymentId: paymentResp.paymentId,
      paymentDate: new Date(),
      cardLast4: cardDetails.number.slice(-4),
      transactionId: paymentResp.paymentId,
      seats: selectedSeats
    });
    await payment.save({ session: sessionTx });

    await updateBookingStatus(booking._id, 'paid', 'confirmed');
    await markSeatsAsOccupied(booking, selectedSeats, sessionTx);

    const tickets = await generateTickets(booking, selectedSeats, sessionTx);

    await sessionTx.commitTransaction();
    res.status(200).json({ success: true, payment, tickets });

  } catch (err) {
    await sessionTx.abortTransaction();
    console.error('[processPayment] Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    sessionTx.endSession();
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ error: 'Платіж не знайдено' });

    res.json({
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paymentDate,
      transactionId: payment.transactionId,
      cardLast4: payment.cardLast4
    });
  } catch (err) {
    console.error('[getPaymentStatus] Error:', err);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
};
module.exports = {
  processPayment,
  getPaymentStatus
};
