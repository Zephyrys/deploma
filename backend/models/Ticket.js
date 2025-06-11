const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
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

  movieTitle: {
    type: String,
    required: [true, 'Назва фільму обовʼязкова']
  },
  movieFormat: {
    type: [String],
    required: [true, 'Формат обовʼязковий']  
  },
  price: {
    type: Number,
    required: [true, 'Ціна обовʼязкова'],
    min: [0, 'Ціна не може бути відʼємною']
  },

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

  cinema: {
    type: String,
    required: [true, 'Назва кінотеатру обовʼязкова']
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'ID бронювання обовʼязковий']
  },

  status: {
    type: String,
    enum: {
      values: ['reserved', 'confirmed', 'canceled'],
      message: 'Невірний статус квитка'
    },
    default: 'reserved'
  },

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
