const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  weekNum: {type: Number, required: true},
  gameTimeEastern: {type: String, required: true},
  homeTeam: {type: String, required: true},
  homeSpreadDisplay: String,
  homeSpread: Number,
  homeScore: Number,
  homeResult: String,
  awayTeam: {type: String, required: true},
  awaySpreadDisplay: String,
  awaySpread: Number,
  awayScore: Number,
  awayResult: String,
}, {timestamps: true});

module.exports = mongoose.model('Game', GameSchema);
