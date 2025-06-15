const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const EnergyPrice = require('../models/EnergyPrice');

router.get('/', async (req, res) => {
  try {
    const now = moment.tz('Europe/Warsaw');

    // Determine base time: if we are exactly at HH:00:00 or later in the minute, we start from this hour
    const baseTime = now.seconds() === 0 && now.minutes() % 1 === 0
      ? now.clone().startOf('hour')
      : now.clone().startOf('hour');

    // But to align to your logic:
    // if we're exactly on the hour (like 11:00:00), start from that hour,
    // otherwise (like 10:59:59 or 10:30:00), still start from current hour
    const forecastStart = now.minutes() === 0 && now.seconds() === 0
      ? now.clone().startOf('hour')
      : now.clone().startOf('hour');

    const today = now.format('YYYY-MM-DD');
    const tomorrow = now.clone().add(1, 'day').format('YYYY-MM-DD');

    const priceDocs = await EnergyPrice.find({
      business_date: { $in: [today, tomorrow] }
    });

    // Map prices into: { YYYY-MM-DD: { HH:00: value } }
    const priceMap = {};
    for (const doc of priceDocs) {
      priceMap[doc.business_date] = {};
      for (const price of doc.prices) {
        priceMap[doc.business_date][price.hour] = price.rce_pln;
      }
    }

    // Build 24-hour forecast starting from forecastStart
    const result = {};
    for (let i = 0; i < 24; i++) {
      const forecastTime = forecastStart.clone().add(i, 'hours');
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
