import mongoose from "mongoose";
import { DB_NAME } from "./Constants.js";

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