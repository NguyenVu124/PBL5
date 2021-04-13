const mongoose = require("mongoose");

const IdCard = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
});
