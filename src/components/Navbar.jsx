import React from 'react';
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <BSNavbar.Brand as={NavLink} to="/">Smart Expense Tracker</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link
                    as={NavLink}
                    to="/dashboard"
                    className={({ isActive }) => `mx-2 ${isActive ? 'active' : ''}`}
                  >
                    Dashboard
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link
                    as={NavLink}
                    to="/add-expense"
                    className={({ isActive }) => `mx-2 ${isActive ? 'active' : ''}`}
                  >
                    Add Expense
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link
                    as={NavLink}
                    to="/reports"
                    className={({ isActive }) => `mx-2 ${isActive ? 'active' : ''}`}
                  >
                    Reports
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link
                    as={NavLink}
                    to="/ai-analysis"
                    className={({ isActive }) => `mx-2 ${isActive ? 'active' : ''}`}
                  >
                    AI Analysis
                  </Nav.Link>
                </motion.div>
                <NavDropdown title={`Hello, ${user?.username}`} id="user-dropdown" className="mx-2">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Nav.Link as={NavLink} to="/login" activeClassName="active" className="mx-2">
                  Login
                </Nav.Link>
              </motion.div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
