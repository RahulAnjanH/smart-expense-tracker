import React, { useEffect, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

function AIAnalysisPage({ token }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/expenses/insights', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load insights');
      setInsights(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInsights();
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="h3 mb-4 text-primary">AI Analysis</h1>
      <motion.div className="card fade-in mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">Source: {insights?.source === 'ai' ? 'AI (Perplexity Sonar)' : 'Local Analysis'}</div>
          <Button variant="primary" onClick={fetchInsights} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
        </div>
        {error && <div className="text-danger mb-3">{error}</div>}
        <h5>Summary</h5>
        <p className="text-muted">{insights?.summary || 'Loading insights...'}</p>
        <h5>Suggestions</h5>
        <ListGroup variant="flush">
          {insights?.suggestions && insights.suggestions.length > 0 ? (
            insights.suggestions.map((s, i) => <ListGroup.Item key={i}>{s}</ListGroup.Item>)
          ) : (
            <ListGroup.Item>Loading suggestions...</ListGroup.Item>
          )}
        </ListGroup>
        <h5>Trend</h5>
        <p className="text-muted">{insights?.trend || 'Loading trend...'}</p>
        <h5>Category Breakdown</h5>
        <ListGroup variant="flush">
          {insights?.categoryBreakdown && insights.categoryBreakdown.length > 0 ? (
            insights.categoryBreakdown.map((cat, i) => (
              <ListGroup.Item key={i}>{cat.category}: ${cat.amount} ({cat.percentage}%)</ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Loading category breakdown...</ListGroup.Item>
          )}
        </ListGroup>
      </motion.div>
    </motion.div>
  );
}

export default AIAnalysisPage;
