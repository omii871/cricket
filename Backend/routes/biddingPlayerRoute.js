const express = require("express");
const router = express.Router();
const BiddingPlayer = require("../models/BiddingPlayer");

router.post("/setBiddingPlayer", async (req, res) => {
  try {
    await BiddingPlayer.deleteMany(); 
    const newPlayer = new BiddingPlayer(req.body);
    await newPlayer.save();
    res.status(200).json({ message: "Bidding player set successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.delete("/deleteBiddingPlayer", async (req, res) => {
  try {
    await BiddingPlayer.deleteMany(); 
    res.status(200).json({ message: "Bidding player deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete bidding player" });
  }
});



router.get("/getBiddingPlayer", async (req, res) => {
  try {
    const player = await BiddingPlayer.findOne().populate("playerId");
    res.status(200).json(player); // playerId ke andar full FormData details aayengi
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
