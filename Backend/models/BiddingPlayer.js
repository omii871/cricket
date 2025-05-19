const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema(
  {
    // ownerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Owner",   // Owner model ka naam
    //   required: true,
    // },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormData",   
      // required: true,
    },
    bidAmount: {
      type: Number,
      // required: true,
      default: 0,  
    },
  },
//   { timestamps: true }
);

module.exports = mongoose.model("Bid", BidSchema);
