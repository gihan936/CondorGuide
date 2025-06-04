import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  roomNumber: String,
  wing: String
});

export default mongoose.model('Classroom', classroomSchema);
