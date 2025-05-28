const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }, 
  amount: { type: Number, required: true }, 
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }, 
  transactionId: {
    type: String,
    required: true
  },
  cardLast4: {
    type: String,
    required: true
  },
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }]
});

module.exports = mongoose.model('Payment', paymentSchema);