import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  location_id: {
    type: Number,
    unique: true,
    required: true,
  },
  location_name: {
    type: String,
    required: true,
    trim: true,
  },
  location_type: {
    type: String,
    required: true,
  },
  location_number: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  capacity: {
    type: Number,
    default: 0,
  },
  equipment: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Classroom = mongoose.model('Classroom', classroomSchema)

export default Classroom;
