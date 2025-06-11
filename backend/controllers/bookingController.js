
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Session = require('../models/Session');

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'userId', select: 'email' }) 
      .populate('sessionId');

    const enrichedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      userEmail: booking.userId?.email || '—',
    }));

    res.status(200).json(enrichedBookings);
  } catch (err) {
    console.error('[getUserBookings] Error:', err);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

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

    const isBusy = seats.some(({ row, seat }) => session.seats[row][seat]?.isOccupied);
    if (isBusy) {
      console.error('[createBooking] 400')
      return res.status(400).json({ success: false, error: 'Some seats are already occupied' });
    }
    seats.forEach(({ row, seat }) => {
      session.seats[row][seat].isOccupied = true;
      session.seats[row][seat].userId     = req.user.userId;
    });
    await session.save();

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

    res.status(201).json({ success: true, data: booking, bookingId: booking._id });
  } catch (err) {
    console.error('[createBooking] Error:', err)
    res.status(500).json({ success: false, error: err.message });
  }
};


const updateBookingStatus = async (bookingId, status, paymentStatus) => {
  await Booking.findByIdAndUpdate(bookingId, {
    status,
    paymentStatus
  });
};
const markSeatsAsOccupied = async (booking, selectedSeats, sessionTx) => {
  booking.seats = booking.seats.map((s) => ({
    ...s,
    occupied: selectedSeats.some(
      (sel) => sel.row === s.row && sel.seat === s.seat
    ),
  }));
  await booking.save({ session: sessionTx });
};
async function getUserBookingIds(userId) {
  console.log(`[getUserBookingIds] Getting user bookings: ${userId}`);
  const bookings = await Booking.find({ userId }, '_id');
  const bookingIds = bookings.map(b => b._id);
  console.log(`[getUserBookingIds] Bookings finded: ${bookingIds.length}`);
  return bookingIds;
}
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid booking ID' });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const session = await Session.findById(booking.sessionId);
    if (session) {
      booking.seats.forEach(({ row, seat }) => {
        if (session.seats?.[row]?.[seat]) {
          session.seats[row][seat].isOccupied = false;
          session.seats[row][seat].userId = null;
        }
      });
      await session.save();
    }
    if (booking.tickets && booking.tickets.length > 0) {
      await Ticket.deleteMany({ _id: { $in: booking.tickets } });
    }

    await booking.deleteOne();

    res.json({ success: true, message: 'Бронювання, квитки та місця оновлені' });
  } catch (err) {
    console.error('[deleteBooking] Error: ', err);
    res.status(500).json({ success: false, error: 'Server error while deleting booking' });
  }
};



module.exports = {
  getUserBookings,
  createBooking,
  updateBookingStatus,
  getUserBookingIds,
  deleteBooking,
  markSeatsAsOccupied

};
