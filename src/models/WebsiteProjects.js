import mongoose from "mongoose";

const WebsiteProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initial_prompt: { type: String, required: true },
  current_code: { type: String, default: "" },
  current_version_index: { type: String, default: "" },
  clerkUserId: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }],
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Version" }]
}, { timestamps: true });

export default mongoose.model("WebsiteProject", WebsiteProjectSchema);
