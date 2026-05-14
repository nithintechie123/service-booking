const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    city:    { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
