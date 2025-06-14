const express = require('express');
const router = express.Router();
const EnergyPrice = require('../models/EnergyPrice');

router.get('/', async (req, res) => {
  try {
    // Fetch all documents sorted by business_date (oldest to newest)
    const allData = await EnergyPrice.find().sort({ business_date: 1 });

    if (!allData || allData.length === 0) {
      return res.status(404).json({ error: 'No price data found' });
    }

    res.json(allData); // Return entire dataset
  } catch (err) {
    console.error('❌ /loxone error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
