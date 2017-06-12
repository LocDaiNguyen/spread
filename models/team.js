const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  abbr: { type: String, required: true },
  divisionId: { type: Number, required: true },
  city: { type: String, required: true },
  name: { type: String, required: true },
}, {timestamps: true});

module.exports = mongoose.model('Team', TeamSchema);
