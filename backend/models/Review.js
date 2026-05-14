const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    worker:   { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ worker: 1 });

module.exports = mongoose.model('Review', reviewSchema);
