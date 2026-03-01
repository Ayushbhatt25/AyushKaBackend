import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  totalCreation: { type: Number, default: 0 },
  credits: { type: Number, default: 20 },
  emailVerified: { type: Boolean, default: false },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "WebsiteProject" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
}, { timestamps: true });

export default mongoose.model("User", UserSchema);