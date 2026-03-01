const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  isPaid: { type: Boolean, default: false },
  planId: { type: String, required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);