const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET all chats
router.get('/', chatController.getAllChats);

// POST new chat
router.post('/', chatController.createChat);

// PUT update chat
router.put('/:id', chatController.updateChat);

// DELETE chat
router.delete('/:id', chatController.deleteChat);

module.exports = router;