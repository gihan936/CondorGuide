import express from 'express';
import mongoose from 'mongoose';
import Classroom from '../models/classroom.js';
import Schedule from '../models/schedule.js';

const router = express.Router();

router.post('/available', async (req, res) => {
  const { date, from, to, wing } = req.body;

  try {
    const inputDate = new Date(date);
    const day = inputDate.toLocaleDateString('en-US', { weekday: 'long' });

    const fromTime = `1900-01-01T${from}:00`;
    const toTime = `1900-01-01T${to}:00`;

    const allClassrooms = await Classroom.find({
      location_number: { $regex: `^2${wing}`, $options: 'i' },
      location_type: "Classroom"
    });

    const locationIds = allClassrooms.map(c => c.location_id);

    const overlappingSchedules = await Schedule.find({
      day,
      location_id: { $in: locationIds },
      $or: [
        { start_time: { $lt: toTime }, end_time: { $gt: fromTime } }
      ]
    });

    const bookedIds = overlappingSchedules.map(s => s.location_id);
    const availableRooms = allClassrooms.filter(c => !bookedIds.includes(c.location_id));

    res.json(availableRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error occurred.' });
  }
});

export default router;
