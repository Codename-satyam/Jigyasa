import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as auth from "../../api/auth";
import { apiCall } from "../../api/client";
import "./admin-login.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate credentials against backend
      const response = await apiCall('/api/users/admin/validate', 'POST', {
        email,
        password,
        adminCode
      });

      if (!response.success) {
        setError(response.error || 'Invalid admin credentials');
        return;
      }

      // Store the token and user info from the backend response
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.user) {
          localStorage.setItem('qq_currentUser', JSON.stringify(response.user));
        }
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setError('No token received from server');
      }
    } catch (err) {
      setError(err.message || 'Admin login failed');
    }
  };

  return (
    <div className="admin-login-root">
      <motion.div
        className="admin-login-container"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="admin-login-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Admin Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Secure Admin Access Only
          </motion.p>
        </div>

        {success && (
          <motion.div
            className="admin-login-success"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ✓ Admin credentials verified. Redirecting...
          </motion.div>
        )}

        {error && (
          <motion.div
            className="admin-login-error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {error}
          </motion.div>
        )}

        <motion.form
          className="admin-login-form"
          onSubmit={handleAdminLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="form-group">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Admin Code
            </motion.label>
            <motion.input
              type="password"
              placeholder="Enter admin code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              whileFocus={{ scale: 1.02 }}
              className="admin-code-input"
            />
            <small className="form-hint">Required for security verification</small>
          </div>

          <div className="form-group">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              Admin Email
            </motion.label>
            <motion.input
              type="email"
              placeholder="admin@quizy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="form-group">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              Admin Password
            </motion.label>
            <motion.input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <motion.button
            type="submit"
            className="admin-login-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={success}
          >
            {success ? "Logging in..." : "Access Admin Panel"}
          </motion.button>
        </motion.form>

        <motion.div
          className="admin-login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Not an admin? <Link to="/login">Back to Login</Link></p>
          <p className="security-notice">🔒 This area is restricted to authorized administrators only</p>
        </motion.div>

        <motion.div
          className="admin-login-credentials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
