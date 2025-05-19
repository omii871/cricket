const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const Owner = require("../models/OwnerData");
const Player = require("../models/FormData");

router.post("/addPlayer", async (req, res) => {
  const { ownerId, ownerName, playerId, playerName, bidAmount, playerStyle } =
    req.body;

  // console.log("📨 Received data for adding to team:", req.body);
  try {
    let team = await Team.findOne({ ownerId });
    if (!team) {
      team = new Team({
        ownerId,
        ownerName,
        players: [],
      });
    }
    team.players.push({ playerId, playerName, bidAmount, playerStyle });
    await team.save();

    // Emit socket event
    const io = req.app.get("socketio");
    io.emit("player-added-to-team", {
      ownerId,
      player: { playerId, playerName, bidAmount, playerStyle },
    });

    res.status(200).json({ message: "player added to the team successfully" });
  } catch (error) {
    console.error("Error adding player to the team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// latest updated

const mongoose = require("mongoose");

router.get("/:ownerId", async (req, res) => {
  const { ownerId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid ownerId" });
    }

    const team = await Team.findOne({
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const playersWithStyle = await Promise.all(
      team.players.map(async (player) => {
        const fullPlayer = await Player.findById(player.playerId);
        return {
          ...player._doc,
          playerStyle: fullPlayer?.playerStyle || "Unknown",
        };
      })
    );

    res.json({ players: playersWithStyle });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// routes/teamRoutes.js
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find().populate("ownerId", "teamName").exec();
    // console.log(teams,"");

    if (!teams) {
      return res.status(404).json({ message: "No teams found" });
    }
    res.json({ teams });
  } catch (error) {
    console.error("Error fetching all teams:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
