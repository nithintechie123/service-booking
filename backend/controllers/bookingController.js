const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Territory = require('../models/Territory');
const Service = require('../models/Service');
const Payment = require('../models/Payment');

const COMMISSION_RATE = 0.10; // 10%

// @desc  Create booking (customer)
// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, bookingTime, duration, address, pincode, notes } = req.body;

    // Detect territory from pincode
    const territory = await Territory.findOne({ pincode, isActive: true });
    if (!territory)
      return res.status(400).json({ success: false, message: 'No service territory found for this pincode' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer profile not found' });

    const amount = service.basePrice * duration;

    const booking = await Booking.create({
      customer: customer._id,
      service: serviceId,
      territory: territory._id,
      bookingDate,
      bookingTime,
      duration,
      address,
      pincode,
      amount,
      notes,
      status: 'pending',
    });

    // Auto-assign worker using fair allocation (least recent job, same territory)
    const worker = await Worker.findOne({
      territory: territory._id,
      status: 'approved',
      availability: 'available',
    }).sort({ lastJobAt: 1, totalJobs: 1 }); // fair: pick least recently worked

    if (worker) {
      booking.worker = worker._id;
      await booking.save();
    }

    await booking.populate(['service', 'territory', { path: 'worker', populate: { path: 'user', select: 'name phone' } }]);

    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc  Get bookings for logged-in customer
// @route GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const bookings = await Booking.find({ customer: customer._id })
      .populate('service', 'name basePrice icon')
      .populate('territory', 'areaName pincode')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// @desc  Cancel booking (customer, before acceptance)
// @route PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    const booking = await Booking.findOne({ _id: req.params.id, customer: customer._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel once a worker has accepted' });
    booking.status = 'cancelled';
    booking.cancelReason = req.body.reason || 'Customer cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc  Worker: get territory bookings
// @route GET /api/bookings/worker
exports.getWorkerBookings = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const bookings = await Booking.find({ worker: worker._id })
      .populate('service', 'name basePrice icon')
      .populate('territory', 'areaName pincode')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// @desc  Worker: accept or reject a booking
// @route PUT /api/bookings/:id/respond
exports.respondToBooking = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' | 'reject'
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // CORE: territory validation
    if (booking.worker?.toString() !== worker._id.toString())
      return res.status(403).json({ success: false, message: 'This booking is not in your territory' });

    if (action === 'accept') {
      booking.status = 'accepted';
      worker.availability = 'busy';
      await worker.save();
    } else if (action === 'reject') {
      booking.status = 'rejected';
      booking.worker = null;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc  Worker: update job status
// @route PUT /api/bookings/:id/status
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const worker = await Worker.findOne({ user: req.user._id });
    const booking = await Booking.findOne({ _id: req.params.id, worker: worker._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const allowed = { accepted: ['in_progress'], in_progress: ['completed'] };
    if (!allowed[booking.status]?.includes(status))
      return res.status(400).json({ success: false, message: `Cannot move from ${booking.status} to ${status}` });

    booking.status = status;
    await booking.save();

    if (status === 'completed') {
      // Create payment record
      const commission = booking.amount * COMMISSION_RATE;
      await Payment.create({
        booking: booking._id,
        amount: booking.amount,
        commission,
        workerPayout: booking.amount - commission,
        paymentStatus: 'pending',
      });
      // Update worker stats
      worker.totalJobs += 1;
      worker.lastJobAt = new Date();
      worker.availability = 'available';
      worker.earnings += booking.amount - commission;
      await worker.save();
    }
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('territory')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
      .populate({ path: 'customer', populate: { path: 'user', select: 'name phone email' } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
