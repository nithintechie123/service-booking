const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount:        { type: Number, required: true },
    commission:    { type: Number, required: true },    // platform cut
    workerPayout:  { type: Number, required: true },    // amount - commission
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
    transactionId: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
