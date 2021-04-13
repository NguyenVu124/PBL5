const mongoose = require("mongoose");

const Vehicle = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("vehicle", Vehicle);
