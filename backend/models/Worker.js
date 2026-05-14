const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    territory:    { type: mongoose.Schema.Types.ObjectId, ref: 'Territory' },
    services:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    skills:       [{ type: String, trim: true }],
    documentPath: { type: String },
    status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    availability: { type: String, enum: ['available', 'unavailable', 'busy'], default: 'available' },
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    earnings:     { type: Number, default: 0 },
    totalJobs:    { type: Number, default: 0 },
    lastJobAt:    { type: Date },
    bio:          { type: String, trim: true },
    experience:   { type: Number, default: 0 }, // years
    hourlyRate:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

workerSchema.index({ territory: 1, availability: 1, status: 1 });

module.exports = mongoose.model('Worker', workerSchema);
