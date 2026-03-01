import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { requireAuth } from "@clerk/express";

const app = express();
// const { userId } = requireAuth(); // Removed top-level call


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

// app.use(express.json({ limit: "16kb" })); // Already in index.js

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/test", requireAuth(), (req, res) => {
    res.json({ message: "API is working", userID: req.auth().userId });
});


export { app };