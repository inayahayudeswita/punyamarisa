const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const axios = require('axios');

const detectToxicity = async (texts) => {
  try {
    const response = await axios.post('https://safetalksapi-production.up.railway.app/predict', { texts });
    const predictions = response.data?.predictions?.[0];
    const classMapping = response.data?.class_mapping;

    if (!predictions || !classMapping) return 'Not Labeled';

    const maxIndex = predictions.indexOf(Math.max(...predictions));
    return classMapping[String(maxIndex)];
  } catch (error) {
    console.error('❌ Error calling ML API:', error.response?.data || error.message);
    return 'Not Labeled';
  }
};

exports.getAllChats = async (req, res) => {
  try {
    const userId = req.query.user_id;
    const includeOwn = req.query.includeOwn === 'true';

    let filter = {};
    if (!includeOwn && userId) {
      filter = { user_id: { $ne: userId } };
    }

    const chats = await Chat.find(filter).populate('user_id', 'name email');
    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

exports.createChat = async (req, res) => {
  const { user_id, user_recipient, message, sender, avatar, replyTo } = req.body;

  try {
    if (!user_id || !message) {
      return res.status(400).json({ error: 'user_id and message are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: 'Invalid user_id format' });
    }

    const classification = await detectToxicity([message]);
    console.log('🔎 ML Classification:', classification);

    if (classification === 'Hate Speech') {
      return res.status(403).json({ error: 'Message contains hate speech and has been rejected by the system.' });
    }

    const label =
      classification === 'Offensive Chat' ? 'Offensive' :
      classification === 'Neither' ? 'Not Offensive' :
      'Not Labeled';

    const chatData = {
      user_id: new mongoose.Types.ObjectId(user_id),
      user_recipient: user_recipient || 'public',
      message: message.trim(),
      sender: sender || 'Anonymous',
      avatar: avatar || '👤',
      replyTo: replyTo || null,
      label
    };

    const newChat = new Chat(chatData);
    const savedChat = await newChat.save();
    await savedChat.populate('user_id', 'name email');

    res.status(201).json(savedChat);
  } catch (err) {
    console.error('❌ Error creating chat:', err);
    res.status(400).json({ error: 'Failed to create chat', details: err.message });
  }
};

exports.updateChat = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const classification = await detectToxicity([message]);
    console.log('🔄 Updated ML Classification:', classification);

    if (classification === 'Hate Speech') {
      return res.status(403).json({ error: 'Message contains hate speech and has been rejected by the system.' });
    }

    const label =
      classification === 'Offensive Chat' ? 'Offensive' :
      classification === 'Neither' ? 'Not Offensive' :
      'Not Labeled';

    const updated = await Chat.findByIdAndUpdate(
      id,
      { message, label },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating chat:', err);
    res.status(400).json({ error: 'Failed to update chat' });
  }
};

exports.deleteChat = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Chat.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(400).json({ error: 'Failed to delete chat' });
  }
};