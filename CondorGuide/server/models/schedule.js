import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  location_id: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true, // e.g., 'Monday'
  },
  start_time: {
    type: String,
    required: true, // e.g., '09:00'
  },
  end_time: {
    type: String,
    required: true, // e.g., '10:30'
  },
  start_date: {
    type: Date,
    required: true, // when this pattern or schedule starts
  },
  is_recurring: {
    type: Boolean,
    default: true, // whether this is a weekly pattern
  },
});

export default mongoose.model('Schedule', scheduleSchema);
