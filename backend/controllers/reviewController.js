// ===================== REVIEW CONTROLLER =====================
const Review = require('../models/Review');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

exports.submitReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });
    const booking = await Booking.findOne({ _id: bookingId, customer: customer._id, status: 'completed' });
    if (!booking) return res.status(400).json({ success: false, message: 'Booking not found or not completed' });

    const exists = await Review.findOne({ booking: bookingId });
    if (exists) return res.status(400).json({ success: false, message: 'Review already submitted' });

    const review = await Review.create({ booking: bookingId, customer: customer._id, worker: booking.worker, rating, comment });

    // Update worker average rating
    const allReviews = await Review.find({ worker: booking.worker });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Worker.findByIdAndUpdate(booking.worker, { rating: Math.round(avg * 10) / 10, totalReviews: allReviews.length });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

exports.getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate({ path: 'customer', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};
