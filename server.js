require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const moment = require('moment-timezone');
const fetchAndStorePrices = require('./services/fetchPrices');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection using .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api', require('./routes/index'));

// Cron job: every day at 18:08 Warsaw time (14:08 UTC)
cron.schedule('45 20 * * *', () => {
  console.log('⏰ Running scheduled fetch at 18:08', moment().tz('Europe/Warsaw').format());
  fetchAndStorePrices();
}, {
  timezone: 'Europe/Warsaw'
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
