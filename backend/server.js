const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// === Підключення до MongoDB ===
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('🟢 Підключено до MongoDB'))
  .catch((err) => console.error('🔴 Помилка підключення до MongoDB:', err));

// === Ініціалізація Express та HTTP сервера ===
const app = express();
const server = http.createServer(app);

// === Ініціалізація Socket.IO ===
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // Замінити на фронтенд адресу
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

// === Колекція блокувань місць ===
const seatLocks = new Map();  // Map<sessionId, { "row-seat": { socketId, timestamp } }>

// === Логіка Socket.IO ===
io.on('connection', (socket) => {
  console.log(`🟢 Клієнт підключився: ${socket.id}`);

  socket.on('join-session', async (sessionId) => {
    console.log(`➡️ Клієнт ${socket.id} приєднується до сеансу: ${sessionId}`);
    try {
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);
      if (!session) {
        console.log(`❌ Сеанс ${sessionId} не знайдено для клієнта ${socket.id}`);
        socket.emit('error', 'Сеанс не знайдено');
        return;
      }

      // Видалення застарілих блокувань (>5 хв)
      let locks = seatLocks.get(sessionId) || {};
      const now = Date.now();
      Object.keys(locks).forEach(seatKey => {
        if (now - locks[seatKey].timestamp > 300000) { // 5 хвилин
          console.log(`⏳ Звільнення місця ${seatKey} у сеансі ${sessionId} (застаріле блокування)`);
          delete locks[seatKey];
          io.to(sessionId).emit('seat-released', { 
            row: Number(seatKey.split('-')[0]), 
            seat: Number(seatKey.split('-')[1]) 
          });
        }
      });
      seatLocks.set(sessionId, locks);

      socket.join(sessionId);
      console.log(`✅ Клієнт ${socket.id} приєднався до кімнати сеансу ${sessionId}`);

      // Відправка початкового стану місць та блокувань
      socket.emit('seats-init', {
        seats: session.seats,
        locks: Object.keys(locks).reduce((acc, key) => {
          if (locks[key].socketId !== socket.id) acc[key] = true;
          return acc;
        }, {})
      });
      console.log(`📤 Відправлено початковий стан місць клієнту ${socket.id}`);

    } catch (err) {
      console.error('🔴 Помилка завантаження сеансу:', err);
      socket.emit('error', 'Помилка сервера');
    }
  });

  socket.on('toggle-seat', async ({ sessionId, row, seat }) => {
    console.log(`🔔 toggle-seat отримано: sessionId=${sessionId}, row=${row}, seat=${seat}, socketId=${socket.id}`);
    const seatKey = `${row}-${seat}`;
    let locks = seatLocks.get(sessionId) || {};

    try {
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);

      if (!session) {
        console.log('❌ Сеанс не знайдено у toggle-seat');
        socket.emit('seat-error', 'Сеанс не знайдено');
        return;
      }

      if (session.seats[row][seat].isOccupied) {
        console.log(`🚫 Місце ${seatKey} вже зайняте у сеансі ${sessionId}`);
        socket.emit('seat-error', 'Місце вже зайняте');
        return;
      }

      // Очищення старих блокувань
      const now = Date.now();
      Object.keys(locks).forEach(key => {
        if (now - locks[key].timestamp > 300000) { // 5 хвилин
          delete locks[key];
          io.to(sessionId).emit('seat-unlocked', {
            row: Number(key.split('-')[0]),
            seat: Number(key.split('-')[1])
          });
        }
      });

      if (locks[seatKey]) {
        if (locks[seatKey].socketId === socket.id) {
          // Розблокувати своє місце
          delete locks[seatKey];
          io.to(sessionId).except(socket.id).emit('seat-unlocked', { row, seat });
          socket.emit('seat-unlocked', { row, seat });
          console.log(`🔓 Клієнт ${socket.id} розблокував своє місце ${seatKey}`);
        } else {
          // Місце заблоковане іншим користувачем
          console.log(`🚫 Місце ${seatKey} заблоковане іншим користувачем (${locks[seatKey].socketId})`);
          socket.emit('seat-error', 'Місце заблоковане іншим користувачем');
          return;
        }
      } else {
        // Заблокувати місце
        locks[seatKey] = { socketId: socket.id, timestamp: now };
        io.to(sessionId).except(socket.id).emit('seat-locked', { row, seat });
        socket.emit('seat-locked', { row, seat });
        console.log(`🔒 Клієнт ${socket.id} заблокував місце ${seatKey}`);
      }

      seatLocks.set(sessionId, locks);

    } catch (err) {
      console.error('🔴 Помилка toggle-seat:', err);
      socket.emit('seat-error', 'Помилка блокування місця');
    }
  });

  socket.on('confirm-payment', async ({ sessionId, seats, paymentId }) => {
    console.log(`💳 Клієнт ${socket.id} підтверджує оплату ${paymentId} для сеансу ${sessionId} та місць:`, seats);
    try {
      const Session = mongoose.model('Session');
      const session = await Session.findById(sessionId);

      if (!session) {
        console.log(`❌ Сеанс ${sessionId} не знайдено для клієнта ${socket.id} при оплаті`);
        socket.emit('payment-error', 'Сеанс не знайдено');
        return;
      }

      // Оновлюємо місця як зайняті
      const updatedSeats = session.seats.map((rowArray, rowIdx) =>
        rowArray.map((seatObj, seatIdx) => {
          const isBooked = seats.some(s => s.row === rowIdx && s.seat === seatIdx);
          return isBooked ? { ...seatObj, isOccupied: true } : seatObj;
        })
      );

      await Session.findByIdAndUpdate(sessionId, { seats: updatedSeats }, { new: true });

      // Очищення блокувань для оплачених місць
      let locks = seatLocks.get(sessionId) || {};
      seats.forEach(({ row, seat }) => {
        const key = `${row}-${seat}`;
        if (locks[key]) {
          delete locks[key];
          console.log(`🆓 Звільнено місце ${key} після оплати`);
        }
      });
      seatLocks.set(sessionId, locks);

      // Оновлення для клієнтів
      io.to(sessionId).emit('seats-updated', updatedSeats);
      console.log(`📢 Оновлення місць надіслано всім клієнтам у сеансі ${sessionId}`);

      // НЕ ВІДКЛЮЧАЄМО КЛІЄНТА, щоби він міг продовжувати працювати
      socket.emit('payment-success', updatedSeats);

    } catch (err) {
      console.error('🔴 Помилка оновлення місць:', err);
      socket.emit('payment-error', 'Помилка підтвердження оплати');
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Клієнт відключився: ${socket.id}. Звільнення блокувань...`);
    seatLocks.forEach((locks, sessionId) => {
      let changed = false;
      Object.keys(locks).forEach(seatKey => {
        if (locks[seatKey].socketId === socket.id) {
          delete locks[seatKey];
          const [row, seat] = seatKey.split('-').map(Number);
          io.to(sessionId).emit('seat-released', { row, seat });
          console.log(`🆓 Звільнено місце ${seatKey} у сеансі ${sessionId} через відключення клієнта`);
          changed = true;
        }
      });
      if (changed) {
        seatLocks.set(sessionId, locks);
      }
    });
  });
});

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API-маршрути ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/halls', require('./routes/halls'));
// === Завантаження постерів ===
app.use('/api/uploads', require('./routes/posters'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Продуктивне оточення ===
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// === Обробка помилок ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Внутрішня помилка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// === Запуск сервера ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порті ${PORT}`);
});
