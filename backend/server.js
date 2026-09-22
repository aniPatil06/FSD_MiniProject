const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const tradeRoutes = require("./routes/tradeRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

app.use(cors());
app.use(express.json());
app.set("socketio", io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected: PulseTrade Database"))
  .catch((error) => console.log("MongoDB Connection Error:", error));

app.get("/", (req, res) => {
  res.send("PulseTrade Engine API Running");
});

app.use("/api/trades", tradeRoutes);

io.on("connection", (socket) => {
  console.log(`Trader Connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Trader Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Trading Engine running on port ${PORT}`));