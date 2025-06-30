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

// POST route to add a new schedule
router.post('/', async (req, res) => {
  try {
    const {
      year,
      semester,
      day,
      start_time,
      end_time,
      start_date,
      is_recurring,
      location_id,
    } = req.body;

    // Basic validation (you can add more)
    if (
      !year ||
      !semester ||
      !day ||
      !start_time ||
      !end_time ||
      !start_date ||
      location_id === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newSchedule = new Schedule({
      year,
      semester,
      day,
      start_time,
      end_time,
      start_date: new Date(start_date),
      is_recurring: is_recurring !== undefined ? is_recurring : true,
      location_id,
    });

    await newSchedule.save();

    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;

    const deleted = await Schedule.findByIdAndDelete(scheduleId);
    if (!deleted) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Failed to delete schedule:', err);
    res.status(500).json({ error: 'Server error deleting schedule' });
  }
});

export default router;