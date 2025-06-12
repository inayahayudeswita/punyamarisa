require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-chat-git-main-inayahayudeswitas-projects.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Backend running!');
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
