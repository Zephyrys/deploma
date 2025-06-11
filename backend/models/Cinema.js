const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  contactInfo: { type: String },
  openingHours: { type: String },
  city: { type: String },
  isActive: { type: Boolean, default: true },
},{ timestamps: true });

module.exports = mongoose.model('Cinema', cinemaSchema);