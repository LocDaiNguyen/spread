const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  active: { type: Boolean, required: true },
  verify: { type: Boolean, required: true },
  paid: { type: Boolean, required: true },
  avatar: { type: String, required: true },
  admin: { type: Boolean, required: true },
  picks: [{ type: Schema.Types.ObjectId, ref: 'Pick' }],
}, {timestamps: true});

UserSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('User', UserSchema);
