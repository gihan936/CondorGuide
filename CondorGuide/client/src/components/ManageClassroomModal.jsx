import React, { useEffect, useState, useContext } from 'react';
import { Modal, Button, Badge, Form, Row, Col, Table } from 'react-bootstrap';
import { ThemeContext } from "../context/ThemeContext";

const ManageClassroomModal = ({
  show,
  classroom,
  onClose,
  onStatusChange,
  onDelete,
  onSaveSchedules,
}) => {
  const { theme } = useContext(ThemeContext);
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    year: '',
    semester: '',
    day: '',
    start_time: '',
    end_time: '',
    start_date: '',
    is_recurring: true,
  });

  useEffect(() => {
    if (classroom) {
      fetchSchedules();
    }
  }, [classroom]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/${classroom.location_id}`);
      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      setSchedules([]);
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSchedule = async () => {
    if (!classroom) return;
    try {
      const payload = {
        ...newSchedule,
        location_id: classroom.location_id,
        year: Number(newSchedule.year),
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add schedule');
      setNewSchedule({
        year: '',
        semester: '',
        day: '',
        start_time: '',
        end_time: '',
        start_date: '',
        is_recurring: true,
      });
      await fetchSchedules();
      if (onSaveSchedules) onSaveSchedules(); // notify parent if needed
    } catch (err) {
      console.error(err);
      alert('Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete schedule');
      await fetchSchedules();
      if (onSaveSchedules) onSaveSchedules();
    } catch (err) {
      console.error(err);
      alert('Failed to delete schedule');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
        <Modal.Title>Manage Classroom - {classroom?.location_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
        <h5 className={theme === "dark" ? "text-white" : "text-black"}>
          Status:{' '}
          <span
            className="badge rounded-pill px-3 py-2 fw-semibold"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${classroom?.isActive ? "#28a745" : "#6c757d"}`,
              color: theme === "dark" ? "#fff" : "#333",
              fontSize: "0.9rem"
            }}
          >
            {classroom?.isActive ? 'Active' : 'Inactive'}
          </span>
        </h5>

        {/* Status and Delete buttons */}
        <div className="mb-3 d-flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="btn-outline-gold"
            onClick={onStatusChange}
            style={{ borderColor: "#B68E0C", color: "#B68E0C", fontWeight: 500 }}
          >
            {classroom?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            style={{ borderColor: "#ff073a", color: "#ff073a", fontWeight: 500 }}
            className="btn-outline-red"
          >
            Delete
          </Button>
        </div>

        <hr style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }} />

        <h5 className={theme === "dark" ? "text-white" : "text-black"}>Manage Availability / Schedule</h5>
        <div className="table-responsive" style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table
            className={`border-0 rounded-3 overflow-hidden ${theme === "dark" ? "table-dark" : "table-light"}`}
            style={{ backgroundColor: "#fff", minWidth: "600px" }}
          >
            <thead style={{ background: theme === "dark" ? "#222" : "#f1f3f5", color: theme === "dark" ? "#fff" : "#333" }}>
              <tr>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Year
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  Semester
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Day
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  Start Time
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  End Time
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Start Date
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Recurring
                </th>
                <th className="px-4 py-3 text-center" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "transparent" }}>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-center" style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    No schedules found.
                  </td>
                </tr>
              ) : (
                schedules.map((sch) => (
                  <tr
                    key={sch._id}
                    style={{
                      borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                      backgroundColor: "transparent"
                    }}
                  >
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.year}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.semester}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.day}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.start_time}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.end_time}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>
                        {sch.start_date ? new Date(sch.start_date).toLocaleDateString() : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{sch.is_recurring ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: "#B68E0C", color: "#B68E0C", fontWeight: 500 }}
                        className="btn-outline-gold"
                        onClick={() => handleDeleteSchedule(sch._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <h6 className={theme === "dark" ? "text-white" : "text-black"}>Add New Schedule</h6>
        <Form>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={newSchedule.year}
                  onChange={handleScheduleChange}
                  placeholder="e.g., 2025"
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Semester</Form.Label>
                <Form.Control
                  type="text"
                  name="semester"
                  value={newSchedule.semester}
                  onChange={handleScheduleChange}
                  placeholder="e.g., Fall"
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Day</Form.Label>
                <Form.Control
                  type="text"
                  name="day"
                  value={newSchedule.day}
                  onChange={handleScheduleChange}
                  placeholder="e.g., Monday"
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="start_time"
                  value={newSchedule.start_time}
                  onChange={handleScheduleChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="end_time"
                  value={newSchedule.end_time}
                  onChange={handleScheduleChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={newSchedule.start_date}
                  onChange={handleScheduleChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Recurring Weekly"
              name="is_recurring"
              checked={newSchedule.is_recurring}
              onChange={handleScheduleChange}
              className={theme === "dark" ? "text-white" : "text-black"}
            />
          </Form.Group>
          <Button
            variant="outline"
            onClick={handleAddSchedule}
            style={{ borderColor: "#B68E0C", color: "#B68E0C", fontWeight: 500 }}
            className="btn-outline-gold"
          >
            Add Schedule
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ManageClassroomModal;