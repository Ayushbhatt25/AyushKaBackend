import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const DB_NAME = process.env.DB_NAME || "AyushkaDatabase";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected : DB HOST : ${mongoose.connection.host} \n`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

export default connectDB;
