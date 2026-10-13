import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-box">⚡</div>
          <div className="brand-text-group">
            <span className="brand-title">QueueMaster</span>
            <span className="brand-subtitle">Smart Campus System</span>
          </div>
        </Link>

        {user && (
          <nav className="navbar-links">
            {user.role === 'USER' && (
              <Link
                to="/user"
                className={`nav-link ${location.pathname === '/user' ? 'nav-link-active' : ''}`}
              >
                🎟️ My Tokens
              </Link>
            )}
            {user.role === 'STAFF' && (
              <Link
                to="/staff"
                className={`nav-link ${location.pathname === '/staff' ? 'nav-link-active' : ''}`}
              >
                📢 Counter Control
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}
              >
                ⚙️ Admin Center
              </Link>
            )}
          </nav>
        )}

        <div className="navbar-actions">
          {user ? (
            <div className="user-badge-container">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-info-text">
                <span className="user-name">{user.name}</span>
                <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
