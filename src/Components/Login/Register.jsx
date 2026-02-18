import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth, { AVATAR_OPTIONS } from "../../api/auth";
import "./auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [role, setRole] = useState("student"); // 'student' or 'teacher'
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      await auth.register({ name, email, password, avatarId: selectedAvatar, role });
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };


  const selectedAvatarEmoji = AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.emoji || '🦁';

  return (
    <div className="auth-root">
      <motion.form
        className="auth-box register-box"
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
          Create Account
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

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="form-group"
        >
          <label>Name</label>
          <motion.input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="form-group"
        >
          <label>Email</label>
          <motion.input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="form-group"
        >
          <label>Password</label>
          <motion.input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            whileFocus={{ scale: 1.02 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.42 }}
          className="form-group"
        >
          <label>Account Type</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              type="button"
              className={`role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid',
                borderColor: role === 'student' ? '#00ffff' : '#666',
                background: role === 'student' ? 'rgba(0,255,255,0.1)' : 'transparent',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              👨‍🎓 Student
            </motion.button>
            <motion.button
              type="button"
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => setRole('teacher')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid',
                borderColor: role === 'teacher' ? '#00ffff' : '#666',
                background: role === 'teacher' ? 'rgba(0,255,255,0.1)' : 'transparent',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              👨‍🏫 Teacher
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="avatar-section"
        >
          <label>Choose Your Avatar</label>
          <motion.div
            className="avatar-preview"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
          >
            {selectedAvatarEmoji}
          </motion.div>
          <div className="avatar-grid">
            {AVATAR_OPTIONS.map((avatar) => (
              <motion.button
                key={avatar.id}
                type="button"
                className={`avatar-btn ${selectedAvatar === avatar.id ? 'active' : ''}`}
                onClick={() => setSelectedAvatar(avatar.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={avatar.name}
              >
                {avatar.emoji}
              </motion.button>
            ))}
          </div>

        </motion.div>

        <motion.button
          type="submit"
          className="submit-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Register
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          Already have an account? <a href="/login">Login here</a>
        </motion.p>
      </motion.form>
    </div>
  );
}

export default Register;
