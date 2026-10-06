const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const tradeRoutes = require("./routes/tradeRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.set("socketio", io);

// Rate Limiting to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { message: "Too many authentication attempts. Please try again later." }
});
app.use("/api/users/login", loginLimiter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected: PulseTrade Database"))
  .catch((error) => console.log("MongoDB Connection Error:", error));

app.get("/", (req, res) => {
  res.send("PulseTrade Engine API Running");
});

app.use("/api/trades", tradeRoutes);
app.use("/api/users", userRoutes);

// Error Handling Middleware must be at the bottom
app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log(`Trader Connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Trader Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Trading Engine running on port ${PORT}`));