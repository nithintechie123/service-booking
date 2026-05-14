const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getTerritories, createTerritory, updateTerritory, deleteTerritory, detectTerritory } = require('../controllers/serviceController');

router.get('/', getTerritories);
router.get('/detect/:pincode', detectTerritory);
router.post('/', protect, authorize('admin'), createTerritory);
router.put('/:id', protect, authorize('admin'), updateTerritory);
router.delete('/:id', protect, authorize('admin'), deleteTerritory);

module.exports = router;
