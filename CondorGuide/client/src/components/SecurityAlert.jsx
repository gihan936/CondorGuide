import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const categories = ['Medical', 'Fire', 'Info'];

const SecurityAlert = () => {
  const { currentUser } = useAuth();
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState('critical');
  const [category, setCategory] = useState(categories[0]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const loadAlerts = async () => {
    try {
      const res = await axios.get('/api/security-alerts', { headers });
      setAlerts(res.data);
    } catch (err) {
      console.error('Load alerts error:', err);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const sendAlert = async () => {
    try {
      const payload = tab === 'critical'
        ? { emergencyType: 'critical' }
        : { emergencyType: 'non-critical', category };

      await axios.post('/api/security-alerts', payload, { headers });
      loadAlerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending alert');
    }
  };

  const pickAlert = async id => {
    try {
      await axios.put(`/api/security-alerts/${id}/pick`, {}, { headers });
      loadAlerts();
    } catch (err) {
      console.error('Error picking alert:', err);
    }
  };

  const resolveAlert = async (id) => {
  try {
    await axios.patch(`/api/security-alerts/${id}/resolve`, {}, { headers });
    loadAlerts();
  } catch (err) {
    console.error('Resolve error:', err);
  }
};

  const rowStyle = alert => alert.isPicked ? 'bg-success text-white' : '';

  return (
    <div className="container py-4">
      <h2 className="mb-4"> Security Alerts</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'critical' ? 'active' : ''}`} onClick={() => setTab('critical')}>Critical</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'non-critical' ? 'active' : ''}`} onClick={() => setTab('non-critical')}>Non‑Critical</button>
        </li>
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4 p-4 shadow-sm">
        {tab === 'non-critical' && (
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <button
          className={`btn btn-lg w-100 ${tab === 'critical' ? 'btn-danger' : 'btn-warning'}`}
          onClick={sendAlert}>
          {tab === 'critical' ? 'I Need Immediate Help!' : `Report ${category}`}
        </button>

        {alerts.filter(a => !a.resolved).map(alert =>
  alert.pickedBy && alert.userId === currentUser._id ? (
    <div key={alert._id} className="alert alert-info mt-3 d-flex justify-content-between align-items-center">
      <div><strong>{alert.pickedByName}</strong> is on the way to assist you.</div>
      <button className="btn btn-sm btn-outline-light ms-3" onClick={() => resolveAlert(alert._id)}>
        Mark as Resolved
      </button>
    </div>
  ) : null
)}

      </div>

{currentUser.role !== 'user' && (
  <>
    <h4>Recent Alerts</h4>
    <table className="table table-hover">
      <thead>
        <tr>
          <th>User</th>
          <th>Type</th>
          <th>Time</th>
          <th>Status</th>
          <th>Action</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {alerts.filter(a => !a.resolved).map(alert => (
          <tr key={alert._id} className={rowStyle(alert)}>
            <td>{alert.username}</td>
            <td>{alert.emergencyType === 'non-critical' ? `${alert.emergencyType} (${alert.category})` : alert.emergencyType}</td>
            <td>{new Date(alert.createdAt).toLocaleString()}</td>
            <td>{alert.isPicked ? `Picked by ${alert.pickedByName}` : '🔴 Unclaimed'}</td>
            <td>
              {!alert.isPicked && (
                <button className="btn btn-sm btn-outline-success" onClick={() => pickAlert(alert._id)}>Pick Up</button>
              )}
            </td>
            <td>
              {alert.pickedBy && alert.userId === currentUser._id &&
                <em>{alert.pickedByName} is on the way.</em>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}

    </div>
  );
};

export default SecurityAlert;
