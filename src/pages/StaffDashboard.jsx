import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getServicesApi,
  getCountersApi,
  getStaffQueueApi,
  callNextTokenApi,
  completeTokenApi,
  skipTokenApi
} from '../services/api';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [queue, setQueue] = useState(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServicesAndCounters();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      loadQueue(selectedServiceId);
    }
  }, [selectedServiceId]);

  const loadServicesAndCounters = async () => {
    setLoading(true);
    try {
      const sData = await getServicesApi();
      const cData = await getCountersApi();
      setServices(sData);
      setCounters(cData);

      if (sData.length > 0) {
        setSelectedServiceId(sData[0].id);
      }
      if (cData.length > 0) {
        setSelectedCounterId(cData[0].id);
      }
    } catch (err) {
      setError('Failed to load services or counter windows.');
    } finally {
      setLoading(false);
    }
  };

  const loadQueue = async (serviceId) => {
    try {
      const data = await getStaffQueueApi(serviceId);
      setQueue(data);
    } catch (err) {
      setError('Failed to refresh queue data.');
    }
  };

  // MAIN ACTION: CALL NEXT TOKEN
  const handleCallNext = async () => {
    setMessage(null);
    setError(null);
    if (!selectedServiceId) {
      setError('Please select a service counter first.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await callNextTokenApi(selectedServiceId, selectedCounterId || null);
      if (res.message) {
        setMessage(res.message);
      }
      // Immediate refresh after calling next token
      await loadQueue(selectedServiceId);
    } catch (err) {
      setError('Failed to call next token from queue.');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: COMPLETE CURRENT TOKEN
  const handleComplete = async (tokenId) => {
    setMessage(null);
    setError(null);
    setActionLoading(true);
    try {
      const res = await completeTokenApi(tokenId);
      if (res.message) {
        setMessage(res.message);
      }
      // Immediate refresh after completing token
      await loadQueue(selectedServiceId);
    } catch (err) {
      setError('Failed to complete token.');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: SKIP TOKEN
  const handleSkip = async (tokenId) => {
    setMessage(null);
    setError(null);
    setActionLoading(true);
    try {
      const res = await skipTokenApi(tokenId);
      if (res.message) {
        setMessage(res.message);
      }
      // Immediate refresh after skipping token
      await loadQueue(selectedServiceId);
    } catch (err) {
      setError('Failed to skip token.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4 flex-between align-center">
        <div>
          <h2>Staff Queue Control Dashboard</h2>
          <p className="text-muted">Operator: {user?.name} | Manage active tokens and call waiting students.</p>
        </div>
        <div className="queue-size-badge card p-2 px-3 text-center">
          <span className="box-label">QUEUE SIZE</span>
          <span className="box-valueHighlight">{queue?.totalWaiting || 0} Waiting</span>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Counter Selection Bar */}
      <div className="card mb-4">
        <div className="grid-2 gap-4 align-center">
          <div className="form-group mb-0">
            <label>Service Department</label>
            <select
              className="form-control"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={loading}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label>Assigned Counter Window</label>
            <select
              className="form-control"
              value={selectedCounterId}
              onChange={(e) => setSelectedCounterId(e.target.value)}
              disabled={loading}
            >
              <option value="">No Counter Assigned</option>
              {counters
                .filter((c) => String(c.serviceId) === String(selectedServiceId))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* PROMINENT CALL NEXT BANNER */}
      <div className="card mb-4 text-center p-4 bg-light-primary">
        <h3 className="mb-2">Next Waiting Token Action</h3>
        <button
          onClick={handleCallNext}
          className="btn btn-success btn-block btn-lg py-3 font-bold shadow"
          style={{ fontSize: '1.4rem' }}
          disabled={actionLoading || queue?.totalWaiting === 0}
        >
          {actionLoading ? 'Calling...' : '📢 CALL NEXT TOKEN'}
        </button>
        {queue?.totalWaiting === 0 && (
          <p className="text-muted mt-2 text-sm">Queue is empty for this service.</p>
        )}
      </div>

      <div className="grid-2 gap-4">
        {/* Currently Serving Token Display */}
        <div className="card text-center">
          <h3 className="mb-3">Currently Serving Token</h3>

          {queue?.currentlyServingTokenNumber ? (
            <div className="serving-box p-4 border rounded">
              <span className="box-label">NOW AT COUNTER</span>
              <h1 className="serving-number my-2">T-{queue.currentlyServingTokenNumber}</h1>

              <div className="button-group justify-center mt-3">
                <button
                  onClick={() => {
                    if (queue.currentlyServingTokenId) {
                      handleComplete(queue.currentlyServingTokenId);
                    }
                  }}
                  className="btn btn-primary btn-lg"
                  disabled={actionLoading || !queue.currentlyServingTokenId}
                >
                  ✅ COMPLETE TOKEN
                </button>
                <button
                  onClick={() => {
                    if (queue.currentlyServingTokenId) {
                      handleSkip(queue.currentlyServingTokenId);
                    }
                  }}
                  className="btn btn-warning btn-lg"
                  disabled={actionLoading || !queue.currentlyServingTokenId}
                >
                  ⏭️ SKIP TOKEN
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-box p-5 text-muted border rounded">
              <h4>No token is currently SERVING</h4>
              <p className="text-sm mt-1">Press "CALL NEXT TOKEN" above to serve the first person in queue.</p>
            </div>
          )}
        </div>

        {/* Waiting Tokens List */}
        <div className="card">
          <div className="flex-between align-center mb-3">
            <h3>Waiting Tokens List</h3>
            <button
              onClick={() => loadQueue(selectedServiceId)}
              className="btn btn-outline btn-sm"
            >
              🔄 Refresh Queue
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Student Name</th>
                  <th>Time Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!queue?.waitingTokens || queue.waitingTokens.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted p-4">
                      No waiting tokens in line.
                    </td>
                  </tr>
                ) : (
                  queue.waitingTokens.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>T-{t.tokenNumber}</strong>
                      </td>
                      <td>{t.userName}</td>
                      <td>{new Date(t.createdAt).toLocaleTimeString()}</td>
                      <td>
                        <button
                          onClick={() => handleSkip(t.id)}
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading}
                        >
                          Skip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
