const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvatarSchema = new Schema({
  avatar: { type: String, required: true },
}, {timestamps: true});

module.exports = mongoose.model('Avatar', AvatarSchema);
