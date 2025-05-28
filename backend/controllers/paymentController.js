// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');
// const Booking = require('../models/Booking');
// const Payment = require('../models/Payment');
// const Ticket = require('../models/Ticket');
// const PaymentGateway = require('../services/PaymentGateway');
// const QRCode = require('qrcode'); // ❗️ВАЖЛИВО: було відсутнє у тебе, тому додаємо
// const { updateBookingStatus } = require('./bookingController');

// const processPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { bookingId, amount, cardDetails, selectedSeats } = req.body;
//     if (!bookingId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
//       throw new Error('Невірні дані для обраних місць');
//     }

//     const booking = await Booking.findById(bookingId).session(session);
//     if (!booking) throw new Error('Бронювання не знайдено');

//     const bookedSeatsSet = new Set(booking.seats.map(bSeat => `${bSeat.row},${bSeat.seat}`));
//     const invalidSeats = selectedSeats.filter(seat => !bookedSeatsSet.has(`${seat.row},${seat.seat}`));
//     if (invalidSeats.length > 0) throw new Error('Обрані місця не відповідають бронюванню');

//     const paymentGateway = new PaymentGateway();
//     const paymentResponse = await paymentGateway.processPayment(cardDetails, amount);
//     if (!paymentResponse.success) throw new Error('Помилка оплати: ' + paymentResponse.message);

//     const payment = new Payment({
//       bookingId: booking._id,
//       amount,
//       status: 'success',
//       paymentMethod: 'card',
//       paymentId: paymentResponse.paymentId,
//       paymentDate: new Date(),
//       cardLast4: cardDetails.number.slice(-4),
//       transactionId: paymentResponse.paymentId,
//       seats: selectedSeats,
//     });
//     await payment.save({ session });

//     await updateBookingStatus(payment.bookingId, 'confirmed', 'paid');

//     // Генерація квитків з QR-кодами
//     const ticketsData = await Promise.all(selectedSeats.map(async (seat) => {
//       const displayRow = seat.row + 1;
//       const displaySeat = seat.seat + 1;

//       const ticketId = uuidv4(); // генеруємо унікальний ID для QR
//       const qrPayload = {
//         row: displayRow,
//         seat: displaySeat,
//         sessionId: booking.sessionId.toString(),
//         bookingId: booking._id.toString(),
//         id: ticketId
//       };

//       const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload));
//       console.log('QR CODE: ', qrCodeDataURL)
//       console.log(`✅ QR-код згенеровано для місця: ряд ${displayRow}, місце ${displaySeat}`);

//       return {
//         row: displayRow,
//         seat: displaySeat,
//         bookingId: booking._id,
//         sessionId: booking.sessionId,
//         price: booking.amount,
//         qrCode: qrCodeDataURL
//       };
//     }));

//     const tickets = await Ticket.insertMany(ticketsData, { session });
//     console.log(`✅ Вставлено ${tickets.length} квитків у базу.`);

//     booking.seats = booking.seats.map(seat => {
//       if (selectedSeats.some(s => s.row === seat.row && s.seat === seat.seat)) {
//         seat.occupied = true;
//       }
//       return seat;
//     });
//     await booking.save({ session });

//     await session.commitTransaction();
//     console.log('🎉 Оплата успішна. Квитки створено. ID бронювання:', booking._id.toString());

//     res.status(200).send({ success: true, tickets, payment });

//   } catch (err) {
//     await session.abortTransaction();
//     console.error('❌ Помилка при обробці платежу:', err.message);
//     res.status(500).send({ error: 'Помилка при обробці платежу: ' + err.message });
//   } finally {
//     session.endSession();
//   }
// };

// module.exports = {
//   processPayment
// };



// // Обробка зворотного виклику від платіжної системи
// const handlePaymentCallback = async (req, res) => {
//   try {
//     const { paymentId, status } = req.body;
//     console.log('[handlePaymentCallback] Callback отримано:', { paymentId, status });

//     const payment = await Payment.findOneAndUpdate(
//       { paymentId },
//       { status },
//       { new: true }
//     );

//     if (!payment) {
//       console.error('[handlePaymentCallback] Платіж не знайдено:', paymentId);
//       return res.status(404).json({ success: false, error: 'Платіж не знайдено' });
//     }

//     console.log('[handlePaymentCallback] Платіж оновлено:', payment);

//     if (status === 'success') {
//       await Booking.findByIdAndUpdate(
//         payment.bookingId,
//         { status: 'confirmed', paymentStatus: 'paid' }
//       );
//       console.log('[handlePaymentCallback] Бронювання оновлено як підтверджене');
//     }

//     res.status(200).json({
//       success: true,
//       paymentId: payment.paymentId,
//       status: payment.status
//     });

//   } catch (error) {
//     console.error('[handlePaymentCallback] Помилка:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Внутрішня помилка сервера'
//     });
//   }
// };

// // Отримання статусу платежу
// const getPaymentStatus = async (req, res) => {
//   try {
//     const { paymentId } = req.params;
//     console.log('[getPaymentStatus] Отримання статусу для paymentId:', paymentId);

//     const payment = await Payment.findOne({ paymentId });
//     if (!payment) {
//       console.error('[getPaymentStatus] Платіж не знайдено:', paymentId);
//       return res.status(404).json({ error: 'Платіж не знайдено' });
//     }

//     console.log('[getPaymentStatus] Статус платежу:', payment.status);

//     res.json({
//       status: payment.status,
//       amount: payment.amount,
//       paidAt: payment.paidAt,
//       transactionId: payment.transactionId,
//       cardLast4: payment.cardLast4
//     });

//   } catch (error) {
//     console.error('[getPaymentStatus] Помилка сервера:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// };

// module.exports = {
//   processPayment,
//   handlePaymentCallback,
//   getPaymentStatus
// };
// controllers/paymentController.js
const mongoose         = require('mongoose');
const Booking          = require('../models/Booking');
const Payment          = require('../models/Payment');
const Ticket           = require('../models/Ticket');
const PaymentGateway   = require('../services/PaymentGateway');
const { updateBookingStatus } = require('./bookingController');
const { generateTickets }     = require('./ticketController');

/**
 * Основна обробка платежу
 */
const processPayment = async (req, res) => {
  const sessionTx = await mongoose.startSession();
  sessionTx.startTransaction();
  try {
    const { bookingId, amount, cardDetails, selectedSeats } = req.body;

    // Перевірка бронювання
    const booking = await Booking.findById(bookingId).session(sessionTx);
    if (!booking) throw new Error('Booking not found');

    // Оплата через сторонній сервіс
    const gateway = new PaymentGateway();
    const paymentResp = await gateway.processPayment(cardDetails, amount);
    if (!paymentResp.success) throw new Error(paymentResp.message);

    // Збереження Payment
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

    // Оновлення бронювання
    await updateBookingStatus(booking._id, 'paid', 'confirmed');

    // Генерація квитків
    const tickets = await generateTickets(booking, selectedSeats, sessionTx);

    // Маркування місць як продані
    booking.seats = booking.seats.map(s => ({
      ...s,
      occupied: selectedSeats.some(sel => sel.row === s.row && sel.seat === s.seat)
    }));
    await booking.save({ session: sessionTx });

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

/**
 * Callback від платіжної системи
 */
const handlePaymentCallback = async (req, res) => {
  try {
    const { paymentId, status } = req.body;
    const payment = await Payment.findOneAndUpdate({ paymentId }, { status }, { new: true });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    if (status === 'success') {
      await updateBookingStatus(payment.bookingId, 'paid', 'confirmed');
    }

    res.json({ success: true, paymentId, status });
  } catch (err) {
    console.error('[handlePaymentCallback] Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Отримання статусу платежу
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.json({
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paymentDate,
      transactionId: payment.transactionId,
      cardLast4: payment.cardLast4
    });
  } catch (err) {
    console.error('[getPaymentStatus] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  processPayment,
  handlePaymentCallback,
  getPaymentStatus
};
