import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      const role = result.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STAFF') navigate('/staff');
      else navigate('/user');
    } else {
      setFormError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const autofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="auth-card-container">
      <div className="card auth-card">
        <div className="auth-header text-center">
          <div className="auth-icon-badge">⚡</div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to manage and track queue tokens</p>
        </div>

        {/* Demo Fast-Login Helper Pills */}
        <div className="demo-fill-box my-3">
          <span className="demo-label">Quick Demo Autofill:</span>
          <div className="demo-chips">
            <button
              type="button"
              className="chip chip-admin"
              onClick={() => autofill('admin@queue.com', 'admin123')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="chip chip-staff"
              onClick={() => autofill('staff.john@queue.com', 'staff123')}
            >
              💼 Staff
            </button>
            <button
              type="button"
              className="chip chip-user"
              onClick={() => autofill('alice@student.com', 'user123')}
            >
              🎓 Student
            </button>
          </div>
        </div>

        {formError && (
          <div className="alert alert-danger">
            <span>⚠️</span> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. alice@student.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-3"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer mt-4 text-center">
          <p className="text-sm">
            Don't have an account yet? <Link to="/register" className="auth-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
