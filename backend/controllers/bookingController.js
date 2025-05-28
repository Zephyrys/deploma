// const mongoose = require('mongoose');
// const Booking = require('../models/Booking');
// const Session = require('../models/Session');

// // Функція для отримання всіх бронювань користувача
// const getUserBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ userId: req.user.userId }).populate('sessionId');
//     res.json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching bookings' });
//   }
// };

// // Функція для створення нового бронювання
// const createBooking = async (req, res) => {
//   try {
//     const { sessionId, seats } = req.body;
//     console.log('CREATING BOOKING');
//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         error: "Невірний ID сеансу"
//       });
//     }

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         error: "Сеанс не знайдено"
//       });
//     }
//     console.log(seats)
//     if (!seats) {
//       return res.status(400).json({
//         success: false,
//         error: "Не вибрано жодного місця"
//       });
//     }

//     console.log("IS BUSY?");
//     const isBusy = seats.some(({ row, seat }) => {
//   console.log(`Checking seat at row: ${row}, seat: ${seat}`);
  
//   if (session.seats[row] && session.seats[row][seat] !== undefined) {
//     const seatInfo = session.seats[row][seat];
//     if (seatInfo === true) { 
//       return true; 
//     }
//   }
//   console.log(`Invalid seat at row ${row}, seat ${seat}`);
//   return false; 
// });



//     if (isBusy) {
//       return res.status(400).json({
//         success: false,
//         error: "Деякі місця вже зайняті іншим користувачем"
//       });
//     }

//     // Позначаємо місця як зайняті і прив'язуємо до користувача
//     seats.forEach(({ row, seat }) => {
//       if (!session.seats[row][seat].isOccupied) {
//         session.seats[row][seat].isOccupied = true; // Позначаємо місце як зайняте
//         session.seats[row][seat].userId = req.user.userId; // Прив'язуємо до користувача
//         console.log(`Marking seat as occupied: row ${row}, seat ${seat}`);
//       }
//     });
//     console.log("SEATS" , seats)
 
//     await session.save();

//     const expiryTime = new Date();
//     expiryTime.setMinutes(expiryTime.getMinutes() + 5); // 5 minutes expiry time

//     const booking = await Booking.create({
//       sessionId,
//       userId: req.user.userId,
//       seats,
//       status: 'pending',
//       paymentStatus: 'processing',
//       amount: seats.length * session.seatPrice, // Обчислюємо суму
//       expiryTime
//     });
//     console.log('NEW BOOKING')
//     console.log(booking)
//     console.log('YEEEE');
//     res.status(201).json({
//       success: true,
//       data: booking,
//       bookingId: booking._id,
//     });

//     // Логіка для автоматичного видалення прострочених бронювань
//     setTimeout(async () => {
//   try {
//     const latestBooking = await Booking.findById(booking._id); // перечитуємо з бази

//     const now = new Date();
//     if (latestBooking && latestBooking.expiryTime <= now && latestBooking.status === 'pending') {
//       // Звільняємо місця
//       seats.forEach(({ row, seat }) => {
//         session.seats[row][seat].isOccupied = false;
//         session.seats[row][seat].userId = null;
//       });
//       await session.save();

//       await Booking.findByIdAndDelete(booking._id);
//       console.log('Booking expired and deleted');
//     }
//   } catch (err) {
//     console.error('Error during expiry check:', err);
//   }
// }, 300000); // 5 хвилин


//     console.log(booking, 'CREATED BOOKING');
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
// const updateBookingStatus = async (bookingId, paymentStatus, status) => {
//   try {
//     // Оновлюємо бронювання (status та paymentStatus)
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       {
//         $set: { 
//           status: status,              // Оновлюємо статус (наприклад, "confirmed")
//           paymentStatus: paymentStatus, // Оновлюємо статус платежу (наприклад, "paid")
//         },
//         $unset: { expiryTime: "" }, // Видаляємо поле expiryTime
//       },
//       { new: true } // Повертаємо оновлений документ
//     );

//     if (!updatedBooking) {
//       throw new Error('Не вдалося знайти бронювання');
//     }

//     console.log('Бронювання успішно оновлено:', updatedBooking);
//     return updatedBooking;
//   } catch (error) {
//     console.error('[updateBookingStatus] Помилка при оновленні бронювання:', error);
//     throw error;
//   }
// };


// module.exports = { getUserBookings, createBooking,updateBookingStatus };
// controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Session = require('../models/Session');

/**
 * Повертає всі бронювання користувача
 */
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).populate('sessionId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

/**
 * Створення бронювання + автоматичний таймаут видалення
 */
const createBooking = async (req, res) => {
  try {
    const { sessionId, seats } = req.body;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Перевірка та маркування місць
    const isBusy = seats.some(({ row, seat }) => session.seats[row][seat]?.isOccupied);
    if (isBusy) {
      return res.status(400).json({ success: false, error: 'Some seats are already occupied' });
    }
    seats.forEach(({ row, seat }) => {
      session.seats[row][seat].isOccupied = true;
      session.seats[row][seat].userId     = req.user.userId;
    });
    await session.save();

    // Створюємо бронювання
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
    const booking = await Booking.create({
      sessionId,
      userId: req.user.userId,
      seats,
      status: 'pending',
      paymentStatus: 'processing',
      amount: seats.length * session.seatPrice,
      expiryTime
    });

    // Таймаут на видалення простроченого
    setTimeout(async () => {
      const latest = await Booking.findById(booking._id);
      if (latest && latest.expiryTime <= new Date() && latest.status === 'pending') {
        session.seats.forEach((rowArr, r) =>
          rowArr.forEach((seatObj, s) => {
            if (seats.some(se => se.row===r && se.seat===s)) {
              session.seats[r][s].isOccupied = false;
              session.seats[r][s].userId     = null;
            }
          })
        );
        await session.save();
        await Booking.findByIdAndDelete(booking._id);
        console.log('Booking expired and deleted:', booking._id);
      }
    }, 5 * 60 * 1000);

    res.status(201).json({ success: true, data: booking, bookingId: booking._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Оновлення статусу бронювання (paymentStatus та status)
 */
const updateBookingStatus = async (bookingId, paymentStatus, status) => {
  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    { status, paymentStatus, $unset: { expiryTime: "" } },
    { new: true }
  );
  console.log('[updateBookingStatus] Updated:', updated);
  return updated;
};
async function getUserBookingIds(userId) {
  console.log(`[getUserBookingIds] Починаємо отримання бронювань для користувача: ${userId}`);
  const bookings = await Booking.find({ userId }, '_id');
  const bookingIds = bookings.map(b => b._id);
  console.log(`[getUserBookingIds] Знайдено бронювань: ${bookingIds.length}`);
  return bookingIds;
}
module.exports = {
  getUserBookings,
  createBooking,
  updateBookingStatus,
  getUserBookingIds
};
