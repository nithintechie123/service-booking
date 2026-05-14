const mongoose = require('mongoose');

const territorySchema = new mongoose.Schema(
  {
    pincode:   { type: String, required: true, unique: true, trim: true },
    areaName:  { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    state:     { type: String, trim: true },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Territory', territorySchema);
