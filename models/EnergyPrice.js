const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  hour: String,        // "14:00"
  rce_pln: Number
});

const EnergyPriceSchema = new mongoose.Schema({
  business_date: String,         // "2024-06-14"
  publication_ts_utc: String,    // from source
  prices: [PriceSchema]
});

module.exports = mongoose.model('EnergyPrice', EnergyPriceSchema);
