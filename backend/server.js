const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('🟢 Підключено до MongoDB'))
  .catch((err) => console.error('🔴 MongoDB помилка:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

require('./socket')(io, mongoose);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/halls', require('./routes/halls'));
app.use('/api/cinemas', require('./routes/cinema'));
app.use('/api/users', require('./routes/user'));
app.use('/api/uploads', require('./routes/posters'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { startCleanupInterval } =require('./services/cleanupSeats')




const PORT = process.env.PORT || 5000;
startCleanupInterval();
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
