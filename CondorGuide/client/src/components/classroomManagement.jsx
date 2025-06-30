import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Button, Modal, Form, Table, Badge
} from 'react-bootstrap';

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    location_id: '',
    location_name: '',
    location_type: '',
    location_number: '',
    description: '',
    capacity: '',
    equipment: '',
    isActive: true,
    availability: [],
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/classrooms/all');
      const data = await res.json();
      setClassrooms(data);
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
    }
  };

  const handleOpenModal = (classroom = null) => {
    if (classroom) {
      setEditingClassroom(classroom);
      setFormData({
        ...classroom,
        equipment: classroom.equipment?.join(', ') || '',
      });
    } else {
      setEditingClassroom(null);
      setFormData({
        location_id: '',
        location_name: '',
        location_type: '',
        location_number: '',
        description: '',
        capacity: '',
        equipment: '',
        isActive: true,
        availability: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClassroom(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      equipment: formData.equipment.split(',').map((e) => e.trim()),
    };

    const url = editingClassroom
      ? `http://localhost:5000/api/classrooms/${editingClassroom._id}`
      : 'http://localhost:5000/api/classrooms';

    const method = editingClassroom ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');
      await fetchClassrooms();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Error saving classroom');
    }
  };

  const handleShowManageModal = (classroom) => {
    setSelectedClassroom(classroom);
    setShowManageModal(true);
  };

  const handleCloseManageModal = () => {
    setSelectedClassroom(null);
    setShowManageModal(false);
  };

  const handleStatusChange = async () => {
    if (!selectedClassroom) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classrooms/${selectedClassroom._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !selectedClassroom.isActive }),
      });
      if (!res.ok) throw new Error('Status update failed');
      await fetchClassrooms();
      handleCloseManageModal();
    } catch (err) {
      console.error(err);
      alert('Failed to update classroom status');
    }
  };

  const handleDelete = async () => {
    if (!selectedClassroom) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classrooms/${selectedClassroom._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchClassrooms();
      handleCloseManageModal();
    } catch (err) {
      console.error(err);
      alert('Failed to delete classroom');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h3>Classroom Management</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => handleOpenModal()}>Add Classroom</Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Room</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Equipment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((cls) => (
            <tr key={cls._id}>
              <td>{cls.location_id}</td>
              <td>{cls.location_name}</td>
              {/* ({cls.location_number}) */}
              <td>{cls.location_type}</td>
              <td>{cls.capacity}</td>
              <td>{cls.equipment?.join(', ')}</td>
              <td>
                <Badge bg={cls.isActive ? 'success' : 'secondary'}>
                  {cls.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => handleOpenModal(cls)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleShowManageModal(cls)}
                >
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit/Add Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingClassroom ? 'Edit' : 'Add'} Classroom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Location ID</Form.Label>
              <Form.Control
                type="number"
                name="location_id"
                value={formData.location_id}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Control
                type="text"
                name="location_type"
                value={formData.location_type}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Room Number</Form.Label>
              <Form.Control
                type="text"
                name="location_number"
                value={formData.location_number}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Equipment (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="equipment"
                value={formData.equipment}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {editingClassroom ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manage Modal */}
      <Modal show={showManageModal} onHide={handleCloseManageModal}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Classroom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            What would you like to do with{' '}
            <strong>{selectedClassroom?.location_name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseManageModal}>Cancel</Button>
          <Button
            variant={selectedClassroom?.isActive ? 'warning' : 'success'}
            onClick={handleStatusChange}
          >
            {selectedClassroom?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClassroomManagement;
