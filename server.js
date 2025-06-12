const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ Whitelist domain yang diizinkan
const allowedOrigins = [
  'https://fe-safetalks.vercel.app',
  'https://frontend-three-ruby-79.vercel.app',
  'http://localhost:3000' // optional untuk pengembangan lokal
];

// ✅ Konfigurasi CORS
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 Request Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked for:', origin);
      callback(new Error('CORS policy violation: Not allowed by CORS'));
    }
  },
  credentials: true
};

// ✅ Middleware CORS diterapkan
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ Routing
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// ✅ Konfigurasi socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      console.log('📡 Socket.io Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('❌ Socket.io blocked:', origin);
        callback(new Error('CORS policy violation: Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('⚡️ User connected:', socket.id);

  socket.on('send_message', (data) => {
    console.log('📨 Broadcasting message:', data);
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('⚡️ User disconnected:', socket.id);
  });
});

// ✅ Endpoint root
app.get("/", (req, res) => {
  res.send("SafeTalks Backend Running!");
});

// ✅ Menjalankan server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));