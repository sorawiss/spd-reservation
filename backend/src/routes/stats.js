const express = require('express');
const GoogleSheetsService = require('../services/googleSheets');

const router = express.Router();

// GET /api/stats - Get usage statistics
router.get('/', async (req, res) => {
  try {
    const stats = await GoogleSheetsService.getUsageStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 