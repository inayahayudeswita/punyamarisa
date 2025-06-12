const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: ['https://fe-safetalks.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
  
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

const io = new Server(server, {
    cors: {
      origin: ['https://fe-safetalks.vercel.app'],
      methods: ['GET', 'POST']
    }
  });  

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', (data) => {
    console.log('Broadcasting message:', data);
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/", (req, res) => {
    res.send("SafeTalks Backend Running!");
  });
  

  const PORT = process.env.PORT || 5050;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));