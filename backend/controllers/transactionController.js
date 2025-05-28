// const mongoose = require('mongoose');
// const Booking = require('../models/Booking');
// const Payment = require('../models/Payment');
// const Session = require('../models/Session');
// const { v4: uuidv4 } = require('uuid');

// // Функція для створення нового бронювання з платіжною транзакцією
// const createBookingWithPayment = async (req, res) => {
//   try {
//     const { sessionId, seats, cardDetails } = req.body;
    
//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({ error: "Невірний ID сеансу" });
//     }

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ error: "Сеанс не знайдено" });
//     }

//     // Перевірка на наявність місць у seats
//     if (!seats || seats.length === 0) {
//       return res.status(400).json({ error: "Не вибрано жодного місця" });
//     }

//     // Перевірка зайнятості місць
//     const isBusy = seats.some(({ row, seat }) => {
//       return session.seats[row] && session.seats[row][seat]; // Якщо місце зайняте
//     });

//     if (isBusy) {
//       return res.status(400).json({ error: "Деякі місця вже зайняті" });
//     }

//     // Позначаємо місця як зайняті
//     seats.forEach(({ row, seat }) => {
//       if (!session.seats[row][seat]) {
//         session.seats[row][seat] = true; // Позначаємо місце як зайняте
//       }
//     });
//     await session.save();

//     const expiryTime = new Date();
//     expiryTime.setMinutes(expiryTime.getMinutes() + 5); // 5 minutes expiry time

//     // Створення бронювання
//     const booking = await Booking.create({
//       sessionId,
//       userId: req.user.userId,
//       seats,
//       status: 'pending',
//       paymentStatus: 'processing',
//       amount: seats.length * session.seatPrice, // Обчислюємо суму
//       expiryTime
//     });

//     // Створення платіжної транзакції для цього бронювання
//     const payment = await Payment.create({
//       paymentId: uuidv4(),
//       bookingId: booking._id,
//       amount: seats.length * session.seatPrice,
//       status: 'pending',
//       cardLast4: cardDetails.number.slice(-4),  // Останні 4 цифри картки
//       transactionId: uuidv4()
//     });

//     // Оновлюємо статус бронювання після створення платіжної транзакції
//     booking.paymentStatus = 'processing';
//     await booking.save();

//     // Логіка для автоматичного видалення прострочених бронювань
//     setTimeout(async () => {
//       const now = new Date();
//       if (booking.expiryTime <= now && booking.status === 'pending') {
//         // Звільняємо місця
//         seats.forEach(({ row, seat }) => {
//           session.seats[row][seat] = false; // Звільняємо місце
//         });
//         await session.save();

//         await Booking.findByIdAndDelete(booking._id); // Видаляємо бронювання
//       }
//     }, 300000); // 5 minutes in milliseconds

//     res.status(201).json({
//       booking,
//       payment
//     });

//   } catch (error) {
//     res.status(500).json({
//       error: error.message
//     });
//   }
// };

// module.exports = { createBookingWithPayment };
