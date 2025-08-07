import React, { useEffect, useState } from 'react';
import { Modal, Button, Badge, Form, Row, Col, Table } from 'react-bootstrap';

const ManageClassroomModal = ({
  show,
  classroom,
  onClose,
  onStatusChange,
  onDelete,
  onSaveSchedules,
}) => {
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
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Manage Classroom - {classroom?.location_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>
          Status:{' '}
          <Badge bg={classroom?.isActive ? 'success' : 'secondary'}>
            {classroom?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </h5>

        {/* Status and Delete buttons */}
        <div className="mb-3">
          <Button
            variant={classroom?.isActive ? 'warning' : 'success'}
            className="me-2"
            onClick={onStatusChange}
          >
            {classroom?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>

        <hr />

        <h5>Manage Availability / Schedule</h5>
        <Table bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Year</th>
              <th>Semester</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Start Date</th>
              <th>Recurring</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sch) => (
              <tr key={sch._id}>
                <td>{sch.year}</td>
                <td>{sch.semester}</td>
                <td>{sch.day}</td>
                <td>{sch.start_time}</td>
                <td>{sch.end_time}</td>
                <td>{sch.start_date ? new Date(sch.start_date).toLocaleDateString() : ''}</td>
                <td>{sch.is_recurring ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteSchedule(sch._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <h6>Add New Schedule</h6>
        <Form>
          <Row className="mb-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={newSchedule.year}
                  onChange={handleScheduleChange}
                  placeholder="e.g., 2025"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  type="text"
                  name="semester"
                  value={newSchedule.semester}
                  onChange={handleScheduleChange}
                  placeholder="e.g., Fall"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Day</Form.Label>
                <Form.Control
                  type="text"
                  name="day"
                  value={newSchedule.day}
                  onChange={handleScheduleChange}
                  placeholder="e.g., Monday"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="start_time"
                  value={newSchedule.start_time}
                  onChange={handleScheduleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="end_time"
                  value={newSchedule.end_time}
                  onChange={handleScheduleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={newSchedule.start_date}
                  onChange={handleScheduleChange}
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
            />
          </Form.Group>
          <Button variant="primary" onClick={handleAddSchedule}>
            Add Schedule
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ManageClassroomModal;
