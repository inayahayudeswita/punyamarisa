require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const FRONTEND_URLS = [
  'http://localhost:5173', // local dev
  'https://punyamarisa-9m1u-ramoyj2fe-inayahayudeswitas-projects.vercel.app' // production
];

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.get('/', (req, res) => {
  res.send('Backend is running!');
});


const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
