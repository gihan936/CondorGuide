import express from 'express';
import Schedule from '../models/schedule.js';

const router = express.Router();

router.get('/:location_id', async (req, res) => {
  const locationId = parseInt(req.params.location_id);

  try {
    const schedules = await Schedule.find({ location_id: locationId });
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedules for classroom.' });
  }
});

export default router;