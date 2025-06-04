import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  location_id: Number,
  location_name: String,
  location_type: String,
  location_number: String,
  description: String
});

export default mongoose.model('Classroom', classroomSchema);
