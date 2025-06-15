const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const EnergyPrice = require('../models/EnergyPrice');

router.get('/', async (req, res) => {
  try {
    const now = moment.tz('Europe/Warsaw');

    // Determine if we should switch to next hour’s price
    const isFinalSeconds = now.minutes() === 59 && now.seconds() >= 50;

    // Forecast should start at the next hour if in last 10s before the hour
    const baseTime = isFinalSeconds
      ? now.clone().add(1, 'hour').startOf('hour')
      : now.clone().startOf('hour');

    const today = now.format('YYYY-MM-DD');
    const tomorrow = now.clone().add(1, 'day').format('YYYY-MM-DD');

    // Fetch prices from database
    const priceDocs = await EnergyPrice.find({
      business_date: { $in: [today, tomorrow] }
    });

    // Build a map of prices: { YYYY-MM-DD: { HH:00: value } }
    const priceMap = {};
    for (const doc of priceDocs) {
      priceMap[doc.business_date] = {};
      for (const price of doc.prices) {
        priceMap[doc.business_date][price.hour] = price.rce_pln;
      }
    }

    // Build forecast for next 24 hours
    const result = {};
    for (let i = 0; i < 24; i++) {
      const forecastTime = baseTime.clone().add(i, 'hours');
      const dateStr = forecastTime.format('YYYY-MM-DD');
      const hourStr = forecastTime.format('HH:00');
      const label = `hour +${String(i).padStart(2, '0')}`;

      result[label] = {
        value: priceMap?.[dateStr]?.[hourStr] ?? null,
        hour: hourStr
      };
    }

    res.json(result);
  } catch (err) {
    console.error('❌ Error in forecast route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
