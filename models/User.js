const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  gender: { type: String, default: '' },
  timezone: { type: String, default: '' },
  country: { type: String, default: '' },
});

module.exports = mongoose.model('User', UserSchema);