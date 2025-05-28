// const Ticket = require('../models/Ticket');
// const Booking = require('../models/Booking');

// // Функція, щоб отримати всі bookingId користувача
// async function getUserBookingIds(userId) {
//   console.log(`[getUserBookingIds] Починаємо отримання бронювань для користувача: ${userId}`);
//   const bookings = await Booking.find({ userId }, '_id');
//   const bookingIds = bookings.map(b => b._id);
//   console.log(`[getUserBookingIds] Знайдено бронювань: ${bookingIds.length}`);
//   return bookingIds;
// }

// const getUserTickets = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     console.log(`[getUserTickets] Запит квитків для користувача: ${userId}`);

//     const bookingIds = await getUserBookingIds(userId);
//     if (bookingIds.length === 0) {
//       console.log('[getUserTickets] Бронювання не знайдено, повертаємо порожній масив квитків');
//       return res.json([]);
//     }

//     const tickets = await Ticket.find({ bookingId: { $in: bookingIds } });
//     console.log(`[getUserTickets] Знайдено квитків: ${tickets.length}`);

//     res.json(tickets);
//   } catch (err) {
//     console.error('[getUserTickets] Помилка:', err);
//     res.status(500).json({ error: 'Помилка при отриманні квитків' });
//   }
// };

// module.exports = {
//   getUserTickets,
// };
// controllers/ticketController.js
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const Session = require('../models/Session');

const { v4: uuidv4 } = require('uuid');
const { getUserBookingIds } = require('./bookingController');

/**
 * Генерація та збереження квитків із QR-кодами
 */
// const generateTickets = async (booking, selectedSeats, session) => {
//   const ticketsData = await Promise.all(selectedSeats.map(async seat => {
//     const displayRow  = seat.row + 1;
//     const displaySeat = seat.seat + 1;
//     const ticketId    = uuidv4();
//     const qrPayload   = { row: displayRow, seat: displaySeat, sessionId: booking.sessionId.toString(), bookingId: booking._id.toString(), id: ticketId };
//     const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload));

//     return { row: displayRow, seat: displaySeat, bookingId: booking._id, sessionId: booking.sessionId, price: booking.amount, qrCode: qrCodeDataURL };
//   }));

//   const tickets = await Ticket.insertMany(ticketsData, { session });
//   console.log(`Inserted ${tickets.length} tickets`);
//   return tickets;
// };
const generateTickets = async (booking, selectedSeats, sessionTx) => {
  // Спершу підвантажуємо всі дані сеансу, фільму, залу та кінотеатру
  const session = await Session.findById(booking.sessionId)
    .populate('movieId')
    .populate({ path: 'hallId', populate: { path: 'cinemaId' } })
    .session(sessionTx);

  if (!session) throw new Error('Session not found for ticket generation');
  const hall      = session.hallId;
  const movie      = session.movieId;
  const cinema     = session.hallId.cinemaId;
  // Якщо у моделі Movie є поле format, інакше за замовчуванням 2D
  const format     = hall.amenities[0] || '2D';
  const startTime  = session.startTime;
  const endTime    = session.endTime;
  const seatPrice  = session.seatPrice;

  const ticketsData = await Promise.all(selectedSeats.map(async seat => {
    const displayRow   = seat.row + 1;
    const displaySeat  = seat.seat + 1;
    const ticketUuid   = uuidv4();
    const qrPayload    = {
      movie:movie.title,
      format:format,
      row: displayRow,
      seat: displaySeat,
      sessionId: session._id.toString(),
      bookingId: booking._id.toString(),
      ticketId: ticketUuid
    };
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload));
    return {
      row:            displayRow,
      seat:           displaySeat,
      movieTitle:     movie.title,
      movieFormat:    format,
      price:          seatPrice,
      sessionId:      session._id,
      sessionStart:   startTime,
      sessionEnd:     endTime,
      cinema:         cinema.name,
      bookingId:      booking._id,
      status:         'reserved',
      qrCode:         qrCodeDataURL
    };
  }));

  const tickets = await Ticket.insertMany(ticketsData, { session: sessionTx });
  console.log(`Inserted ${tickets.length} tickets`);
  return tickets;
};
/**
 * Повернення квитків користувача
 */
const getUserTickets = async (req, res) => {
  const { userId }  = req.query;
  const bookingIds  = await getUserBookingIds(userId);
  const tickets     = await Ticket.find({ bookingId: { $in: bookingIds } });
  res.json(tickets);
};

module.exports = {
  generateTickets,
  getUserTickets
};
