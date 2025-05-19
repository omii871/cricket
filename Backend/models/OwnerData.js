const mongoose = require("mongoose");

const ownerDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  teamName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  points: { type: Number, default: 100 },
  password: { type: String, required: true },

});

const OwnerData = mongoose.model("OwnerData", ownerDataSchema);
module.exports = OwnerData;
