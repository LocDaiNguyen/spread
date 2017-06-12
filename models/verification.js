const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
  type: { type: String, required: true },
  hash: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {timestamps: true});

module.exports = mongoose.model('Verification', VerificationSchema);