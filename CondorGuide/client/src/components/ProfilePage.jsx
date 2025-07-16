import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/info?email=${user.email}`);
      setProfile(res.data);
      setInitialProfile(res.data); // save fetched as initial
      setErrors({});
    } catch (err) {
      console.error(err);
      setErrors({ fetch: 'Failed to load profile.' });
    } finally {
      setSuccess(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchProfile();
  }, [user?.email]);

  const validate = (field, value) => {
    if (!value.trim() && ["firstName", "lastName", "email"].includes(field)) {
      return "Required";
    }
    if (field === "email" && !/\S+@\S+\.\S+/.test(value)) {
      return "Invalid email";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    const error = validate(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSave = async () => {
    const validationErrors = {};
    for (const field of ["firstName", "lastName", "email"]) {
      const error = validate(field, profile[field] || "");
      if (error) validationErrors[field] = error;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.put("http://localhost:5000/api/users/update-profile", profile);

      setEditing(false);
      setInitialProfile(profile);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setEditing(false);
    setErrors({});
  };

  if (!profile) {
    return (
      <Container className="my-4">
        <Alert variant="info">Loading profile…</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2>User Profile</h2>
      {success && <Alert variant="success">Profile updated successfully!</Alert>}
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={profile.firstName || ''}
                onChange={handleChange}
                disabled={!editing}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={profile.lastName || ''}
                onChange={handleChange}
                disabled={!editing}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email *</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={profile.email || ''}
            onChange={handleChange}
            disabled={!editing}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            disabled={!editing}
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Department/Faculty</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={profile.department || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Student/Employee ID</Form.Label>
              <Form.Control
                type="text"
                name="employeeId"
                value={profile.employeeId || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>User Type</Form.Label>
              <Form.Select
                name="userType"
                value={profile.userType || ''}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">Select</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Bio / Description (optional)</Form.Label>
          <Form.Control
            as="textarea"
            name="bio"
            rows={3}
            value={profile.bio || ''}
            onChange={handleChange}
            disabled={!editing}
          />
        </Form.Group>

        {!editing ? (
          <Button variant="primary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button variant="success" onClick={handleSave}>
              Save
            </Button>{" "}
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </Form>
    </Container>
  );
}
