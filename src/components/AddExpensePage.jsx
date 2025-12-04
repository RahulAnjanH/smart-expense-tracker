import React from 'react';
import ExpenseForm from './ExpenseForm.jsx';
import { motion } from 'framer-motion';

function AddExpensePage({ onAddExpense, categories }) {
  const handleAddExpense = (expense) => {
    const category = categories.find(cat => cat._id === expense.categoryId);
    onAddExpense({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      categoryId: expense.categoryId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="h3 mb-4 text-primary">Add Expense</h1>
      <ExpenseForm onAddExpense={handleAddExpense} categories={categories} />
    </motion.div>
  );
}

export default AddExpensePage;