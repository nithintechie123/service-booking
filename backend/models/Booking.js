const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    worker:      { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    service:     { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    territory:   { type: mongoose.Schema.Types.ObjectId, ref: 'Territory', required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    duration:    { type: Number, required: true, min: 1 }, // hours
    address:     { type: String, required: true },
    pincode:     { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    amount:      { type: Number, required: true },
    notes:       { type: String, trim: true },
    cancelReason:{ type: String, trim: true },
  },
  { timestamps: true }
);

bookingSchema.index({ territory: 1, status: 1 });
bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ customer: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
