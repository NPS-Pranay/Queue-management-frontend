import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getServicesApi,
  createTokenApi,
  getUserTokensApi,
  getTokenPositionApi,
  cancelTokenApi,
  getCountersApi
} from '../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'services', 'take-token', 'current-token', 'history'

  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [activeTokenPosition, setActiveTokenPosition] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Periodic position polling for active token
  useEffect(() => {
    let interval = null;
    const activeToken = tokens.find((t) => t.status === 'WAITING' || t.status === 'SERVING');

    if (activeToken) {
      fetchTokenPosition(activeToken.id);
      interval = setInterval(() => {
        fetchTokenPosition(activeToken.id);
      }, 5000); // refresh every 5 seconds
    } else {
      setActiveTokenPosition(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tokens]);

  const loadInitialData = async () => {
    if (!user) return;
    try {
      const sData = await getServicesApi();
      const cData = await getCountersApi();
      const tData = await getUserTokensApi(user.id);

      const activeServices = sData.filter((s) => s.active);
      setServices(activeServices);
      setCounters(cData);
      setTokens(tData);

      if (activeServices.length > 0 && !selectedServiceId) {
        setSelectedServiceId(activeServices[0].id);
      }
    } catch (err) {
      setError('Failed to load user dashboard data.');
    }
  };

  const fetchTokenPosition = async (tokenId) => {
    try {
      const posData = await getTokenPositionApi(tokenId);
      setActiveTokenPosition(posData);
    } catch (err) {
      // Silently ignore polling errors
    }
  };

  const handleTakeToken = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!selectedServiceId) {
      setError('Please select a service.');
      return;
    }
    setLoading(true);
    try {
      const response = await createTokenApi({ userId: user.id, serviceId: Number(selectedServiceId) });
      if (response.message && response.message.includes('already have an active token')) {
        setError(response.message);
      } else {
        setMessage(`Token T-${response.tokenNumber} generated successfully!`);
        setActiveTab('current-token');
      }
      await loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate token.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel your waiting token?')) return;
    setMessage(null);
    setError(null);
    try {
      const response = await cancelTokenApi(tokenId, user.id);
      if (response.message && response.message.includes('successfully')) {
        setMessage(response.message);
      } else {
        setError(response.message);
      }
      await loadInitialData();
    } catch (err) {
      setError('Failed to cancel token.');
    }
  };

  const activeToken = tokens.find((t) => t.status === 'WAITING' || t.status === 'SERVING');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4">
        <h2>User Dashboard & Queue Tracker</h2>
        <p className="text-muted">Welcome, {user?.name}! Request tokens, track queue position, and manage history.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Navigation Tabs */}
      <div className="tab-navigation mb-4">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🏢 Available Services ({services.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'take-token' ? 'active' : ''}`}
          onClick={() => setActiveTab('take-token')}
        >
          🎟️ Take Token
        </button>
        <button
          className={`tab-btn ${activeTab === 'current-token' ? 'active' : ''}`}
          onClick={() => setActiveTab('current-token')}
        >
          🎯 My Current Token {activeToken ? '🟢' : ''}
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Token History ({tokens.length})
        </button>
      </div>

      {/* 1. DASHBOARD OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="grid-2 gap-4">
          <div className="card">
            <h3>Active Token Summary</h3>
            {activeToken ? (
              <div className="active-token-box mt-3 p-3 text-center">
                <span className="box-label">YOUR ACTIVE TOKEN</span>
                <h1 className="token-number-display">T-{activeToken.tokenNumber}</h1>
                <p><strong>Service:</strong> {activeToken.serviceName}</p>
                <div className="mt-2 mb-3">
                  <span className={`status-badge status-${activeToken.status.toLowerCase()}`}>
                    Status: {activeToken.status}
                  </span>
                </div>
                <button onClick={() => setActiveTab('current-token')} className="btn btn-primary btn-sm">
                  View Live Queue Tracker →
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-muted">
                <p>You have no active tokens right now.</p>
                <button onClick={() => setActiveTab('take-token')} className="btn btn-primary mt-3">
                  🎟️ Take a Token Now
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3>Available Services Overview</h3>
            <p className="text-muted mb-3">Select any active service counter to take a token.</p>
            <ul className="service-list">
              {services.map((s) => (
                <li key={s.id} className="service-list-item flex-between align-center p-2 border-bottom">
                  <div>
                    <strong>{s.name}</strong>
                    <p className="text-muted text-sm">{s.description || 'General Service'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedServiceId(s.id);
                      setActiveTab('take-token');
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. AVAILABLE SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="card">
          <h3>Available Queue Services</h3>
          <div className="table-responsive mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Description</th>
                  <th>Active Counters</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const linkedCounters = counters.filter((c) => Number(c.serviceId) === Number(s.id));
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.description || 'N/A'}</td>
                      <td>{linkedCounters.map((c) => c.name).join(', ') || 'Default Counter'}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedServiceId(s.id);
                            setActiveTab('take-token');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          🎟️ Take Token
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAKE TOKEN TAB */}
      {activeTab === 'take-token' && (
        <div className="card auth-card margin-auto" style={{ maxWidth: '540px' }}>
          <h3 className="text-center">Request a Queue Token</h3>
          <p className="text-muted text-center mb-4">Choose a service to issue your sequential token number.</p>
          <form onSubmit={handleTakeToken}>
            <div className="form-group">
              <label>Select Service</label>
              <select
                className="form-control"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.description}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading || services.length === 0}>
              {loading ? 'Generating...' : '🎟️ Get My Token'}
            </button>
          </form>
        </div>
      )}

      {/* 4. MY CURRENT TOKEN TAB */}
      {activeTab === 'current-token' && (
        <div className="card margin-auto" style={{ maxWidth: '640px' }}>
          <div className="flex-between align-center mb-3">
            <h3>My Current Token Position</h3>
            <div className="flex-between align-center" style={{ gap: '0.75rem' }}>
              <button onClick={loadInitialData} className="btn btn-outline btn-sm">
                🔄 Refresh Status
              </button>
              <span className="live-pulse text-sm text-muted">🟢 Live Tracker</span>
            </div>
          </div>

          {activeToken ? (
            <div className="ticket-card p-4 text-center">
              <div className="ticket-header">
                <span className="ticket-title">{activeToken.serviceName}</span>
                <span className={`status-badge status-${activeToken.status.toLowerCase()}`}>
                  {activeToken.status}
                </span>
              </div>

              {/* YOUR TOKEN BIG NUMBER */}
              <div className="ticket-body my-4">
                <span className="box-label">YOUR TOKEN</span>
                <h1 className="serving-number color-primary">T-{activeToken.tokenNumber}</h1>
              </div>

              {/* CURRENTLY SERVING & PEOPLE AHEAD */}
              <div className="grid-2 gap-3 position-stats">
                <div className="info-box">
                  <span className="box-label">CURRENTLY SERVING</span>
                  <span className="box-value">
                    {activeTokenPosition?.currentlyServingTokenNumber
                      ? `T-${activeTokenPosition.currentlyServingTokenNumber}`
                      : 'None'}
                  </span>
                </div>
                <div className="info-box">
                  <span className="box-label">PEOPLE AHEAD</span>
                  <span className="box-valueHighlight">
                    {activeTokenPosition ? activeTokenPosition.peopleAhead : activeToken.peopleAhead}
                  </span>
                </div>
              </div>

              {/* CANCEL BUTTON */}
              {activeToken.status === 'WAITING' && (
                <button
                  onClick={() => handleCancelToken(activeToken.id)}
                  className="btn btn-danger btn-block mt-4"
                >
                  ✖ Cancel Token
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              {tokens.length > 0 && tokens[0].status === 'COMPLETED' ? (
                <div className="alert alert-success p-4 mb-3 text-center">
                  <h3 className="mb-2">✅ Token T-{tokens[0].tokenNumber} Completed!</h3>
                  <p>Service: <strong>{tokens[0].serviceName}</strong> {tokens[0].counterName ? `at ${tokens[0].counterName}` : ''}</p>
                  <p className="text-muted text-sm mt-1">Status: COMPLETED successfully by counter staff.</p>
                </div>
              ) : (
                <div className="p-4 text-muted">
                  <h4>No Active Token</h4>
                  <p className="mt-1">You do not currently have a waiting or serving token in line.</p>
                </div>
              )}
              <button onClick={() => setActiveTab('take-token')} className="btn btn-primary mt-2">
                🎟️ Take a Token Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. TOKEN HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card">
          <h3>My Token History</h3>
          <div className="table-responsive mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Service</th>
                  <th>Counter</th>
                  <th>Status</th>
                  <th>Issued Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No token history records found.</td>
                  </tr>
                ) : (
                  tokens.map((t) => (
                    <tr key={t.id}>
                      <td><strong>T-{t.tokenNumber}</strong></td>
                      <td>{t.serviceName}</td>
                      <td>{t.counterName || 'Unassigned'}</td>
                      <td>
                        <span className={`status-badge status-${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
