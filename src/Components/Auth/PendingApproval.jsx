import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../../api/auth";
import "./auth.css";

function PendingApproval() {
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.getCurrentUser();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await auth.checkTeacherRequestStatus();
        setRequestStatus(status);
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Check status every 10 seconds for updates
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="auth-root">
        <motion.div
          className="auth-box"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="loading-screen text-center">Loading...</div>
        </motion.div>
      </div>
    );
  }

  if (requestStatus === "approved") {
    return (
      <div className="auth-root">
        <motion.div
          className="auth-box"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{ color: "#4caf50", textAlign: "center", marginBottom: "20px" }}>
              ✅ Teacher Status Approved!
            </h2>
            <p style={{ textAlign: "center", marginBottom: "30px", fontSize: "14px" }}>
              Congratulations {user?.name}! Your teacher account has been approved by the admin.
              You can now create and manage quizzes for your students.
            </p>
            <motion.button
              className="auth-button"
              onClick={handleGoToDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ width: "100%", marginTop: "20px" }}
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (requestStatus === "rejected") {
    return (
      <div className="auth-root">
        <motion.div
          className="auth-box"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{ color: "#f44336", textAlign: "center", marginBottom: "20px" }}>
              ❌ Request Rejected
            </h2>
            <p style={{ textAlign: "center", marginBottom: "30px", fontSize: "14px" }}>
              Your teacher account request has been rejected by the admin. 
              You can still use the platform as a student.
            </p>
            <motion.button
              className="auth-button"
              onClick={handleGoToDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ width: "100%", marginTop: "20px" }}
            >
              Go to Dashboard as Student
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <motion.div
        className="auth-box"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="pulse-animation"
          style={{ textAlign: "center", marginBottom: "30px" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <h1 style={{ fontSize: "60px", marginBottom: "20px" }}>📋</h1>
          <h2 style={{ color: "#ffd700", marginBottom: "20px" }}>Request Sent!</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px", lineHeight: "1.6" }}>
            <strong>Hello {user?.name}!</strong>
          </p>
          <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px", lineHeight: "1.6" }}>
            Your teacher account request has been sent to the administrators. 
            They will review your request and approve or reject it within 24-48 hours.
          </p>

          <motion.div
            style={{
              background: "rgba(255, 215, 0, 0.1)",
              border: "2px solid #ffd700",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "12px",
              color: "#ffe0b2",
              textAlign: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            💡 <strong>Tip:</strong> You can still use the platform as a student while waiting for approval.
          </motion.div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <motion.button
              className="auth-button"
              onClick={handleGoToDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ flex: 1 }}
            >
              Go to Dashboard
            </motion.button>
            <motion.button
              className="auth-button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                flex: 1, 
                background: "rgba(255, 255, 255, 0.1)", 
                border: "2px solid rgba(255, 255, 255, 0.3)" 
              }}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PendingApproval;
