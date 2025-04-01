require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Get client URL from environment variables with fallbacks
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = [
  clientUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://chatroom-client.vercel.app' // Add your Vercel deployment URL
];

// Configure Socket.io with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with retry logic
const connectToMongoDB = async (retryCount = 5, initialDelay = 3000) => {
  let currentRetry = 0;
  let delay = initialDelay;

  const connect = async () => {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${currentRetry + 1}/${retryCount})...`);
      
      const mongooseOptions = {
        serverSelectionTimeoutMS: 10000, // Timeout after 10s 
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        // Don't use directConnection with SRV format
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      
      await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      console.log('Connected to MongoDB');
      return true;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return false;
    }
  };

  while (currentRetry < retryCount) {
    const connected = await connect();
    if (connected) return true;
    
    console.log(`Connection failed. Retrying in ${delay / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    currentRetry++;
    delay *= 1.5; // Exponential backoff
  }

  console.log('Failed to connect to MongoDB after multiple attempts. Using in-memory storage.');
  return false;
};

// In-memory message store for fallback
const inMemoryMessages = {};

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Leave a room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, username } = data;
      
      // Create message object
      const messageObj = {
        id: Date.now().toString(),
        roomId,
        content: message,
        username,
        timestamp: new Date(),
        readBy: []
      };
      
      // Try to save to database
      try {
        const newMessage = new Message({
          roomId,
          content: message,
          username,
          timestamp: new Date()
        });
        
        const savedMessage = await newMessage.save();
        // Get the formatted ID from the saved message
        const savedMessageJson = savedMessage.toJSON();
        messageObj.id = savedMessageJson.id;
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Use in-memory fallback
        if (!inMemoryMessages[roomId]) {
          inMemoryMessages[roomId] = [];
        }
        inMemoryMessages[roomId].push(messageObj);
      }

      // Broadcast message to room
      io.to(roomId).emit('receive_message', messageObj);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Read receipt
  socket.on('message_read', (data) => {
    const { roomId, messageId } = data;
    io.to(roomId).emit('message_read_receipt', { messageId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    let messages = [];
    
    // Try to get from database
    try {
      messages = await Message.find({ roomId: req.params.roomId })
        .sort({ timestamp: 1 })
        .limit(50);
    } catch (dbError) {
      console.error('Error fetching from database:', dbError);
      // Fall back to in-memory
      messages = inMemoryMessages[req.params.roomId] || [];
    }
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route for easy verification
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Chat Room API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});


connectToMongoDB().catch(err => {
  console.error('Error in MongoDB connection process:', err);
  console.log('Continuing without database persistence - messages will not be saved');
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 