require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http'); // buat deploy serverless di Vercel

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-chat-git-main-inayahayudeswitas-projects.vercel.app"
];

// CORS setup
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes (pastikan path benar, relatif ke api/index.js)
const authRoutes = require('../routes/auth');
const chatRoutes = require('../routes/chat');

// Mount routes
app.use('./routes/auth', authRoutes);
app.use('./routes/chats', chatRoutes);

// Root route test
app.get('/', (req, res) => {
  res.send('Backend running on Vercel!');
});

// Export app and serverless handler
module.exports = app;
module.exports.handler = serverless(app);
