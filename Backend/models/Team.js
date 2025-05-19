const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OwnerData",
    required: true,
  },
  ownerName: { type: String, required: true },
  players: [
    {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
      playerName: { type: String, required: true },
      bidAmount: { type: Number, required: true },
      playerStyle: { type: String, required: true },

    },
  ],
});

module.exports = mongoose.model("Team", teamSchema);
