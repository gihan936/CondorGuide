import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
} from "react-bootstrap";

const categories = ["Medical", "Fire", "Harassment", "Theft"];

const SecurityAlert = () => {
  const { currentUser } = useAuth();
  const { theme } = useContext(ThemeContext);
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
    console.log("[Effect] Component mounted: Loading alerts");
    loadAlerts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    console.log(
      `[API] loadAlerts: Sending GET ${
        import.meta.env.VITE_API_BASE_URL
      }/api/security-alerts`
    );
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/security-alerts`,
        { headers }
      );
      console.log("[API] loadAlerts: Response received", res.data);
      setAlerts(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("[API] loadAlerts: Error", err);
      setError("Failed to load alerts.");
    }
  };

  const sendAlert = async () => {
    const payload =
      tab === "critical"
        ? { emergencyType: "critical" }
        : { emergencyType: "non-critical", category };
    console.log(
      "[API] sendAlert: Sending POST /api/security-alerts with payload:",
      payload
    );

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/security-alerts`,
        payload,
        { headers }
      );
      console.log("[API] sendAlert: Alert sent successfully", res.data);
      setError(null);
      await loadAlerts();
    } catch (err) {
      console.error("[API] sendAlert: Error sending alert", err);
      setError(err.response?.data?.message || "Error sending alert");
    }
  };

  const pickAlert = async (id) => {
    console.log(`[API] pickAlert: Sending PUT /api/security-alerts/${id}/pick`);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/security-alerts/${id}/pick`,
        {},
        { headers }
      );
      console.log("[API] pickAlert: Alert picked successfully", res.data);
      setError(null);
      await loadAlerts();
    } catch (err) {
      console.error("[API] pickAlert: Error picking alert", err);
      setError("Error picking alert.");
    }
  };

  const resolveAlert = async (id) => {
    console.log(
      `[API] resolveAlert: Sending PATCH /api/security-alerts/${id}/resolve`
    );
    try {
      const res = await axios.patch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/security-alerts/${id}/resolve`,
        {},
        { headers }
      );
      console.log("[API] resolveAlert: Alert resolved successfully", res.data);
      setError(null);
      await loadAlerts();
    } catch (err) {
      console.error("[API] resolveAlert: Error resolving alert", err);
      setError("Error resolving alert.");
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

  console.log("[State] hasActiveAlert:", hasActiveAlert);
  console.log("[State] alerts:", alerts);

  // Log key state changes for debugging
  useEffect(() => {
    console.log("[State] currentPage changed:", currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log("[State] tab changed:", tab);
  }, [tab]);

  useEffect(() => {
    console.log("[State] category changed:", category);
  }, [category]);

  return (
    <main
      className="py-4 py-md-5"
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f8f9fa",
      }}
    >
      <Container className="p-3 p-md-4">
        <div className="text-center mb-4 mb-md-5">
          <h1
            className={`display-6 fw-bold ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Security <span style={{ color: "#B68E0C" }}>Alert Center</span>
          </h1>
          <p
            className={`lead ${theme === "dark" ? "text-light" : "text-muted"}`}
          >
            Report and manage emergencies efficiently.
          </p>
        </div>

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
            <Row className="mb-4">
              {[
                {
                  title: "Total Alerts",
                  value: alerts.length,
                  color: "#B68E0C",
                },
                {
                  title: "Unclaimed",
                  value: alerts.filter((a) => !a.isPicked && !a.resolved)
                    .length,
                  color: "#dc3545",
                },
                {
                  title: "In Progress",
                  value: alerts.filter((a) => a.isPicked && !a.resolved).length,
                  color: "#28a745",
                },
              ].map((stat, idx) => (
                <Col md={4} key={idx}>
                  <Card
                    className={`border-0 rounded-3 overflow-hidden ${
                      theme === "dark"
                        ? "bg-dark text-light"
                        : "bg-white text-dark"
                    }`}
                    style={{
                      background:
                        theme === "dark"
                          ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))"
                          : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Card.Body className="p-4 text-center">
                      <h4
                        className="mb-2"
                        style={{ color: stat.color, fontWeight: 600 }}
                      >
                        {stat.title}
                      </h4>
                      <h2
                        className={`mb-0 ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {stat.value}
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div
              className="table-responsive"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            >
              <Table
                className={`border-0 rounded-3 overflow-hidden ${
                  theme === "dark" ? "table-dark" : "table-light"
                }`}
                style={{ backgroundColor: "transparent", minWidth: "600px" }}
              >
                <thead
                  style={{
                    background: theme === "dark" ? "#222" : "#f1f3f5",
                    color: theme === "dark" ? "#fff" : "#333",
                  }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 text-start"
                      style={{
                        fontWeight: 600,
                        borderBottom: `1px solid ${
                          theme === "dark" ? "#444" : "#ddd"
                        }`,
                        minWidth: "200px",
                      }}
                    >
                      User
                    </th>
                    <th
                      className="px-4 py-3 text-start"
                      style={{
                        fontWeight: 600,
                        borderBottom: `1px solid ${
                          theme === "dark" ? "#444" : "#ddd"
                        }`,
                        minWidth: "150px",
                      }}
                    >
                      Type
                    </th>
                    <th
                      className="px-4 py-3 text-start"
                      style={{
                        fontWeight: 600,
                        borderBottom: `1px solid ${
                          theme === "dark" ? "#444" : "#ddd"
                        }`,
                        minWidth: "150px",
                      }}
                    >
                      Elapsed Time
                    </th>
                    <th
                      className="px-4 py-3 text-start"
                      style={{
                        fontWeight: 600,
                        borderBottom: `1px solid ${
                          theme === "dark" ? "#444" : "#ddd"
                        }`,
                        minWidth: "200px",
                      }}
                    >
                      Status
                    </th>
                    {currentUser.role === "security" && (
                      <th
                        className="px-4 py-3 text-center"
                        style={{
                          fontWeight: 600,
                          borderBottom: `1px solid ${
                            theme === "dark" ? "#444" : "#ddd"
                          }`,
                          minWidth: "150px",
                        }}
                      >
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "transparent" }}>
                  {paginatedAlerts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={currentUser.role === "security" ? 5 : 4}
                        className="px-4 py-3 text-center"
                        style={{ color: theme === "dark" ? "#fff" : "#333" }}
                      >
                        No alerts found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAlerts.map((alert) => (
                      <tr
                        key={alert._id}
                        style={{
                          borderBottom: `1px solid ${
                            theme === "dark" ? "#444" : "#ddd"
                          }`,
                          backgroundColor: "transparent",
                        }}
                      >
                        <td className="px-4 py-3 align-middle">
                          <span
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                            style={{ wordBreak: "break-all" }}
                          >
                            {alert.username}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                          >
                            {alert.emergencyType === "critical"
                              ? "CRITICAL"
                              : `${alert.emergencyType} (${alert.category})`}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span
                            style={{
                              color: !alert.isPicked
                                ? "#dc3545"
                                : theme === "dark"
                                ? "#fff"
                                : "#333",
                              wordBreak: "break-all",
                            }}
                          >
                            {!alert.isPicked
                              ? getElapsedTime(alert.createdAt)
                              : "Picked"}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Badge
                            className="rounded-pill px-3 py-2 fw-semibold"
                            style={{
                              backgroundColor: "transparent",
                              border: `1px solid ${
                                alert.isPicked ? "#28a745" : "#dc3545"
                              }`,
                              color: theme === "dark" ? "#fff" : "#333",
                              fontSize: "0.9rem",
                            }}
                          >
                            {alert.isPicked
                              ? `Picked by ${alert.pickedByName}`
                              : "Unclaimed"}
                          </Badge>
                        </td>
                        {currentUser.role === "security" && (
                          <td className="px-4 py-3 align-middle text-center">
                            {!alert.isPicked && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="d-flex align-items-center mx-auto custom-button"
                                style={{
                                  backgroundColor: "transparent",
                                  borderColor: "#B68E0C",
                                  color: "#B68E0C",
                                  fontWeight: 500,
                                  borderRadius: "8px",
                                }}
                                onClick={() => pickAlert(alert._id)}
                              >
                                Pick Up
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-md-none">
              {paginatedAlerts.map((alert) => (
                <Card
                  key={alert._id}
                  className={`border-0 rounded-3 overflow-hidden mb-3 ${
                    theme === "dark"
                      ? "bg-dark text-light"
                      : "bg-white text-dark"
                  }`}
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))"
                        : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className={
                          theme === "dark" ? "text-white" : "text-black"
                        }
                        style={{ wordBreak: "break-all" }}
                      >
                        {alert.username}
                      </span>
                      <span
                        style={{
                          color: !alert.isPicked
                            ? "#dc3545"
                            : theme === "dark"
                            ? "#fff"
                            : "#333",
                          wordBreak: "break-all",
                        }}
                      >
                        {!alert.isPicked
                          ? getElapsedTime(alert.createdAt)
                          : "Picked"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span
                        className={
                          theme === "dark" ? "text-white" : "text-black"
                        }
                      >
                        {alert.emergencyType === "critical"
                          ? "CRITICAL EMERGENCY"
                          : `${alert.emergencyType} (${alert.category})`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge
                        className="rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${
                            alert.isPicked ? "#28a745" : "#dc3545"
                          }`,
                          color: theme === "dark" ? "#fff" : "#333",
                          fontSize: "0.9rem",
                        }}
                      >
                        {alert.isPicked
                          ? `Picked by ${alert.pickedByName}`
                          : "Unclaimed"}
                      </Badge>
                      {currentUser.role === "security" && !alert.isPicked && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center custom-button"
                          style={{
                            backgroundColor: "transparent",
                            borderColor: "#B68E0C",
                            color: "#B68E0C",
                            fontWeight: 500,
                            borderRadius: "8px",
                          }}
                          onClick={() => pickAlert(alert._id)}
                        >
                          Pick Up
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      style={{
                        backgroundColor:
                          currentPage === i + 1 ? "#B68E0C" : "transparent",
                        color:
                          currentPage === i + 1
                            ? "#fff"
                            : theme === "dark"
                            ? "#fff"
                            : "#333",
                        borderColor: theme === "dark" ? "#444" : "#ddd",
                        borderRadius: "8px",
                      }}
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
      </Container>
    </main>
  );
};

export default SecurityAlert;
