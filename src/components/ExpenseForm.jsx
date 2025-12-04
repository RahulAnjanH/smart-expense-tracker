import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { motion } from 'framer-motion';

function ExpenseForm({ onAddExpense, categories, initialData }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setCategoryId(initialData.categoryId);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && amount && date && categoryId) {
      onAddExpense({
        description,
        amount: parseFloat(amount),
        date,
        categoryId,
      });
      if (!initialData) { // Reset only for adding, not editing
        setDescription('');
        setAmount('');
        setDate('');
        setCategoryId('');
      }
    }
  };

  return (
    <motion.div
      className="fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3" controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="primary" type="submit">
            {initialData ? 'Update Expense' : 'Add Expense'}
          </Button>
        </motion.div>
      </Form>
    </motion.div>
  );
}

export default ExpenseForm;