const express = require('express');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Socket.io library
require('dotenv').config();
const cors = require('cors');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Import Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const userRoutes = require('./routes/user.routes');
const checklistRoutes = require('./routes/checklist.routes');
const messageRoutes = require('./routes/message.routes'); // New Chat Routes
const intakeRoutes = require('./routes/intake.routes');
// CORS Configuration
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  /\.railway\.app$/,
  /\.vercel\.app$/
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'], // Must include x-access-token
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SOCKET.IO INTEGRATION ---
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // User joins a private room based on their ID
  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ID ${userId} joined room: user_${userId}`);
  });

  // Handle sending private messages
  socket.on('send_private_message', (data) => {
    // data = { senderId, receiverId, message }
    io.to(`user_${data.receiverId}`).emit('receive_private_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

// --- ROUTE INTEGRATION ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CarKeyper Node.js API.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api', checklistRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/intakes', intakeRoutes);

const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}.`);
  console.log('Socket.io is enabled and API endpoints are accessible.');
});

module.exports = app;