const express = require('express');
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');
const { fetch: undiciFetch } = require('undici');
const fetch = typeof global.fetch === 'function' ? global.fetch : undiciFetch;
const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get expenses for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .populate('categoryId', 'name')
      .sort({ date: -1 });
    res.json(expenses.map(exp => ({
      _id: exp._id,
      userId: exp.userId,
      description: exp.description,
      amount: exp.amount,
      date: exp.date.toISOString().split('T')[0],
      categoryId: exp.categoryId._id,
      categoryName: exp.categoryId.name,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add expense
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, date, categoryId } = req.body;
  try {
    const expense = new Expense({
      userId: req.user.id,
      description,
      amount,
      date,
      categoryId,
    });
    await expense.save();
    const populatedExpense = await Expense.findById(expense._id).populate('categoryId', 'name');
    res.status(201).json({
      _id: populatedExpense._id,
      userId: populatedExpense.userId,
      description: populatedExpense.description,
      amount: populatedExpense.amount,
      date: populatedExpense.date.toISOString().split('T')[0],
      categoryId: populatedExpense.categoryId._id,
      categoryName: populatedExpense.categoryId.name,
      createdAt: populatedExpense.createdAt,
      updatedAt: populatedExpense.updatedAt,
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid input' });
  }
});

// Update expense
router.put('/:id', authMiddleware, async (req, res) => {
  const { description, amount, date, categoryId } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    expense.description = description || expense.description;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.date = date || expense.date;
    expense.categoryId = categoryId || expense.categoryId;
    expense.updatedAt = Date.now();
    await expense.save();
    const populatedExpense = await Expense.findById(expense._id).populate('categoryId', 'name');
    res.json({
      _id: populatedExpense._id,
      userId: populatedExpense.userId,
      description: populatedExpense.description,
      amount: populatedExpense.amount,
      date: populatedExpense.date.toISOString().split('T')[0],
      categoryId: populatedExpense.categoryId._id,
      categoryName: populatedExpense.categoryId.name,
      createdAt: populatedExpense.createdAt,
      updatedAt: populatedExpense.updatedAt,
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid input' });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI-driven insights
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .populate('categoryId', 'name')
      .sort({ date: -1 });

    if (expenses.length === 0) {
      return res.json({
        summary: 'No expenses recorded yet.',
        suggestions: ['Start adding expenses to get personalized insights.'],
        trend: 'Not enough data for trend analysis.',
        categoryBreakdown: [],
        source: 'local',
      });
    }

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = expenses.reduce((acc, exp) => {
      const catName = exp.categoryId.name;
      acc[catName] = (acc[catName] || 0) + exp.amount;
      return acc;
    }, {});

    const fallback = () => {
      const averageExpense = totalSpent / expenses.length;
      const highestCategory = Object.entries(categoryTotals).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
      const dates = [...new Set(expenses.map(exp => new Date(exp.date).toISOString().split('T')[0]))].sort();
      const dailyTotals = dates.map(date =>
        expenses
          .filter(exp => new Date(exp.date).toISOString().split('T')[0] === date)
          .reduce((sum, exp) => sum + exp.amount, 0)
      );
      const trend = dailyTotals.length > 1
        ? dailyTotals[dailyTotals.length - 1] > dailyTotals[dailyTotals.length - 2]
          ? 'Spending is increasing recently.'
          : 'Spending is stable or decreasing.'
        : 'Not enough data for trend analysis.';
      const suggestions = [];
      const highSpendThreshold = totalSpent * 0.3;
      for (const [cat, amount] of Object.entries(categoryTotals)) {
        if (amount > highSpendThreshold) {
          suggestions.push(`You're spending a lot on ${cat} ($${amount.toFixed(2)}). Consider setting a budget for this category.`);
        }
      }
      if (suggestions.length === 0) {
        suggestions.push('Your spending looks balanced. Keep tracking to maintain control!');
      }
      return {
        summary: [
          `Total Spent: $${totalSpent.toFixed(2)}`,
          `Average Expense: $${averageExpense.toFixed(2)}`,
          `Highest Category: ${highestCategory[0]} ($${highestCategory[1].toFixed(2)})`,
          `Number of Expenses: ${expenses.length}`,
        ].join(' | '),
        suggestions,
        trend,
        categoryBreakdown: Object.entries(categoryTotals).map(([name, amount]) => ({
          category: name,
          amount: amount.toFixed(2),
          percentage: ((amount / totalSpent) * 100).toFixed(2),
        })),
        source: 'local',
      };
    };

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.json(fallback());
    }

    const payload = {
      model: 'sonar-small-online',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a concise financial assistant. Respond with ONLY one valid JSON object that matches the schema {summary:string,suggestions:string[],trend:string,categoryBreakdown:{category:string,amount:string,percentage:string}[]}. No prose. No code fences.'
        },
        {
          role: 'user',
          content: `Given this expense data, produce JSON with keys summary, suggestions (array), trend, categoryBreakdown (array of {category, amount, percentage}). Numbers should be formatted to 2 decimals. Data: ${JSON.stringify({ totalSpent, categoryTotals, count: expenses.length })}`
        }
      ]
    };

    if (typeof fetch !== 'function') {
      return res.json(fallback());
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.json(fallback());
    }
    const data = await response.json();
    let content = data?.choices?.[0]?.message?.content ?? '';
    if (Array.isArray(content)) {
      content = content.map(part => typeof part === 'string' ? part : (part?.text ?? '')).join('\n');
    }
    try {
      const fence = String(content).replace(/```json|```/g, '');
      const match = fence.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : fence;
      const parsed = JSON.parse(jsonStr);
      parsed.source = 'ai';
      return res.json(parsed);
    } catch (e) {
      return res.json(fallback());
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
