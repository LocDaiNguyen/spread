const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./user');

const PickSchema = new Schema({
  pickedTeam: { type: String, required: true },
  weekNum: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
}, {timestamps: true});

PickSchema.post('remove', (pick) => {
  User.findById(pick.userId, (err, user) => {
    user.picks.pull(pick);
    user.save();
  });
});

module.exports = mongoose.model('Pick', PickSchema);
