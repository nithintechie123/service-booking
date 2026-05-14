const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    basePrice:   { type: Number, required: true, min: 0 },
    category:    { type: String, trim: true },
    icon:        { type: String, default: 'wrench' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
