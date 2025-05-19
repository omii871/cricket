const mongoose = require("mongoose");

const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  playerStyle: { type: String, required: true },
  jerseySize: { type: Number, required: true },
  shirtNumber: { type: Number, required: true },
  fileUrl: { type: String },
});

const FormData = mongoose.model("FormData", formDataSchema);

module.exports = FormData;
