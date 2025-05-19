const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const formDataRoutes = require("./routes/formDataRoutes");
const ownerDataRoutes = require("./routes/ownerDataRoutes");
const teamRoutes = require("./routes/teamRoutes");
const biddingPlayerRoute = require("./routes/biddingPlayerRoute");
// const teamRoutes=require("./routes/teamRoutes")

//latest updated

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("socketio", io);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/formData", formDataRoutes);
app.use("/api/ownerData", ownerDataRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/biddingPlayer", biddingPlayerRoute);

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Timer function
let countdownInterval = null;
let timerValue = 0;

function startCountdown(seconds, type, onEnd) {
  timerValue = seconds;
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    io.emit("timer-update", { value: timerValue, type });

    if (timerValue <= 0) {
      clearInterval(countdownInterval);
      io.emit("timer-ended", type);
      if (typeof onEnd === "function") onEnd(); // <<-- ye line important hai
    }

    timerValue--;
  }, 1000);
}

// Socket logic
io.on("connection", (socket) => {
  console.log("new client connected");

  let currentBiddingPlayer = null;
  let bidReceived = false;
  let latestBid = null;
  let bidTimeout = null;
  let counterBidTimeout = null;

  socket.on("start-auction", (player) => {
    currentBiddingPlayer = player;
    bidReceived = false;
    latestBid = null;

    io.emit("auction-started", player);
    startCountdown(12, "initial");
  });

  socket.on("clear-bidding-player", () => {
    io.emit("clear-bidding-player"); //  Yeh OwnerDashboard ko cleanup karta hai
  });

  socket.on("new-bid", (data) => {
    bidReceived = true;
    latestBid = data;

    io.emit("bid-updated", data);
    startCountdown(10, "counter");
  });

  socket.on("auction-ended", (result) => {
    if (counterBidTimeout) {
      clearTimeout(counterBidTimeout);
    }

    io.emit("auction-ended", result);

    currentBiddingPlayer = null;
    bidReceived = false;
    latestBid = null;

    io.emit("get-next-player");
  });

  socket.on("player-status-updated", (data) => {
    // console.log("Server received player-status-updated:", data); //  Add this log

    io.emit("player-status-changed", data);
  });

 socket.on("update-owner-points", async ({ ownerId, newPoints }) => {
  try {
    const Owner = require("./models/OwnerData");
    await Owner.findByIdAndUpdate(ownerId, { points: newPoints });

    // 🔁 Notify all clients
    io.emit("owner-points-updated", { ownerId, newPoints });
  } catch (error) {
    console.error("Failed to update owner points:", error);
  }
});


  socket.on("upcoming-player", (player) => {
    io.emit("show-upcoming-player", player);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
