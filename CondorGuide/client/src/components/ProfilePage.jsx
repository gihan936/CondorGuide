import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  ProgressBar,
  InputGroup,
} from "react-bootstrap";
import zxcvbn from "zxcvbn";

export default function ProfilePage() {
  const { theme } = useContext(ThemeContext);
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const themeClasses =
    theme === "light" ? "bg-white text-dark" : "bg-black text-white";

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/info?email=${user.email}`
      );
      setProfile(res.data);
      setInitialProfile(res.data);
      setErrors({});
    } catch (err) {
      console.error(err);
      setErrors({ fetch: "Failed to load profile." });
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
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/update-profile`,
        profile
      );

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

  // 👇 Security section state & logic
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secMessage, setSecMessage] = useState(null);
  const [secError, setSecError] = useState(null);
  const [secLoading, setSecLoading] = useState(false);

  const passwordStrength = zxcvbn(newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSecError(null);
    setSecMessage(null);

    if (newPassword !== confirmPassword) {
      setSecError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setSecError("New password must be different from current password.");
      return;
    }

    setSecLoading(true);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message || "Failed to change password");
      }

      setSecMessage(
        "Password changed successfully."
 + " Please check your email for confirmation."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSecError(err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const strengthVariant = (score) => {
    switch (score) {
      case 0:
      case 1:
        return "danger";
      case 2:
        return "warning";
      case 3:
        return "info";
      case 4:
        return "success";
      default:
        return "danger";
    }
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
      {success && <Alert variant="success">Profile updated successfully!</Alert>}
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Profile Info Card */}
          <Card className={`p-4 shadow mb-4 ${themeClasses}`}>
            <h3 className="mb-3">User Profile</h3>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={profile.firstName || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      isInvalid={!!errors.firstName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={profile.lastName || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      isInvalid={!!errors.lastName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bio / Description (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  name="bio"
                  rows={3}
                  value={profile.bio || ""}
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
          </Card>

          <Card className={`p-4 shadow ${themeClasses}`}>
            <h3 className="mb-3">Security Settings</h3>

            <p>You can change your password here. After a successful change, you will receive a confirmation email.</p>

 <p>
              Forgot your password? <a href="/forgot-password">Reset it here</a>.
            </p>

            {secMessage && <Alert variant="success">{secMessage}</Alert>}
            {secError && <Alert variant="danger">{secError}</Alert>}

            <Form onSubmit={handlePasswordChange}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? "Hide" : "Show"}
                  </Button>
                </InputGroup>
                {newPassword && (
                  <>
                    <ProgressBar
                      className="mt-2"
                      now={(passwordStrength.score + 1) * 20}
                      variant={strengthVariant(passwordStrength.score)}
                      label={
                        passwordStrength.score >= 3 ? "Strong" : "Weak"
                      }
                    />
                    <div className="text-muted mt-1">
                      {passwordStrength.feedback.suggestions.join(" ")}
                    </div>
                  </>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button type="submit" variant="primary" disabled={secLoading}>
                {secLoading ? "Changing..." : "Change Password"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
