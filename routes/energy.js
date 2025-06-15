const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const EnergyPrice = require('../models/EnergyPrice');

router.get('/', async (req, res) => {
  try {
    // ⏱ Add 2 minutes to simulate forecast rounding up to the next hour
    const now = moment.tz('Europe/Warsaw').add(15, 'seconds');

    const today = now.format('YYYY-MM-DD');
    const tomorrow = now.clone().add(1, 'day').format('YYYY-MM-DD');

    // Fetch today's and tomorrow's prices
    const priceDocs = await EnergyPrice.find({
      business_date: { $in: [today, tomorrow] }
    });

    // Create a map: { "YYYY-MM-DD": { "HH:00": value } }
    const priceMap = {};
    for (const doc of priceDocs) {
      priceMap[doc.business_date] = {};
      for (const price of doc.prices) {
        priceMap[doc.business_date][price.hour] = price.rce_pln;
      }
    }

    // Generate forecast for next 24 hours, starting now (+2 minutes)
    const result = {};
    for (let i = 0; i < 24; i++) {
      const forecastTime = now.clone().add(i, 'hours');
      const dateStr = forecastTime.format('YYYY-MM-DD');
      const hourStr = forecastTime.format('HH:00');
      const label = `hour +${String(i).padStart(2, '0')}`;

      result[label] = {
        value: priceMap?.[dateStr]?.[hourStr] ?? null,
        hour: hourStr
      };
    }

    return res.json(result);
  } catch (err) {
    console.error('❌ Error in forecast route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
