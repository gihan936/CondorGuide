import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import classroomRoutes from './routes/classroomRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import securityAlertRoutes from './routes/securityAlertRoutes.js'
import connectDB from './config/db.js'; 


dotenv.config();

// Connect to MongoDB
connectDB(); 

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/security-alerts', securityAlertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));