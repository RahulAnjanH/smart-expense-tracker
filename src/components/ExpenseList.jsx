import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

function ExpenseList({ expenses, onEdit, onDelete }) {
  return (
    <motion.div
      className="card fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="h4 mb-4 text-primary">Recent Expenses</h2>
      {expenses.length === 0 ? (
        <p className="text-muted">No expenses added yet.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <motion.tr
                key={expense._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td>{expense.date}</td>
                <td>{expense.description}</td>
                <td>{expense.categoryName}</td>
                <td>{expense.amount.toFixed(2)}</td>
                <td>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(expense)}
                    >
                      Edit
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this expense?')) {
                          onDelete(expense._id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
      )}
    </motion.div>
  );
}

export default ExpenseList;