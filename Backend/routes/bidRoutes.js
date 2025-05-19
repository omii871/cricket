// const express = require("express");
// const router = express.Router();
// const Bid = require("../models/Bid");

// router.post("/placeBid", async (req, res) => {
//   try {
//     const {  playerId } = req.body;
//     if (!playerId ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     const newBid = new Bid({  playerId });
//     await newBid.save();
//     res.status(201).json({ message: "Bid placed successfully", bid: newBid });
//   } catch (error) {
//       console.log(error);
//     res.status(500).json({ message: "server error", error });
    
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const bids = await Bid.find().populate("ownerId").populate("playerId");
//     res.status(200).json(bids);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching bids", error });
//   }
// });  


// module.exports = router;
