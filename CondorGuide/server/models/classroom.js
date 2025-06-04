import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  roomNumber: String,
  wing: String, // A Wing, B Wing, etc.
  bookings: [
    {
      date: String,          // "YYYY-MM-DD"
      from: String,          // "HH:mm"
      to: String             // "HH:mm"
    }
  ]
});

export default mongoose.model('Classroom', classroomSchema);
