require('dotenv').config(); // Load environment variables
const axios = require('axios');
const EnergyPrice = require('../models/EnergyPrice');

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
}

async function fetchAndStorePrices() {
  try {
    const dateFilter = getTomorrowDate();
    const baseUrl = process.env.PSE_API_BASE;

    if (!baseUrl) {
      throw new Error('❌ PSE_API_BASE is not defined in .env');
    }

    const priceApiUrl = `${baseUrl}?$filter=doba eq '${dateFilter}'`;
    console.log('Fetching data from:', priceApiUrl);

    const response = await axios.get(priceApiUrl);
    const rawData = response.data.value;

    const grouped = {};

    for (const item of rawData) {
      if (!item?.udtczas_oreb || !item?.rce_pln) {
        console.warn('⚠️ Skipping invalid item:', item);
        continue;
      }

      // Extract hour from "udtczas_oreb": e.g. "13:00 - 13:15"
      const match = item.udtczas_oreb.match(/^(\d{2}):\d{2}/);
      if (!match) {
        console.warn('⚠️ Invalid udtczas_oreb format:', item.udtczas_oreb);
        continue;
      }

      const hour = `${match[1]}:00`; // e.g. "13:00"

      if (!grouped[hour]) {
        grouped[hour] = {
          rce_pln: Number((item.rce_pln / 1000).toFixed(3)), // Convert MWh → kWh
          udtczas_oreb: item.udtczas_oreb
        };
      }
    }

    const prices = Object.entries(grouped).map(([hour, data]) => ({
      hour,
      rce_pln: data.rce_pln,
      udtczas_oreb: data.udtczas_oreb
    }));

    const businessDate = rawData[0]?.business_date;
    const publication_ts_utc = rawData[0]?.source_datetime;

    const updated = await EnergyPrice.findOneAndUpdate(
      { business_date: businessDate },
      {
        business_date: businessDate,
        publication_ts_utc,
        prices
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Energy prices saved/updated for:', updated.business_date);
  } catch (err) {
    console.error('❌ Error fetching prices:', err.message);
  }
}

module.exports = fetchAndStorePrices;
