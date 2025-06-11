const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
   seats: [{
    row: {
      type: Number,
      required: true 
    },
    seat: {
      type: Number,
      required: true 
    }
  }],
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }],
    status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled'], 
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['processing', 'paid', 'failed'], 
  },
  expiryTime: {
    type: Date,
   
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);