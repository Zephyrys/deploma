// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  // Ряд і місце
  row: {
    type: Number,
    required: [true, 'Ряд обовʼязковий'],
    min: [0, 'Номер ряду не може бути відʼємним']
  },
  seat: {
    type: Number,
    required: [true, 'Місце обовʼязкове'],
    min: [1, 'Номер місця повинен бути більше 0']
  },

  // Інформація про фільм
  movieTitle: {
    type: String,
    required: [true, 'Назва фільму обовʼязкова']
  },
  movieFormat: {
    type: String,
    required: [true, 'Формат фільму обовʼязковий']  // наприклад, "2D" або "3D"
  },

  // Ціна квитка
  price: {
    type: Number,
    required: [true, 'Ціна обовʼязкова'],
    min: [0, 'Ціна не може бути відʼємною']
  },

  // Інформація про сеанс
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'ID сеансу обовʼязковий']
  },
  sessionStart: {
    type: Date,
    required: [true, 'Дата/час початку сеансу обовʼязковий']
  },
  sessionEnd: {
    type: Date,
    required: [true, 'Дата/час завершення сеансу обовʼязковий']
  },

  // Інформація про кінотеатр
  cinema: {
    type: String,
    required: [true, 'Назва кінотеатру обовʼязкова']
  },

  // Бронювання
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'ID бронювання обовʼязковий']
  },

  // Статус квитка
  status: {
    type: String,
    enum: {
      values: ['reserved', 'confirmed', 'canceled'],
      message: 'Невірний статус квитка'
    },
    default: 'reserved'
  },

  // QR-код
  qrCode: {
    type: String,
    required: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Ticket', ticketSchema);
