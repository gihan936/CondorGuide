import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const categories = ["Medical", "Fire", "Harassment", "Theft"];

const SecurityAlert = () => {
  const { currentUser } = useAuth();
  useContext(ThemeContext);
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("critical");
  const [category, setCategory] = useState(categories[0]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 10;

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
      const res = await axios.get("/api/security-alerts", { headers });
      setAlerts(res.data);
    } catch (err) {
      console.error("Load alerts error:", err);
    }
  };

  const sendAlert = async () => {
    try {
      const payload =
        tab === "critical"
          ? { emergencyType: "critical" }
          : { emergencyType: "non-critical", category };

      await axios.post("/api/security-alerts", payload, { headers });
      loadAlerts();
    } catch (err) {
      setError(err.response?.data?.message || "Error sending alert");
    }
  };

  const pickAlert = async (id) => {
    try {
      await axios.put(`/api/security-alerts/${id}/pick`, {}, { headers });
      loadAlerts();
    } catch (err) {
      console.error("Error picking alert:", err);
    }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.patch(`/api/security-alerts/${id}/resolve`, {}, { headers });
      loadAlerts();
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  const getElapsedTime = (createdAt) => {
    const diff = Math.floor((now - new Date(createdAt)) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const totalPages = Math.ceil(sortedAlerts.length / alertsPerPage);
  const paginatedAlerts = sortedAlerts.slice(
    (currentPage - 1) * alertsPerPage,
    currentPage * alertsPerPage
  );
  const hasActiveAlert = alerts.some(
    (a) => !a.resolved && a.userId === currentUser._id
  );

  return (
    <>


      <div className="security-alert-container">
        <div className="container">
          <h2 className="security-alert-title">Security Alert Center</h2>

          {currentUser.role === "user" && (
            <>
              <ul className="nav security-nav-tabs">
                <li className="nav-item security-nav-item">
                  <button
                    className={`nav-link security-nav-link ${
                      tab === "critical" ? "active" : ""
                    }`}
                    onClick={() => setTab("critical")}
                  >
                    Critical Emergency
                  </button>
                </li>
                <li className="nav-item security-nav-item">
                  <button
                    className={`nav-link security-nav-link ${
                      tab === "non-critical" ? "active" : ""
                    }`}
                    onClick={() => setTab("non-critical")}
                  >
                    Non‑Critical Report
                  </button>
                </li>
              </ul>

              {error && (
                <div className="alert security-error-alert">
                  <strong>Alert:</strong> {error}
                </div>
              )}

              <div className="card security-alert-card">
                <div className="card-body security-card-body">
                  {tab === "non-critical" && (
                    <div className="mb-3">
                      <label className="form-label fw-bold mb-2">
                        Select Category:
                      </label>
                      <select
                        className="form-select security-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    className={`security-main-button ${
                      hasActiveAlert
                        ? "security-disabled-button"
                        : tab === "critical"
                        ? "security-critical-button"
                        : "security-non-critical-button"
                    }`}
                    disabled={hasActiveAlert}
                    onClick={sendAlert}
                  >
                    {hasActiveAlert
                      ? "Alert Sent – Awaiting Help"
                      : tab === "critical"
                      ? "I Need Immediate Help!"
                      : `Report ${category}`}
                  </button>

                  {alerts
                    .filter((a) => !a.resolved)
                    .map((alert) =>
                      alert.pickedBy && alert.userId === currentUser._id ? (
                        <div
                          key={alert._id}
                          className="alert security-assistance-alert d-flex justify-content-between align-items-center"
                        >
                          <div className="text-center">
                            <strong>{alert.pickedByName}</strong> is on the way
                            to assist you. Help is coming!
                          </div>
                          <button
                            className="btn security-resolve-button"
                            onClick={() => resolveAlert(alert._id)}
                          >
                            Mark as Resolved
                          </button>
                        </div>
                      ) : null
                    )}
                </div>
              </div>
            </>
          )}

          {["security", "admin", "superadmin"].includes(currentUser.role) && (
            <>
              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="security-stats-card">
                    <h4 className="mb-2" style={{ color: "var(--gold)" }}>
                      Total Alerts
                    </h4>
                    <h2 className="mb-0">{alerts.length}</h2>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="security-stats-card">
                    <h4 className="mb-2" style={{ color: "#dc3545" }}>
                      Unclaimed
                    </h4>
                    <h2 className="mb-0">
                      {alerts.filter((a) => !a.isPicked && !a.resolved).length}
                    </h2>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="security-stats-card">
                    <h4 className="mb-2" style={{ color: "#28a745" }}>
                      In Progress
                    </h4>
                    <h2 className="mb-0">
                      {alerts.filter((a) => a.isPicked && !a.resolved).length}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="table-responsive">
                <table className="table security-alerts-table">
                  <thead className="security-table-header">
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Elapsed Time</th>
                      <th>Status</th>
                      {currentUser.role === "security" && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody className="security-table-body">
                    {paginatedAlerts.map((alert) => (
                      <tr
                        key={alert._id}
                        className={alert.isPicked ? "security-picked-row" : ""}
                      >
                        <td>
                          <strong>{alert.username}</strong>
                        </td>
                        <td>
                          <span className="fw-bold">
                            {alert.emergencyType === "critical" ? "CRITICAL" : 
                              `${alert.emergencyType} (${alert.category})`}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              !alert.isPicked ? "security-elapsed-time" : ""
                            }
                          >
                            {!alert.isPicked
                              ? `${getElapsedTime(alert.createdAt)}`
                              : "Picked"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge security-status-badge ${
                              alert.isPicked
                                ? "security-picked-badge"
                                : "security-unclaimed-badge"
                            }`}
                          >
                            {alert.isPicked
                              ? `Picked by ${alert.pickedByName}`
                              : "Unclaimed"}
                          </span>
                        </td>

                        {currentUser.role === "security" && (
                          <td>
                            {!alert.isPicked && (
                              <button
                                className="btn security-pickup-button"
                                onClick={() => pickAlert(alert._id)}
                              >
                                Pick Up
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="security-mobile-view">
                {paginatedAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`security-mobile-alert-card ${alert.isPicked ? "picked" : ""}`}
                  >
                    <div className="security-mobile-alert-header">
                      <div className="security-mobile-alert-user">
                        {alert.username}
                      </div>
                      <div className={`security-mobile-alert-time ${
                        !alert.isPicked ? "security-elapsed-time" : ""
                      }`}>
                        {!alert.isPicked
                          ? `${getElapsedTime(alert.createdAt)}`
                          : "Picked"}
                      </div>
                    </div>
                    
                    <div className="security-mobile-alert-type">
                      {alert.emergencyType === "critical" ? "CRITICAL EMERGENCY" : 
                        `${alert.emergencyType} (${alert.category})`}
                    </div>
                    
                    <div className="security-mobile-alert-actions">
                      <span
                        className={`badge security-status-badge ${
                          alert.isPicked
                            ? "security-picked-badge"
                            : "security-unclaimed-badge"
                        }`}
                      >
                        {alert.isPicked
                          ? `Picked by ${alert.pickedByName}`
                          : "Unclaimed"}
                      </span>
                      
                      {currentUser.role === "security" && !alert.isPicked && (
                        <button
                          className="btn security-pickup-button"
                          onClick={() => pickAlert(alert._id)}
                        >
                          Pick Up
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <nav>
                <ul className="pagination security-pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SecurityAlert;