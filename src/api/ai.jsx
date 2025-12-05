// src/api/ai.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Call backend AI endpoint to categorize one expense.
 * @param {string} description
 * @param {string} token - JWT token ("Bearer" will be added)
 * @returns {Promise<string>} category
 */
export async function aiCategorizeExpense(description, token) {
  const res = await fetch(`${API_BASE_URL}/api/ai/categorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ description }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to categorize expense");
  }

  return data.category;
}

/**
 * Call backend AI endpoint to generate insights from expenses.
 * @param {Array} expenses
 * @param {string} token - JWT token
 * @returns {Promise<string>} insights markdown/text
 */
export async function aiGenerateInsights(expenses, token) {
  const res = await fetch(`${API_BASE_URL}/api/ai/insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ expenses }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // will surface "expenses must be an array" or "Unauthorized"
    throw new Error(data.error || "Failed to generate AI insights");
  }

  return data.insights;
}
