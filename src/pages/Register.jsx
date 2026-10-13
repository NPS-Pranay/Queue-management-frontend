import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const result = await register({ name, email, password, role });
    if (result.success) {
      const userRole = result.user.role;
      if (userRole === 'ADMIN') navigate('/admin');
      else if (userRole === 'STAFF') navigate('/staff');
      else navigate('/user');
    } else {
      setFormError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-card-container">
      <div className="card auth-card">
        <div className="auth-header text-center">
          <div className="auth-icon-badge">✨</div>
          <h2>Create Account</h2>
          <p className="text-muted">Register to access campus queue token services</p>
        </div>

        {formError && (
          <div className="alert alert-danger my-3">
            <span>⚠️</span> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form mt-3">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
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
            <label>Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Role *</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">🎓 Student / General User</option>
              <option value="STAFF">💼 Counter Staff Operator</option>
              <option value="ADMIN">👑 System Administrator</option>
            </select>
            <small className="form-text text-muted">Select Student unless testing Staff/Admin functions</small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-3"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration →'}
          </button>
        </form>

        <div className="auth-footer mt-4 text-center">
          <p className="text-sm">
            Already have an account? <Link to="/login" className="auth-link">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
