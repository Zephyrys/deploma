const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  movieId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  hallId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hall', 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'completed'], 
    default: 'scheduled' 
  },
  seats: {
    type: [[{
      isOccupied: { type: Boolean, default: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }]],
    required: true,
    default: function() {
      return this.hallId?.seats?.map(row => row.map(() => ({ 
        isOccupied: false, 
        userId: null 
      }))) || [];
    }
  },
  seatPrice: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  }
},{ timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);