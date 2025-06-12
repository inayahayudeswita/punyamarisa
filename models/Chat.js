const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_recipient: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    avatar: { type: String },
    replyTo: { type: String },
    label: {type: String,}
  }, { timestamps: true });  

module.exports = mongoose.model('Chat', chatSchema);
