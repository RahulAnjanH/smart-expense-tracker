// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

const {
  categorizeExpense,
  generateSpendingInsights,
} = require('../services/aiService');

// POST /api/ai/categorize
// Body: { description: "Swiggy order for dinner" }
router.post('/categorize', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res
        .status(400)
        .json({ error: 'description (string) is required' });
    }

    const category = await categorizeExpense(description);
    return res.json({ category });
  } catch (err) {
    console.error('[AI] /categorize error:', err.message);
    return res
      .status(500)
      .json({ error: 'Failed to categorize expense using AI' });
  }
});

// POST /api/ai/insights
// Body: { expenses: [{ amount, category, date, description }, ...] }
router.post('/insights', async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!Array.isArray(expenses)) {
      return res
        .status(400)
        .json({ error: 'expenses must be an array' });
    }

    const insights = await generateSpendingInsights(expenses);
    return res.json({ insights });
  } catch (err) {
    console.error('[AI] /insights error:', err.message);
    return res
      .status(500)
      .json({ error: 'Failed to generate AI insights' });
  }
});

module.exports = router;
