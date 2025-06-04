import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  date: String,         
  from: String,         
  to: String,           
  roomNumber: String
});

export default mongoose.model('Schedule', scheduleSchema);
