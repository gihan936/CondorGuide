import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  id: {
    type: String,
  },
  phone: {
    type: String,
  },
  userType: {
    type: String,
    enum: ['student', 'faculty', 'staff'],
    default: 'student'
  },
  department: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'security', 'maintenance', 'admin', 'superadmin'],
    default: 'user'
  },
  resetCode: { type: String },
  resetCodeExpires: { type: Date }

});

const User = mongoose.model('User', userSchema);
export default User;
