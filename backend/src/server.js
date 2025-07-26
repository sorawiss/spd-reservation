const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const bookingsRouter = require('./routes/bookings');
const statsRouter = require('./routes/stats');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT ;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true
}));
app.use(express.json());

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SSPD Booking System Backend is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_date', (date) => {
    socket.join(`date_${date}`);
    console.log(`Client ${socket.id} joined date room: ${date}`);
  });
  
  socket.on('leave_date', (date) => {
    socket.leave(`date_${date}`);
    console.log(`Client ${socket.id} left date room: ${date}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`🚀 SSPD Booking System Backend running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time updates`);
}); 