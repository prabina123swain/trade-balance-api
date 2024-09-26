const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const tradeRoutes = require('./routes/TradeRoutes');

const app = express();
app.use(express.json()); // Middleware to parse JSON body

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Use trade routes
app.use('/api', tradeRoutes);

// Server listening
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
