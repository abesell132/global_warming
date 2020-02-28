const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TemperatureSchema = new Schema({
  zipcode: {
    type: String,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  average: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = Temperature = mongoose.model("temperature", TemperatureSchema);
