module.exports = (io, mongoose) => {
  const seatLocks = new Map(); 

  io.on('connection', (socket) => {
    console.log(`🟢 Клієнт підключився: ${socket.id}`);

    socket.on('join-session', async (sessionId) => {
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit('error', 'Сеанс не знайдено');
        return;
      }

      let locks = seatLocks.get(sessionId) || {};
      const now = Date.now();
      Object.keys(locks).forEach(seatKey => {
        if (now - locks[seatKey].timestamp > 300000) {
          delete locks[seatKey];
          io.to(sessionId).emit('seat-released', {
            row: Number(seatKey.split('-')[0]),
            seat: Number(seatKey.split('-')[1])
          });
        }
      });
      seatLocks.set(sessionId, locks);

      socket.join(sessionId);
      socket.emit('seats-init', {
        seats: session.seats,
        locks: Object.keys(locks).reduce((acc, key) => {
          if (locks[key].socketId !== socket.id) acc[key] = true;
          return acc;
        }, {})
      });
    });

    socket.on('toggle-seat', async ({ sessionId, row, seat }) => {
      const seatKey = `${row}-${seat}`;
      let locks = seatLocks.get(sessionId) || {};
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit('seat-error', 'Сеанс не знайдено');
        return;
      }

      if (session.seats[row][seat].isOccupied) {
        socket.emit('seat-error', 'Місце вже зайняте');
        return;
      }

      const now = Date.now();
      Object.keys(locks).forEach(key => {
        if (now - locks[key].timestamp > 300000) {
          delete locks[key];
          io.to(sessionId).emit('seat-unlocked', {
            row: Number(key.split('-')[0]),
            seat: Number(key.split('-')[1])
          });
        }
      });

      if (locks[seatKey]) {
        if (locks[seatKey].socketId === socket.id) {
          delete locks[seatKey];
          io.to(sessionId).except(socket.id).emit('seat-unlocked', { row, seat });
          socket.emit('seat-unlocked', { row, seat });
        } else {
          socket.emit('seat-error', 'Місце заблоковане іншим користувачем');
          return;
        }
      } else {
        locks[seatKey] = { socketId: socket.id, timestamp: now };
        io.to(sessionId).except(socket.id).emit('seat-locked', { row, seat });
        socket.emit('seat-locked', { row, seat });
      }

      seatLocks.set(sessionId, locks);
    });

    socket.on('confirm-payment', async ({ sessionId, seats, paymentId }) => {
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit('payment-error', 'Сеанс не знайдено');
        return;
      }

      const updatedSeats = session.seats.map((rowArray, rowIdx) =>
        rowArray.map((seatObj, seatIdx) => {
          const isBooked = seats.some(s => s.row === rowIdx && s.seat === seatIdx);
          return isBooked ? { ...seatObj, isOccupied: true } : seatObj;
        })
      );

      await Session.findByIdAndUpdate(sessionId, { seats: updatedSeats }, { new: true });

      let locks = seatLocks.get(sessionId) || {};
      seats.forEach(({ row, seat }) => {
        const key = `${row}-${seat}`;
        delete locks[key];
      });
      seatLocks.set(sessionId, locks);

      io.to(sessionId).emit('seats-updated', updatedSeats);
      socket.emit('payment-success', updatedSeats);
    });

    socket.on('disconnect', () => {
      seatLocks.forEach((locks, sessionId) => {
        let changed = false;
        Object.keys(locks).forEach(seatKey => {
          if (locks[seatKey].socketId === socket.id) {
            delete locks[seatKey];
            const [row, seat] = seatKey.split('-').map(Number);
            io.to(sessionId).emit('seat-released', { row, seat });
            changed = true;
          }
        });
        if (changed) seatLocks.set(sessionId, locks);
      });
    });
  });
};
