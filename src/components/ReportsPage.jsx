import React from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2'; // Correct import for chart components
import { ListGroup } from 'react-bootstrap'; // Import ListGroup from react-bootstrap
import { Chart as ChartJS, ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

function ReportsPage({ expenses, categories, insights = {} }) {
  // Pie Chart: Expenses by Category
  const categoryTotals = categories.reduce((acc, cat) => {
    const total = expenses
      .filter(exp => exp.categoryId === cat._id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    acc[cat.name] = total;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category ($)',
        data: Object.values(categoryTotals),
        backgroundColor: ['#4F46E5', '#10B981', '#7C3AED', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
      tooltip: { callbacks: { label: (context) => `${context.label}: $${context.parsed.toFixed(2)}` } },
    },
  };

  // Line Chart: Spending Over Time
  const dates = [...new Set(expenses.map(exp => new Date(exp.date).toISOString().split('T')[0]))].sort();
  const lineData = {
    labels: dates,
    datasets: [
      {
        label: 'Daily Spending ($)',
        data: dates.map(date =>
          expenses
            .filter(exp => new Date(exp.date).toISOString().split('T')[0] === date)
            .reduce((sum, exp) => sum + exp.amount, 0)
        ),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
      tooltip: { callbacks: { label: (context) => `$${context.parsed.y.toFixed(2)}` } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } },
      x: { title: { display: true, text: 'Date' } },
    },
  };

  // Bar Chart: Expenses by Category
  const barData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category ($)',
        data: Object.values(categoryTotals),
        backgroundColor: ['#4F46E5', '#10B981', '#7C3AED', '#EF4444'],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', size: 14 } } },
      tooltip: { callbacks: { label: (context) => `$${context.parsed.y.toFixed(2)}` } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } },
      x: { title: { display: true, text: 'Category' } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="h3 mb-4 text-primary">Reports</h1>
      <motion.div
        className="card fade-in mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="h4 mb-4 text-primary">AI Insights</h2>
        <p className="text-muted">Source: {insights.source === 'ai' ? 'AI (Perplexity Sonar)' : 'Local Analysis'}</p>
        <h5>Summary</h5>
        <p className="text-muted">{insights.summary || 'Loading insights...'}</p>
        <h5>Suggestions</h5>
        <ListGroup variant="flush">
          {insights.suggestions && insights.suggestions.length > 0 ? (
            insights.suggestions.map((suggestion, index) => (
              <ListGroup.Item key={index}>{suggestion}</ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Loading suggestions...</ListGroup.Item>
          )}
        </ListGroup>
        <h5>Trend</h5>
        <p className="text-muted">{insights.trend || 'Loading trend...'}</p>
        <h5>Category Breakdown</h5>
        <ListGroup variant="flush">
          {insights.categoryBreakdown && insights.categoryBreakdown.length > 0 ? (
            insights.categoryBreakdown.map((cat, index) => (
              <ListGroup.Item key={index}>
                {cat.category}: ${cat.amount} ({cat.percentage}%)
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Loading category breakdown...</ListGroup.Item>
          )}
        </ListGroup>
      </motion.div>
      <div className="card">
        <h2 className="h5 mb-4 text-center">Expenses by Category (Pie)</h2>
        <div className="chart-container">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
      <div className="card">
        <h2 className="h5 mb-4 text-center">Spending Over Time (Line)</h2>
        <div className="chart-container">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
      <div className="card">
        <h2 className="h5 mb-4 text-center">Expenses by Category (Bar)</h2>
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </motion.div>
  );
}

export default ReportsPage;
