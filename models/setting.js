const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
  picksAllowed: { type: Number, required: true },
  allowSignup: { type: Boolean, required: true },
}, {timestamps: true});

module.exports = mongoose.model('Setting', SettingSchema);
