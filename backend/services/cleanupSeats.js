const Booking = require('../models/Booking');
const Session = require('../models/Session');

let isCleanupRunning = false;

async function deleteExpiredBooking(booking) {
  try {
    const session = await Session.findById(booking.sessionId);
    if (session && Array.isArray(session.seats)) {
      booking.seats.forEach(({ row, seat }) => {
        if (
          Array.isArray(session.seats[row]) &&
          session.seats[row][seat]
        ) {
          session.seats[row][seat].isOccupied = false;
          session.seats[row][seat].userId = null;
        }
      });
      await session.save();
    }

    await Booking.findByIdAndDelete(booking._id);
    console.log(`[deleteExpiredBooking] Deleted expired booking ${booking._id}`);
  } catch (err) {
    console.error(`[deleteExpiredBooking] Error deleting booking ${booking._id}:`, err);
  }
}

function getBookedSeatsSet(bookings) {
  const seatSet = new Set();
  bookings.forEach(booking => {
    booking.seats.forEach(seat => {
      const key = `${seat.row}-${seat.seat}`;
      seatSet.add(key);
    });
  });
  return seatSet;
}
async function cleanupSeats() {
  if (isCleanupRunning) {
    console.log('[cleanupSeats] Already running, skipping this run');
    return;
  }

  isCleanupRunning = true;

  try {
    console.log('[cleanupSeats] Start cleanup ');

    const now = new Date();

    const expiredBookings = await Booking.find({
      status: 'pending',
      expiryTime: { $lte: now }
    });

    console.log(`[cleanupSeats] Found ${expiredBookings.length} expired bookings`);
    for (const expiredBooking of expiredBookings) {
      await deleteExpiredBooking(expiredBooking);
    }
    const sessions = await Session.find();
    for (const session of sessions) {
      if (!Array.isArray(session.seats)) continue;
      const hasOccupiedSeats = session.seats.some(row =>
        row.some(seat => seat.isOccupied)
      );
      if (!hasOccupiedSeats) continue;

      const bookings = await Booking.find({
        sessionId: session._id,
        status: { $in: ['pending', 'confirmed'] },
      });

      const bookedSeatsSet = getBookedSeatsSet(bookings);
      let changed = false;

      session.seats.forEach((row, rowIndex) => {
        row.forEach((seatObj, seatIndex) => {
          if (seatObj.isOccupied) {
            const key = `${rowIndex}-${seatIndex}`;
            if (!bookedSeatsSet.has(key)) {
              seatObj.isOccupied = false;
              seatObj.userId = null;
              changed = true;
              console.log(`[cleanupSeats] Freed unused seat ${key} in session ${session._id}`);
            }
          }
        });
      });

      if (changed) {
        await session.save();
        console.log(`[cleanupSeats] Saved updated session ${session._id}`);
      }
    }

    console.log('[cleanupSeats] Cleanup finished');
  } catch (error) {
    console.error('[cleanupSeats] Error:', error);
  } finally {
    isCleanupRunning = false;
  }
}

function startCleanupInterval() {
  cleanupSeats();
  setInterval(cleanupSeats, 5 * 60 * 1000);
}

module.exports = { startCleanupInterval };
