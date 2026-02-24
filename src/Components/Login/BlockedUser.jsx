import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as auth from "../../api/auth";
import "./blocked.css";

function BlockedUser() {
  const navigate = useNavigate();

  // Clear any session on component mount
  useEffect(() => {
    auth.logout?.();
  }, []);

  const handleReturn = () => {
    navigate("/login");
  };

  return (
    <div className="blocked-container">
      <motion.div
        className="blocked-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="blocked-icon"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          🚫
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="blocked-title"
        >
          Account Blocked
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="blocked-message"
        >
          Your account has been blocked by an administrator.
        </motion.p>

        <motion.div
          className="blocked-info"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            <strong>Reason:</strong> You do not have permission to access this platform.
          </p>
          <p>
            If you believe this is an error, please contact the administrator at{" "}
            <span className="contact-link">support@jigyasa.com</span>
          </p>
        </motion.div>

        <motion.div
          className="blocked-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button onClick={handleReturn} className="btn-return">
            Return to Login
          </button>
        </motion.div>

        <motion.div
          className="blocked-notice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>
            🔒 For security reasons, you have been logged out automatically. Please contact
            your administrator to reinstate your account.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default BlockedUser;
