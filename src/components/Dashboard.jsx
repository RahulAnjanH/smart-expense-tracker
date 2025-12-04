import React, { useState } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import ExpenseList from './ExpenseList.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import { motion } from 'framer-motion';

function Dashboard({ expenses, categories, insights = {}, onUpdateExpense, onDeleteExpense }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleUpdateExpense = (updatedExpense) => {
    onUpdateExpense(selectedExpense._id, {
      description: updatedExpense.description,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      categoryId: updatedExpense.categoryId,
    });
    setShowEditModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="h3 mb-4 text-primary">Dashboard</h1>
      <motion.div
        className="card fade-in mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="h4 mb-4 text-primary">AI Insights</h2>
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
      <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={onDeleteExpense} />
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExpense && (
            <ExpenseForm
              onAddExpense={handleUpdateExpense}
              categories={categories}
              initialData={selectedExpense}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default Dashboard;