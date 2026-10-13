import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getServicesApi, createServiceApi, updateServiceApi, deleteServiceApi,
  getCountersApi, createCounterApi, updateCounterApi, deleteCounterApi,
  getAllUsersApi
} from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'counters', 'users'

  // Service States
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceActive, setServiceActive] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Counter States
  const [counters, setCounters] = useState([]);
  const [counterName, setCounterName] = useState('');
  const [counterServiceId, setCounterServiceId] = useState('');
  const [counterActive, setCounterActive] = useState(true);
  const [editingCounterId, setEditingCounterId] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);

  // Feedback Messages
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const sData = await getServicesApi();
      const cData = await getCountersApi();
      const uData = await getAllUsersApi();
      setServices(sData);
      setCounters(cData);
      setUsers(uData);

      if (sData.length > 0 && !counterServiceId) {
        setCounterServiceId(sData[0].id);
      }
    } catch (err) {
      setError('Failed to load admin management data.');
    } finally {
      setLoading(false);
    }
  };

  // --- 1. SERVICES CRUD ---
  const handleSaveService = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!serviceName) {
      setError('Service name is required.');
      return;
    }
    try {
      if (editingServiceId) {
        await updateServiceApi(editingServiceId, {
          name: serviceName,
          description: serviceDesc,
          active: serviceActive
        });
        setMessage(`Service '${serviceName}' updated successfully!`);
      } else {
        await createServiceApi({
          name: serviceName,
          description: serviceDesc,
          active: serviceActive
        });
        setMessage(`Service '${serviceName}' created successfully!`);
      }
      resetServiceForm();
      await loadAllData();
    } catch (err) {
      setError('Failed to save service record.');
    }
  };

  const handleEditService = (s) => {
    setEditingServiceId(s.id);
    setServiceName(s.name);
    setServiceDesc(s.description || '');
    setServiceActive(s.active !== false);
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service '${name}'?`)) return;
    setMessage(null);
    setError(null);
    try {
      await deleteServiceApi(id);
      setMessage(`Service '${name}' deleted successfully.`);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete service.');
    }
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceDesc('');
    setServiceActive(true);
  };

  // --- 2. COUNTERS CRUD ---
  const handleSaveCounter = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!counterName || !counterServiceId) {
      setError('Counter name and assigned service are required.');
      return;
    }
    try {
      if (editingCounterId) {
        await updateCounterApi(editingCounterId, {
          name: counterName,
          serviceId: Number(counterServiceId),
          active: counterActive
        });
        setMessage(`Counter '${counterName}' updated successfully!`);
      } else {
        await createCounterApi({
          name: counterName,
          serviceId: Number(counterServiceId),
          active: counterActive
        });
        setMessage(`Counter '${counterName}' created successfully!`);
      }
      resetCounterForm();
      await loadAllData();
    } catch (err) {
      setError('Failed to save counter record.');
    }
  };

  const handleEditCounter = (c) => {
    setEditingCounterId(c.id);
    setCounterName(c.name);
    setCounterServiceId(c.serviceId);
    setCounterActive(c.active !== false);
  };

  const handleDeleteCounter = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete counter '${name}'?`)) return;
    setMessage(null);
    setError(null);
    try {
      await deleteCounterApi(id);
      setMessage(`Counter '${name}' deleted successfully.`);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete counter.');
    }
  };

  const resetCounterForm = () => {
    setEditingCounterId(null);
    setCounterName('');
    setCounterActive(true);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4">
        <h2>Administrator Management Panel</h2>
        <p className="text-muted">Welcome, {user?.name}! Manage system services, counters, and user accounts.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Admin Sub-Page Navigation Tabs */}
      <div className="tab-navigation mb-4">
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          📁 Services ({services.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'counters' ? 'active' : ''}`}
          onClick={() => setActiveTab('counters')}
        >
          🖥️ Counters ({counters.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Registered Users ({users.length})
        </button>
      </div>

      {/* SUB-PAGE 1: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="grid-2 gap-4">
          {/* Add / Edit Service Form */}
          <div className="card">
            <h3>{editingServiceId ? 'Edit Service Details' : 'Add New Queue Service'}</h3>
            <form onSubmit={handleSaveService} className="mt-3">
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Tuition & Exam Fees"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief overview of service scope"
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                />
              </div>

              <div className="form-group flex-between align-center">
                <label className="mb-0">Service Active Status</label>
                <input
                  type="checkbox"
                  checked={serviceActive}
                  onChange={(e) => setServiceActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>

              <div className="button-group mt-4">
                <button type="submit" className="btn btn-primary">
                  {editingServiceId ? 'Update Service' : 'Save Service'}
                </button>
                {editingServiceId && (
                  <button type="button" onClick={resetServiceForm} className="btn btn-secondary">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Services Data Table */}
          <div className="card">
            <h3>Services List</h3>
            <div className="table-responsive mt-3">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No services added yet.</td>
                    </tr>
                  ) : (
                    services.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.description || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${s.active ? 'status-serving' : 'status-completed'}`}>
                            {s.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="button-group">
                            <button onClick={() => handleEditService(s)} className="btn btn-outline btn-sm">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteService(s.id, s.name)} className="btn btn-danger btn-sm">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: COUNTERS MANAGEMENT */}
      {activeTab === 'counters' && (
        <div className="grid-2 gap-4">
          {/* Add / Edit Counter Form */}
          <div className="card">
            <h3>{editingCounterId ? 'Edit Counter Window' : 'Add New Counter Window'}</h3>
            <form onSubmit={handleSaveCounter} className="mt-3">
              <div className="form-group">
                <label>Counter Label / Window Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Counter 1 (Fees Deposit)"
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assigned Queue Service *</label>
                <select
                  className="form-control"
                  value={counterServiceId}
                  onChange={(e) => setCounterServiceId(e.target.value)}
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-between align-center">
                <label className="mb-0">Counter Active Status</label>
                <input
                  type="checkbox"
                  checked={counterActive}
                  onChange={(e) => setCounterActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>

              <div className="button-group mt-4">
                <button type="submit" className="btn btn-primary">
                  {editingCounterId ? 'Update Counter' : 'Save Counter'}
                </button>
                {editingCounterId && (
                  <button type="button" onClick={resetCounterForm} className="btn btn-secondary">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Counters Data Table */}
          <div className="card">
            <h3>Counter Windows List</h3>
            <div className="table-responsive mt-3">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Counter Name</th>
                    <th>Linked Service</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {counters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No counters added yet.</td>
                    </tr>
                  ) : (
                    counters.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.serviceName}</td>
                        <td>
                          <span className={`status-badge ${c.active ? 'status-serving' : 'status-completed'}`}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="button-group">
                            <button onClick={() => handleEditCounter(c)} className="btn btn-outline btn-sm">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteCounter(c.id, c.name)} className="btn btn-danger btn-sm">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 3: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="card">
          <h3>Registered System Users</h3>
          <p className="text-muted mb-3">View all registered accounts and assigned system roles.</p>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>System Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No registered users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
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

export default AdminDashboard;
