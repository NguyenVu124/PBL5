const mongoose = require("mongoose");

const History = new mongoose.Schema({
  id_random: {
    type: String,
    required: true,
  },
  id_card: {
    type: String,
    required: true,
  },
  vehicle_number: {
    type: String,
    required: true,
  },
  time_in: {
    type: String,
    required: true,
  },
  time_out: {
    type: String,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("history", History);
