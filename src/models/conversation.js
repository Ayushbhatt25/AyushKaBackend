import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "WebsiteProject", required: true }
}, { timestamps: true });


const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
