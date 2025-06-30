<<<<<<< Updated upstream
// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import classroomRoutes from './routes/classroomRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import securityAlertRoutes from './routes/securityAlertRoutes.js';
import connectDB from './config/db.js';
import path from 'path';
=======
// In your main server file (index.js or server.js)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import issueRoutes from './routes/issueRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
>>>>>>> Stashed changes

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

<<<<<<< Updated upstream
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/security-alerts', securityAlertRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});
=======
// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routes
app.use('/api/issues', issueRoutes);

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
>>>>>>> Stashed changes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));