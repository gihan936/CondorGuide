import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.ATLAS_URL}/CondorGuide`);
        console.log(`MongoDB Connected to database: ${conn.connection.name}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export default connectDB;