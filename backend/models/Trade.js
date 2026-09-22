const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true }, // e.g. AAPL, BTC/USD, TSLA
    assetType: { type: String, required: true, enum: ["STOCK", "CRYPTO", "FOREX"] },
    type: { type: String, required: true, enum: ["BUY", "SELL"] },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    status: { type: String, enum: ["EXECUTED", "PENDING", "CANCELLED"], default: "EXECUTED" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);