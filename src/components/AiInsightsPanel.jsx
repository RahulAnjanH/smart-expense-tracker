// src/components/AiInsightsPanel.jsx
import { useState } from "react";
import { aiGenerateInsights } from "../api/ai";

/**
 * Props:
 *   expenses: whatever you're currently passing
 *   token: JWT token (same as old AIAnalysisPage)
 */
export default function AiInsightsPanel({ expenses, token }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState("");
  const [error, setError] = useState("");

  // Normalize whatever you pass into a clean array
  const getExpenseArray = () => {
    if (Array.isArray(expenses)) return expenses;
    if (Array.isArray(expenses?.expenses)) return expenses.expenses;
    if (Array.isArray(expenses?.data)) return expenses.data;
    if (Array.isArray(expenses?.transactions)) return expenses.transactions;
    return [];
  };

  const handleGenerate = async () => {
    const expenseArray = getExpenseArray();

    if (!expenseArray || expenseArray.length === 0) {
      setError("Add some expenses first to generate AI insights.");
      return;
    }

    if (!token) {
      setError("You must be logged in to use AI insights.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await aiGenerateInsights(expenseArray, token);
      setInsights(result);
    } catch (err) {
      console.error(err);
      // Show a more specific message for 401
      if (err.message.toLowerCase().includes("unauthorized")) {
        setError("Session expired or unauthorized. Please log in again.");
      } else {
        setError(err.message || "Failed to generate AI insights.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-insights-card" style={styles.card}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>AI Spending Insights</h2>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Analyzing..." : "Generate Insights"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!insights && !error && (
        <p style={styles.subtitle}>
          Click <b>Generate Insights</b> to get an AI summary of your spending.
        </p>
      )}

      {insights && (
        <div style={styles.insightsBox}>
          {insights.split("\n").map((line, idx) => (
            <p key={idx} style={styles.line}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #111827",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    marginTop: "1.5rem",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
  },
  subtitle: {
    marginTop: "0.25rem",
    color: "#9ca3af",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
  },
  error: {
    color: "#fca5a5",
  },
  insightsBox: {
    marginTop: "0.75rem",
    paddingRight: "0.5rem",
    maxHeight: "320px",
    overflowY: "auto",
    fontSize: "0.95rem",
    whiteSpace: "pre-wrap",
  },
  line: {
    margin: "0.25rem 0",
  },
};
