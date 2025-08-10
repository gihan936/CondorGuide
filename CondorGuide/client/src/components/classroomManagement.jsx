import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Row, Col, Button, Modal, Form, Table, Badge
} from 'react-bootstrap';
import { ThemeContext } from "../context/ThemeContext";
import ManageClassroomModal from './ManageClassroomModal';
import { Edit } from 'lucide-react';

const ClassroomManagement = () => {
  const { theme } = useContext(ThemeContext);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/classrooms/all`);
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
      ? `${import.meta.env.VITE_API_BASE_URL}/api/classrooms/${editingClassroom._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/classrooms`;

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/classrooms/${selectedClassroom._id}/status`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/classrooms/${selectedClassroom._id}`, {
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
    <main className="py-4 py-md-5" style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
      <Container className="p-3 p-md-4" style={{ backgroundColor: "transparent" }}>
        <div className="text-center mb-4 mb-md-5">
          <h1 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Classroom <span style={{ color: "#B68E0C" }}>Management</span>
          </h1>
          <p className={`lead ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Efficiently manage classrooms and their availability.
          </p>
        </div>

        <Row className="mb-4">
          <Col xs={12} className="text-end">
            <Button
              variant="outline"
              style={{ borderColor: "#B68E0C", color: "#B68E0C", fontWeight: 500 }}
              className="btn-outline-gold"
              onClick={() => handleOpenModal()}
            >
              Add Classroom
            </Button>
          </Col>
        </Row>

        <div className="table-responsive" style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table
            className={`border-0 rounded-3 overflow-hidden ${theme === "dark" ? "table-dark" : "table-light"}`}
            style={{ backgroundColor: "#fff", minWidth: "600px" }}
          >
            <thead style={{ background: theme === "dark" ? "#222" : "#f1f3f5", color: theme === "dark" ? "#fff" : "#333" }}>
              <tr>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  ID
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Room
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "120px" }}>
                  Type
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Capacity
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "200px" }}>
                  Equipment
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "100px" }}>
                  Status
                </th>
                <th className="px-4 py-3 text-center" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "transparent" }}>
              {classrooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center" style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    No classrooms found.
                  </td>
                </tr>
              ) : (
                classrooms.map((cls) => (
                  <tr
                    key={cls._id}
                    style={{
                      borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                      backgroundColor: "transparent"
                    }}
                  >
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{cls.location_id}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"} style={{ wordBreak: "break-all" }}>
                        {cls.location_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{cls.location_type}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{cls.capacity}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={theme === "dark" ? "text-white" : "text-black"}>{cls.equipment?.join(', ')}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${cls.isActive ? "#28a745" : "#6c757d"}`,
                          color: theme === "dark" ? "#fff" : "#333",
                          fontSize: "0.9rem"
                        }}
                      >
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center"
                          style={{
                            borderColor: "#B68E0C",
                            color: "#B68E0C",
                            fontWeight: 500
                          }}
                          onClick={() => handleOpenModal(cls)}
                        >
                          <Edit size={16} className="me-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center"
                          style={{
                            borderColor: "#B68E0C",
                            color: "#B68E0C",
                            fontWeight: 500
                          }}
                          onClick={() => handleShowManageModal(cls)}
                        >
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Edit/Add Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
            <Modal.Title>{editingClassroom ? 'Edit' : 'Add'} Classroom</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#333" }}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Location ID</Form.Label>
                <Form.Control
                  type="number"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Type</Form.Label>
                <Form.Control
                  type="text"
                  name="location_type"
                  value={formData.location_type}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Room Number</Form.Label>
                <Form.Control
                  type="text"
                  name="location_number"
                  value={formData.location_number}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Capacity</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Equipment (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={theme === "dark" ? "text-white" : "text-black"}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={theme === "dark" ? "bg-dark text-light border-dark" : "bg-white text-dark border-light"}
                  style={{ borderColor: theme === "dark" ? "#444" : "#ddd" }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ background: theme === "dark" ? "#222" : "#fff", borderColor: theme === "dark" ? "#444" : "#ddd" }}>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              style={{ borderColor: theme === "dark" ? "#fff" : "#333", color: theme === "dark" ? "#fff" : "#333" }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              style={{ borderColor: "#B68E0C", color: "#B68E0C" }}
              className="btn-outline-gold"
            >
              {editingClassroom ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Manage Classroom Modal */}
        <ManageClassroomModal
          show={showManageModal}
          classroom={selectedClassroom}
          onClose={handleCloseManageModal}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSaveSchedules={fetchClassrooms}
          theme={theme} // Pass theme to ensure consistent styling
        />
      </Container>
    </main>
  );
};

export default ClassroomManagement;