
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const Session = require('../models/Session');

const { v4: uuidv4 } = require('uuid');
const { getUserBookingIds } = require('./bookingController');

const generateTickets = async (booking, selectedSeats, sessionTx) => {
  console.log('generateTickets called');
  try {
    const session = await Session.findById(booking.sessionId)
      .populate('movieId')
      .populate({ path: 'hallId', populate: { path: 'cinemaId' } })
      .session(sessionTx);

    if (!session) {
      console.log('Session not found!');
      throw new Error('Session not found for ticket generation');
    }

    const hall = session.hallId;
    const movie = session.movieId;
    const cinema = hall.cinemaId;
    const format = hall.amenities 
    const startTime = session.startTime;
    const endTime = session.endTime;
    const seatPrice = session.seatPrice;

    const ticketsData = await Promise.all(selectedSeats.map(async seat => {
      const displayRow = seat.row + 1;
      const displaySeat = seat.seat + 1;
      const ticketUuid = uuidv4();
      const qrPayload = {
        movie: movie.title,
        format: format,
        row: displayRow,
        seat: displaySeat,
        sessionId: session._id.toString(),
        bookingId: booking._id.toString(),
        ticketId: ticketUuid
      };
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload));
      return {
        row: displayRow,
        seat: displaySeat,
        movieTitle: movie.title,
        movieFormat: format,
        price: seatPrice,
        sessionId: session._id,
        sessionStart: startTime,
        sessionEnd: endTime,
        cinema: cinema.name,
        bookingId: booking._id,
        status: 'reserved',
        qrCode: qrCodeDataURL
      };
    }));

    const tickets = await Ticket.insertMany(ticketsData, { session: sessionTx });
    console.log(`Inserted ${tickets.length} tickets`);
    return tickets;

  } catch (error) {
    console.error('Error in generateTickets:', error);
    throw error;
  }
};
const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('getUserTickets called for userId:', userId);

    const bookingIds = await getUserBookingIds(userId);
    console.log('Booking IDs:', bookingIds);

    const tickets = await Ticket.find({ bookingId: { $in: bookingIds } });
    console.log(`Found ${tickets.length} tickets for user`);

    res.json(tickets);
  } catch (error) {
    console.error('Error in getUserTickets:', error);
    res.status(500).json({ error: 'Failed to get user tickets' });
  }
};


module.exports = {
  generateTickets,
  getUserTickets
};
