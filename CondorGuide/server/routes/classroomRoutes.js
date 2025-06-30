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
      location_number: { $regex: `^${wing}|^.${wing}`, $options: 'i' },
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

router.get('/all', async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch classrooms.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Classroom.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Classroom not found' });
    res.json({ message: 'Classroom deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete classroom.' });
  }
});

// PUT /api/classrooms/:id/status
router.put('/:id/status', async (req, res) => {
  const { isActive } = req.body;
  try {
    const updated = await Classroom.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update classroom status.' });
  }
});


// Update classroom details by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: Validate updateData fields here if needed

    const updated = await Classroom.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Classroom not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update classroom.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      location_id,
      location_name,
      location_type,
      location_number,
      description,
      capacity,
      equipment,
      isActive = true,
      availability = [],
    } = req.body;

    const newClassroom = new Classroom({
      location_id,
      location_name,
      location_type,
      location_number,
      description,
      capacity,
      equipment,
      isActive,
      availability,
    });

    const saved = await newClassroom.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating classroom:', err);
    res.status(500).json({ error: 'Failed to add new classroom' });
  }
});

export default router;
