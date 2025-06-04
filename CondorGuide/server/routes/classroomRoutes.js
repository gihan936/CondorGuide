import express from 'express';
import Classroom from '../models/classroom.js';
import Schedule from '../models/schedule.js';

const router = express.Router();

router.post('/available', async (req, res) => {
  const { date, from, to, wing } = req.body;

  try {
    const allRooms = await Classroom.find({ wing });

    const roomNumbers = allRooms.map(r => r.roomNumber);

    const bookings = await Schedule.find({
      date,
      roomNumber: { $in: roomNumbers },
      $or: [
        { from: { $lt: to }, to: { $gt: from } } 
      ]
    });

    const bookedRooms = bookings.map(b => b.roomNumber);
    const availableRooms = allRooms.filter(r => !bookedRooms.includes(r.roomNumber));

    res.json(availableRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
