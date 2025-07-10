import express from 'express';
import jwt from 'jsonwebtoken';
import SecurityAlert from '../models/SecurityAlert.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

// Report a new alert
router.post('/', protect, async (req, res) => {
  try {
    const { emergencyType, category = null } = req.body;

    const alert = new SecurityAlert({
      userId: req.user.userId,
      username: req.user.email.split('@')[0],
      emergencyType,
      category
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    console.error('Alert creation error:', err);
    res.status(500).json({ message: 'Failed to create alert' });
  }
});

// Get all alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await SecurityAlert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error('Fetch alerts error:', err);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// Pick an alert
router.put('/:id/pick', protect, async (req, res) => {
  try {
    const alert = await SecurityAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.isPicked = true;
    alert.pickedBy = req.user.userId;
    alert.pickedByName = req.user.email.split('@')[0];

    await alert.save();
    res.json(alert);
  } catch (err) {
    console.error('Pick alert error:', err);
    res.status(500).json({ message: 'Failed to pick alert' });
  }
});

// Resolve alert
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await SecurityAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (alert.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to resolve this alert' });
    }

    alert.resolved = true;
    await alert.save();

    res.json({ success: true, alert });
  } catch (err) {
    console.error('Resolve error:', err);
    res.status(500).json({ message: 'Failed to resolve alert' });
  }
});

export default router;
