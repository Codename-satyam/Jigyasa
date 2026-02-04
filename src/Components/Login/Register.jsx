import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../../api/auth";
import "./auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.register({ name, email, password });
      // After registration, go to homepage instead of immediately launching the quiz
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-root">
      <motion.form
        className="auth-box"
        onSubmit={submit}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create account
        </motion.h2>
        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {error}
          </motion.div>
        )}
        <motion.label
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Name
        </motion.label>
        <motion.input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.label
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Email
        </motion.label>
        <motion.input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.label
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Password
        </motion.label>
        <motion.input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          type="submit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Register
        </motion.button>
      </motion.form>
    </div>
  );
}

export default Register;
