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
      const hourStr = forecastTime.forma
