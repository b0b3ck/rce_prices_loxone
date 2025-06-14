const express = require('express');
const router = express.Router();

// Import route modules
const energyRoutes = require('./energy');
const allPricesRoutes = require('./allPrices');

// Mount routes under specific paths
router.use('/energy', energyRoutes);       // e.g., /api/energy
router.use('/all-prices', allPricesRoutes); // e.g., /api/all-prices

module.exports = router;
