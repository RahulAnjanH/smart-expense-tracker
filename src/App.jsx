import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddExpensePage from './components/AddExpensePage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import AIAnalysisPage from './components/AIAnalysisPage.jsx';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights] = useState({ summary: '', suggestions: [], trend: '', categoryBreakdown: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  // Fetch categories
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });
  }, []);

  // Fetch expenses and insights
  useEffect(() => {
    if (isAuthenticated && token) {
      // Fetch expenses
      fetch('http://localhost:5000/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch expenses');
          return res.json();
        })
        .then(data => setExpenses(data))
        .catch(err => {
          console.error('Error fetching expenses:', err);
          setExpenses([]);
        });

      // Fetch insights
      fetch('http://localhost:5000/api/expenses/insights', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch insights');
          return res.json();
        })
        .then(data => setInsights(data))
        .catch(err => {
          console.error('Error fetching insights:', err);
          setInsights({ summary: 'Failed to load insights.', suggestions: [], trend: '', categoryBreakdown: [] });
        });
    }
  }, [isAuthenticated, token]);

  const handleLogin = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken('');
    setExpenses([]);
    setInsights({ summary: '', suggestions: [], trend: '', categoryBreakdown: [] });
  };

  const addExpense = async (newExpense) => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });
      const expense = await response.json();
      if (response.ok) {
        setExpenses([...expenses, expense]);
        // Refresh insights
        fetch('http://localhost:5000/api/expenses/insights', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setInsights(data));
      } else {
        console.error('Error adding expense:', expense.message);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExpense),
      });
      const expense = await response.json();
      if (response.ok) {
        setExpenses(expenses.map(exp => (exp._id === id ? expense : exp)));
        // Refresh insights
        fetch('http://localhost:5000/api/expenses/insights', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setInsights(data));
      } else {
        console.error('Error updating expense:', expense.message);
      }
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setExpenses(expenses.filter(exp => exp._id !== id));
        // Refresh insights
        fetch('http://localhost:5000/api/expenses/insights', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setInsights(data));
      } else {
        const data = await response.json();
        console.error('Error deleting expense:', data.message);
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <div className="app-container">
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      <motion.main
        className="container mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard
                  expenses={expenses}
                  categories={categories}
                  insights={insights}
                  onUpdateExpense={updateExpense}
                  onDeleteExpense={deleteExpense}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  expenses={expenses}
                  categories={categories}
                  insights={insights}
                  onUpdateExpense={updateExpense}
                  onDeleteExpense={deleteExpense}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <AddExpensePage onAddExpense={addExpense} categories={categories} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage expenses={expenses} categories={categories} insights={insights} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-analysis"
            element={
              <ProtectedRoute>
                <AIAnalysisPage token={token} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </motion.main>
    </div>
  );
}

export default App;
