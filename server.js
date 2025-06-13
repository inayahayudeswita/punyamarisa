require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-chat-psi.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman, curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

app.get('/', (req, res) => {
  res.send('🚀 Backend running on Railway!');
});

// Listen on the PORT provided by Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
