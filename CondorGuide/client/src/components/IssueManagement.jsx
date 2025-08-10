import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Table, Button, Form, Modal, Badge } from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Open", "Pending", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const IssueManagement = () => {
  const { currentUser } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editFields, setEditFields] = useState({});

  // Load issues from API on mount
  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issues/all`);
        const data = await res.json();
        setIssues(data.data);
        setFilteredIssues(data.data);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
      }
    }
    fetchIssues();
  }, []);

  // Filter issues whenever filters or issues list changes
  useEffect(() => {
    let filtered = [...issues];
    if (statusFilter) filtered = filtered.filter((i) => i.status === statusFilter);
    if (priorityFilter) filtered = filtered.filter((i) => i.priority === priorityFilter);
    if (departmentFilter) filtered = filtered.filter((i) => i.category.toLowerCase().includes(departmentFilter.toLowerCase()));
    if (dateFromFilter) filtered = filtered.filter((i) => new Date(i.createdAt) >= new Date(dateFromFilter));
    if (dateToFilter) filtered = filtered.filter((i) => new Date(i.createdAt) <= new Date(dateToFilter));
    setFilteredIssues(filtered);
  }, [statusFilter, priorityFilter, departmentFilter, dateFromFilter, dateToFilter, issues]);

  const openModal = (issue) => {
    setSelectedIssue(issue);
    setEditFields({
      status: issue.status,
      priority: issue.priority,
      category: issue.category,
    });
    setCommentText("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
  };

  // Update issue in backend and refresh list
  const handleSaveChanges = async () => {
    if (!selectedIssue) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issues/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          issueId: selectedIssue._id,
          status: editFields.status,
          priority: editFields.priority,
          category: editFields.category,
          ...(commentText ? { comment: commentText } : {}),
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedIssue = (await res.json()).data;
      setIssues((prev) => prev.map((i) => (i._id === updatedIssue._id ? updatedIssue : i)));

      closeModal();
    } catch (err) {
      alert("Failed to update issue.");
      console.error(err);
    }
  };

  // Define priority border colors
  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "#ff073a"; // Vivid red
      case "High":
        return "#ff6200"; // Bright orange
      case "Medium":
        return "#ffc107"; // Lively yellow
      case "Low":
        return "#28a745"; // Subtle green
      default:
        return theme === "dark" ? "#fff" : "#333";
    }
  };

  return (
    <main className="py-4 py-md-5" style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
      <Container className="p-3 p-md-4" style={{ backgroundColor: "transparent" }}>
        <div className="text-center mb-4 mb-md-5">
          <h1 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Issue Report <span style={{ color: "#B68E0C" }}>Management</span>
          </h1>
          <p className={`lead ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Efficiently manage reported issues and their statuses.
          </p>
        </div>

        {/* Filters */}
        <Row className="mb-3 g-3">
          <Col xs={12} sm={6} md={2}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
              style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={6} md={2}>
            <Form.Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
              style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Form.Control
              placeholder="Filter by Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
              style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
            />
          </Col>
          <Col xs={12} sm={6} md={2}>
            <Form.Control
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              placeholder="From"
              className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
              style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
            />
          </Col>
          <Col xs={12} sm={6} md={2}>
            <Form.Control
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              placeholder="To"
              className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
              style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
            />
          </Col>
        </Row>

        {/* Issues Table */}
        <div className="table-responsive" style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table
            className={`border-0 rounded-3 overflow-hidden ${theme === "dark" ? "table-dark" : "table-light"}`}
            style={{ backgroundColor: "#fff", minWidth: "600px" }}
          >
            <thead style={{ background: theme === "dark" ? "#222" : "#f1f3f5", color: theme === "dark" ? "#fff" : "#333" }}>
              <tr>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "200px" }}>
                  Title
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Department
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  Priority
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  Status
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Reported On
                </th>
                {currentUser.role === "maintenance" && (
                  <th className="px-4 py-3 text-center" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "transparent" }}>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.role === "maintenance" ? 6 : 5} className="px-4 py-3 text-center" style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    No issues found.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue._id}
                    style={{
                      borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                      backgroundColor: "transparent"
                    }}
                  >
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"} style={{ wordBreak: "break-all" }}>
                        {issue.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{issue.category}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${getPriorityBorderColor(issue.priority)}`,
                          color: theme === "dark" ? "#fff" : "#333",
                          fontSize: "0.9rem"
                        }}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${theme === "dark" ? "#fff" : "#333"}`,
                          color: theme === "dark" ? "#fff" : "#333",
                          fontSize: "0.9rem"
                        }}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    {currentUser.role === "maintenance" && (
                      <td className="px-4 py-3 align-middle text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center mx-auto"
                          style={{
                            borderColor: "#B68E0C",
                            color: "#B68E0C",
                            fontWeight: 500
                          }}
                          onClick={() => openModal(issue)}
                        >
                          <Edit size={16} className="me-1" />
                          Manage
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Issue Details Modal */}
        <Modal show={showModal} onHide={closeModal} size="lg" scrollable>
          <Modal.Header closeButton style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
            <Modal.Title>Manage Issue</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
            {selectedIssue && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    {selectedIssue.image && (
                      <img
                        src={selectedIssue.image}
                        alt="Issue"
                        style={{ maxHeight: "320px", width: "100%", borderRadius: "8px", objectFit: "cover" }}
                      />
                    )}
                  </Col>
                  <Col md={6}>
                    <h5 className={theme === "dark" ? "text-white" : "text-black"}>{selectedIssue.title}</h5>
                    <p className={theme === "dark" ? "text-light" : "text-muted"}>
                      <strong>Description:</strong>
                      <br />
                      {selectedIssue.description}
                    </p>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Status</Form.Label>
                  <Form.Select
                    value={editFields.status}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, status: e.target.value }))}
                    className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                    style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Priority</Form.Label>
                  <Form.Select
                    value={editFields.priority}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, priority: e.target.value }))}
                    className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                    style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFields.category}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, category: e.target.value }))}
                    className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                    style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                  />
                </Form.Group>
                <hr style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }} />
                <h6 className={theme === "dark" ? "text-white" : "text-black"}>Add Comment</h6>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter comment"
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: theme === "dark" ? "#222" : "#fff", borderColor: theme === "dark" ? "#444" : "#ddd" }}>
            <Button
              variant="outline"
              onClick={closeModal}
              style={{ borderColor: theme === "dark" ? "#fff" : "#333", color: theme === "dark" ? "#fff" : "#333" }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveChanges}
              style={{ borderColor: "#B68E0C", color: "#B68E0C" }}
              className="btn-outline-gold"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </main>
  );
};

export default IssueManagement;