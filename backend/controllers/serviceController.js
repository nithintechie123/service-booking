const Service = require('../models/Service');
const Territory = require('../models/Territory');

// ======================== SERVICE ========================
exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: services });
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Service deactivated' });
  } catch (err) { next(err); }
};

// ======================== TERRITORY ========================
exports.getTerritories = async (req, res, next) => {
  try {
    const territories = await Territory.find({ isActive: true }).sort({ city: 1, areaName: 1 });
    res.json({ success: true, data: territories });
  } catch (err) { next(err); }
};

exports.createTerritory = async (req, res, next) => {
  try {
    const territory = await Territory.create(req.body);
    res.status(201).json({ success: true, data: territory });
  } catch (err) { next(err); }
};

exports.updateTerritory = async (req, res, next) => {
  try {
    const territory = await Territory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!territory) return res.status(404).json({ success: false, message: 'Territory not found' });
    res.json({ success: true, data: territory });
  } catch (err) { next(err); }
};

exports.deleteTerritory = async (req, res, next) => {
  try {
    await Territory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Territory deactivated' });
  } catch (err) { next(err); }
};

exports.detectTerritory = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    const territory = await Territory.findOne({ pincode, isActive: true });
    if (!territory) return res.status(404).json({ success: false, message: 'No service area for this pincode' });
    res.json({ success: true, data: territory });
  } catch (err) { next(err); }
};
