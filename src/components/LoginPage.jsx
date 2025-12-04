import React, { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = isLogin ? 'http://localhost:5000/api/users/login' : 'http://localhost:5000/api/users/register';
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <motion.div
      className="card fade-in mx-auto"
      style={{ maxWidth: '400px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="h4 mb-4 text-primary text-center">{isLogin ? 'Login' : 'Register'}</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="danger">{error}</Alert>
        </motion.div>
      )}
      <Form onSubmit={handleSubmit}>
        {!isLogin && (
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
        )}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="primary" type="submit" className="w-100 mb-2">
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </motion.div>
        <Button
          variant="link"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setUsername('');
            setEmail('');
            setPassword('');
          }}
          className="w-100 text-primary"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </Button>
      </Form>
    </motion.div>
  );
}

export default LoginPage;