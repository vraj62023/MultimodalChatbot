/**
 * @file index.js
 * @description Main entry point for the Backend.
 */
const connectDB = require('./services/databaseService');
const dotenv = require('dotenv');
dotenv.config();
connectDB(); 

const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running successfully!' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chats', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port vipin ${PORT}`);
});