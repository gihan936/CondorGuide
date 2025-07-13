import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const categories = ['Medical', 'Fire', 'Harassment', 'Theft'];

const SecurityAlert = () => {
  const { currentUser } = useAuth();
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState('critical');
  const [category, setCategory] = useState(categories[0]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 5;

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await axios.get('/api/security-alerts', { headers });
      setAlerts(res.data);
    } catch (err) {
      console.error('Load alerts error:', err);
    }
  };

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

  const getElapsedTime = (createdAt) => {
    const diff = Math.floor((now - new Date(createdAt)) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

const sortedAlerts = [...alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const totalPages = Math.ceil(sortedAlerts.length / alertsPerPage);
const paginatedAlerts = sortedAlerts.slice(
  (currentPage - 1) * alertsPerPage,
  currentPage * alertsPerPage
);
  const hasActiveAlert = alerts.some(
    a => !a.resolved && a.userId === currentUser._id
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Security Alerts</h2>

      {currentUser.role === 'user' && (
        <>
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
              className={`btn btn-lg w-100 ${
                hasActiveAlert
                  ? 'btn-secondary'
                  : tab === 'critical'
                  ? 'btn-danger'
                  : 'btn-warning'
              }`}
              disabled={hasActiveAlert}
              onClick={sendAlert}
            >
              {hasActiveAlert
                ? 'Alert Sent – Awaiting Help'
                : tab === 'critical'
                ? 'I Need Immediate Help!'
                : `Report ${category}`}
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
        </>
      )}

      {currentUser.role !== 'user' && (
        <>
          <table className="table table-bordered table-striped table-hover align-middle shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Elapsed Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
<tbody>
  {paginatedAlerts.map(alert => (
    <tr key={alert._id} className={rowStyle(alert)}>
      <td>{alert.username}</td>
      <td>{alert.emergencyType === 'non-critical' ? `${alert.emergencyType} (${alert.category})` : alert.emergencyType}</td>
      <td>{!alert.isPicked ? getElapsedTime(alert.createdAt) : 'Picked'}</td>
      <td>
        <span className={`badge ${alert.isPicked ? 'bg-success' : 'bg-danger'}`}>
          {alert.isPicked ? `Picked by ${alert.pickedByName}` : 'Unclaimed'}
        </span>
      </td>
      <td>
        {!alert.isPicked && (
          <button
            className="btn btn-sm"
            style={{ backgroundColor: 'black', color: 'var(--bs-primary)', borderColor: 'black' }}
            onClick={() => pickAlert(alert._id)}
          >
            Pick Up
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>

          </table>

          <nav className="mt-3">
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default SecurityAlert;
