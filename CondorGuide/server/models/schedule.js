import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  location_id: Number,
  year: Number,
  semester: String,
  day: String,
  start_time: String, 
  end_time: String
});

export default mongoose.model('Schedule', scheduleSchema);
