// backend/services/aiService.js
require('dotenv').config();

const axios = require('axios');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'sonar-reasoning-pro';
const PERPLEXITY_BASE_URL =
  process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai';

if (!PERPLEXITY_API_KEY) {
  console.warn(
    '[AI SERVICE] PERPLEXITY_API_KEY is not set. AI routes will fail until you configure it.'
  );
}

/**
 * Low-level helper for calling Perplexity chat completions.
 */
async function callPerplexityChat(prompt, options = {}) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured');
  }

  const body = {
    model: PERPLEXITY_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: options.max_tokens || 256,
    temperature: options.temperature ?? 0.2,
  };

  const response = await axios.post(
    `${PERPLEXITY_BASE_URL}/chat/completions`,
    body,
    {
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000, // 20s
    }
  );

  const content =
    response?.data?.choices?.[0]?.message?.content?.trim() || '';
  return content;
}

/**
 * Categorize a single expense description using AI.
 * Returns a category from a fixed list, e.g. "Food".
 */
async function categorizeExpense(description) {
  const prompt = `
You are an expense categorization engine for a personal finance app.

Given an expense description, choose exactly ONE category from this list:

[Food, Travel, Shopping, Groceries, Bills, Entertainment, Health, Education, Rent, Salary, Other]

Rules:
- Return ONLY the category word. No explanations.
- If you are unsure, return "Other".

Description: "${description}"
Category:
  `.trim();

  const raw = await callPerplexityChat(prompt, {
    max_tokens: 10,
    temperature: 0,
  });

  // Normalize to a clean single word
  const firstLine = raw.split('\n')[0];
  const cleaned = firstLine.replace(/[^A-Za-z]/g, '').trim();

  const allowed = [
    'Food',
    'Travel',
    'Shopping',
    'Groceries',
    'Bills',
    'Entertainment',
    'Health',
    'Education',
    'Rent',
    'Salary',
    'Other',
  ];

  const normalized =
    allowed.find(
      (cat) => cat.toLowerCase() === cleaned.toLowerCase()
    ) || 'Other';

  return normalized;
}

/**
 * Generate insights from a list of expenses for the Insights page.
 *
 * @param {Array<{ amount: number, category: string, date?: string, description?: string }>} expenses
 */
async function generateSpendingInsights(expenses = []) {
  const trimmedExpenses = expenses.slice(0, 200); // safety
  const jsonSnippet = JSON.stringify(trimmedExpenses);

  const prompt = `
You are an AI financial assistant helping a user understand their spending.

The user's expenses (JSON array) are:

${jsonSnippet}

Tasks:
1. Briefly summarize where the user spends the most (top 2–3 categories).
2. Mention any obvious bad habits (overspending, too much in one category, etc.).
3. Give 3–5 simple, actionable tips to improve their budgeting.

Keep the tone simple and friendly.
Output in short paragraphs and bullet points.
  `.trim();

  const insights = await callPerplexityChat(prompt, {
    max_tokens: 400,
    temperature: 0.7,
  });

  return insights;
}

module.exports = {
  categorizeExpense,
  generateSpendingInsights,
};
