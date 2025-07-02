import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Form, Modal, Badge } from "react-bootstrap";

const STATUSES = ["Open", "Pending", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const IssueManagement = () => {
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
        const res = await fetch("http://localhost:5000/api/issues/all"); // Updated fetch URL
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

      const updatePayload = {
        status: editFields.status,
        priority: editFields.priority,
        category: editFields.category,
        ...(commentText ? { comment: commentText } : {}),
      };

      const res = await fetch("http://localhost:5000/api/issues/update", {
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

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 text-center">Issue Report Management</h2>

      {/* Filters */}
      <Row className="mb-3 g-3">
        <Col md={2}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control placeholder="Filter by Department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} />
        </Col>
        <Col md={2}>
          <Form.Control type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} placeholder="From" />
        </Col>
        <Col md={2}>
          <Form.Control type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} placeholder="To" />
        </Col>
      </Row>

      {/* Issues Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reported On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No issues found.
              </td>
            </tr>
          ) : (
            filteredIssues.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.title}</td>
                <td>{issue.category}</td>
                <td>
                  <Badge bg={issue.priority === "Urgent" ? "danger" : issue.priority === "High" ? "warning" : "secondary"}>{issue.priority}</Badge>
                </td>
                <td>{issue.status}</td>
                <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" variant="primary" onClick={() => openModal(issue)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Issue Details Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Manage Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIssue && (
            <>
              <Row className="mb-3">
                <Col md={6}>{selectedIssue.image && <img src={selectedIssue.image} alt="Issue" style={{ maxHeight:'320px', width: "100%", borderRadius: "8px" }} />}</Col>
                <Col md={6}>
                  <h5>{selectedIssue.title}</h5>
                  <p className="text-muted">
                    <strong>Description:</strong>
                    <br />
                    {selectedIssue.description}
                  </p>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="text-black">Status</Form.Label>
                <Form.Select value={editFields.status} onChange={(e) => setEditFields((prev) => ({ ...prev, status: e.target.value }))}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-black">Priority</Form.Label>
                <Form.Select value={editFields.priority} onChange={(e) => setEditFields((prev) => ({ ...prev, priority: e.target.value }))}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-black">Department</Form.Label>
                <Form.Control type="text" value={editFields.category} onChange={(e) => setEditFields((prev) => ({ ...prev, category: e.target.value }))} />
              </Form.Group>
              <hr />
              <h6>Add Comment</h6>
              <Form.Control as="textarea" rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Enter comment" />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IssueManagement;
