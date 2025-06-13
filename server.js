require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-chat-git-main-inayahayudeswitas-projects.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// import routes (pastikan relative path benar)
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

app.get('/', (req, res) => {
  res.send('Backend running on Vercel!');
});

// untuk vercel serverless export
module.exports.handler = serverless(app);
