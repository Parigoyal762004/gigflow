import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
