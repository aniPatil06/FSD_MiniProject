const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");

// Execute / Create Trade (POST)
router.post("/", async (req, res) => {
  try {
    const trade = await Trade.create(req.body);
    const io = req.app.get("socketio");
    if (io) io.emit("trade_executed", trade); // Emit real-time market event
    res.status(201).json(trade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch All Order Book / Trades (GET)
router.get("/", async (req, res) => {
  try {
    const trades = await Trade.find().sort({ createdAt: -1 });
    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Trade Details (GET)
router.get("/:id", async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade record not found" });
    res.status(200).json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modify Trade (PUT)
router.put("/:id", async (req, res) => {
  try {
    const trade = await Trade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!trade) return res.status(404).json({ message: "Trade record not found" });
    const io = req.app.get("socketio");
    if (io) io.emit("trade_updated", trade);
    res.status(200).json(trade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel / Delete Trade (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade record not found" });
    const io = req.app.get("socketio");
    if (io) io.emit("trade_cancelled", { id: req.params.id });
    res.status(200).json({ message: "Trade cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;