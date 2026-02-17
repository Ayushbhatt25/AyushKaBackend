import dotenv from "dotenv";
import connectDB from "./db/index.js";
import mongoose from "mongoose";



dotenv.config({
    path: "./.env"
});

connectDB();











/*
import express from "express";

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log('Connected to MongoDB');
        app.on('error', (error) => {
            console.error('Error in Express app:', error);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }  
})();

*/