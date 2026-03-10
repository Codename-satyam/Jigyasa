import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth, { AVATAR_OPTIONS } from "../../api/auth";
import "./auth.css";

const PASSWORD_RULES = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isStrongPassword(value) {
  return (
    value.length >= PASSWORD_RULES.minLength &&
    PASSWORD_RULES.upper.test(value) &&
    PASSWORD_RULES.lower.test(value) &&
    PASSWORD_RULES.number.test(value) &&
    PASSWORD_RULES.special.test(value)
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("weak");
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [role, setRole] = useState("student"); // 'student' or 'teacher'
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  const navigate = useNavigate();



  function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) {
      score++;
    }
    if (/[A-Z]/.test(password)) {
      score++;
    }
    if (/[0-9]/.test(password)) {
      score++;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }
    if (score === 4) {
      return "strong";
    } else if (score >= 2) {
      return "medium";
    } else {
      return "weak";
    }
  }

  function getValidationWarnings() {
    const warnings = [];

    if (!name.trim()) warnings.push("Name is required");
    if (!email.trim()) warnings.push("Email is required");
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) warnings.push("Enter a valid email address");
    if (!password) warnings.push("Password is required");
    if (password && !isStrongPassword(password)) {
      warnings.push("Password must include uppercase, lowercase, number, special character and 8+ length");
    }

    return warnings;
  }

  const submit = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError(null);
    setWarning(null);

    const warnings = getValidationWarnings();
    if (warnings.length > 0) {
      setWarning(`Please fix: ${warnings.join(" | ")}`);
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    console.log('🔵 [Register] Starting registration process');
    console.log('📝 [Register] Form data:', { name, email, role, avatarId: selectedAvatar });

    try {
      console.log('📤 [Register] Calling auth.register...');
      const result = await auth.register({ name, email, password, avatarId: selectedAvatar, role });
      console.log('✅ [Register] Registration successful!', result);
      console.log('📍 [Register] Redirecting to dashboard...');
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ [Register] Registration failed:', err);
      console.error('❌ [Register] Error message:', err.message);
      console.error('❌ [Register] Error stack:', err.stack);
      const msg = err.message || 'Registration failed';
      setError(msg);
      if (/email|password|invalid|exists/i.test(msg)) {
        setWarning(`Please review your details: ${msg}`);
      }
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

        {warning && (
          <motion.div
            className="auth-error"
            style={{
              background: 'rgba(255, 165, 0, 0.12)',
              borderColor: '#ffb74d',
              color: '#ffe0b2',
              marginTop: '8px'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Warning: {warning}
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
            onChange={(e) => {
              setName(e.target.value);
              if (attemptedSubmit) {
                const warnings = getValidationWarnings();
                setWarning(warnings.length ? `Please fix: ${warnings.join(" | ")}` : null);
              }
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            required
            whileFocus={{ scale: 1.02 }}
          />
          {(touched.name || attemptedSubmit) && !name.trim() && (
            <small style={{ color: '#ffb74d' }}>Name cannot be empty</small>
          )}
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (attemptedSubmit) {
                const warnings = getValidationWarnings();
                setWarning(warnings.length ? `Please fix: ${warnings.join(" | ")}` : null);
              }
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            required
            whileFocus={{ scale: 1.02 }}
          />
          {(touched.email || attemptedSubmit) && email.trim() && !EMAIL_REGEX.test(email.trim()) && (
            <small style={{ color: '#ffb74d' }}>Enter a valid email format</small>
          )}
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
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkPasswordStrength(e.target.value));
              if (attemptedSubmit) {
                const warnings = getValidationWarnings();
                setWarning(warnings.length ? `Please fix: ${warnings.join(" | ")}` : null);
              }
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            required
            whileFocus={{ scale: 1.02 }}
          />
          {(touched.password || attemptedSubmit) && password && !isStrongPassword(password) && (
            <small style={{ color: '#ffb74d' }}>
              Use 8+ chars with uppercase, lowercase, number, and special character
            </small>
          )}
        </motion.div>
        {passwordStrength && (
          <motion.div
            className={`password-strength ${passwordStrength}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 }}
          >
            Password Strength: {passwordStrength}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.44 }}
          className="password-requirements"
          style={{ fontSize: '0.82rem', color: '#cfd8dc', marginTop: '8px', marginBottom: '12px' }}
        >
          <div>{password.length >= 8 ? '✓' : '•'} At least 8 characters</div>
          <div>{/[A-Z]/.test(password) ? '✓' : '•'} One uppercase letter</div>
          <div>{/[a-z]/.test(password) ? '✓' : '•'} One lowercase letter</div>
          <div>{/[0-9]/.test(password) ? '✓' : '•'} One number</div>
          <div>{/[^A-Za-z0-9]/.test(password) ? '✓' : '•'} One special character</div>
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
          disabled={!isStrongPassword(password)}
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
