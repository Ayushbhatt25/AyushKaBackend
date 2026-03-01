import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import userRoutes from "./routes/userRoute.js";

app.use(express.json());
app.use("/api", userRoutes);

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });