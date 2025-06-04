import express from 'express';
import Classroom from '../models/classroom.js';

const router = express.Router();

router.post('/available', async (req, res) => {
  const { date, from, to, wing } = req.body;

  try {
    const classrooms = await Classroom.find({ wing });

    const available = classrooms.filter(room => {
      return !room.bookings.some(booking => {
        return booking.date === date &&
          (
            (from >= booking.from && from < booking.to) || // overlaps
            (to > booking.from && to <= booking.to) || 
            (from <= booking.from && to >= booking.to)
          );
      });
    });

    res.json(available);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching classrooms' });
  }
});

export default router;
