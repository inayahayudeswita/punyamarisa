const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ Whitelist domain yang diizinkan
const allowedOrigins = ['https://fe-safetalks.vercel.app'];

// ✅ Middleware CORS dengan log origin
app.use(cors({origin:'*', credentials:true}));

app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// ✅ Socket.io config dengan log origin
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            console.log('👉 Socket.io Origin:', origin);
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn('❌ Socket.io Blocked CORS:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST']
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

// ✅ Root route
app.get("/", (req, res) => {
    res.send("SafeTalks Backend Running!");
});

// ✅ Run server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));