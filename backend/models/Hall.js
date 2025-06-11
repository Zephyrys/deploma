const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  cinemaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cinema',
    required: true
  },
  seats: [[{
    isOccupied: { type: Boolean, default: false },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    }
  }]],
  amenities: [String]
},{ timestamps: true });

module.exports = mongoose.model('Hall', hallSchema);