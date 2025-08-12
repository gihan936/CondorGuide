import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import {
  Form, Button, Card, Container, Row, Col, Alert, ProgressBar, InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import zxcvbn from "zxcvbn";
import { FaEye, FaEyeSlash } from "react-icons/fa";


// Animation variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.15, duration: 0.4 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const titleVariants = { hidden: { opacity: 0, y: -15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function ProfilePage() {
  const { theme } = useContext(ThemeContext);
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/info?email=${user.email}`);
      setProfile(res.data);
      setInitialProfile(res.data);
      setErrors({});
    } catch {
      setErrors({ fetch: "Failed to load profile." });
    } finally {
      setSuccess(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchProfile();
  }, [user?.email]);

  const validate = (field, value) => {
    if (!value.trim() && ["firstName", "lastName", "email"].includes(field)) return "Required";
    if (field === "email" && !/\S+@\S+\.\S+/.test(value)) return "Invalid email";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
  };

  const handleSave = async () => {
    const validationErrors = {};
    for (const field of ["firstName", "lastName", "email"]) {
      const error = validate(field, profile[field] || "");
      if (error) validationErrors[field] = error;
    }
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/update-profile`, profile);
      setEditing(false);
      setInitialProfile(profile);
      setSuccess(true);
    } catch {
      alert("Failed to save profile");
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setEditing(false);
    setErrors({});
  };

  // Security state
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
    if (newPassword !== confirmPassword) return setSecError("New password and confirmation do not match.");
    if (currentPassword === newPassword) return setSecError("New password must be different from current password.");

    setSecLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to change password");
      setSecMessage("Password changed successfully. Please check your email for confirmation.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setSecError(err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const strengthVariant = (score) => ["danger", "danger", "warning", "info", "success"][score] || "danger";

  if (!profile) {
    return (
      <Container className="my-5">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Alert variant="info" className={`rounded-3 border-0 text-center alert-custom-${themeClass}`}>
            Loading profile…
          </Alert>
        </motion.div>
      </Container>
    );
  }

  return (
    <main className={`py-5 profile-page ${themeClass}`}>
      <Container className="my-5">
        <motion.div variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-5">
          <h1 className={`profile-title ${theme === "dark" ? "text-white" : "text-dark"}`}>
            Your <span className="profile-highlight">Profile</span>
          </h1>
          <p className={`profile-subtitle ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Update your personal details and secure your account.
          </p>
        </motion.div>

        <Row className="justify-content-center">
          <Col lg={8}>
            {success && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Alert variant="success" className={`rounded-3 border-0 text-center alert-custom-${themeClass}`}>
                  Profile updated successfully!
                </Alert>
              </motion.div>
            )}

            {/* Profile Info */}
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className={`p-4 mb-5 border-0 rounded-3 profile-card ${theme === "dark" ? "profile-card-dark" : ""}`}>
                <Card.Body>
                  <motion.h3 variants={titleVariants} className={`profile-heading ${theme === "dark" ? "text-white" : "text-dark"}`}>
                    Personal Information
                  </motion.h3>
                  <Form>
                    <Row className="g-3">
                      {["firstName", "lastName", "email", "phone", "bio"].map((field, idx) => (
                        <Col key={field} md={idx < 2 ? 6 : 12}>
                          <motion.div variants={itemVariants}>
                            <Form.Group>
                              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                                {field === "bio" ? "Bio (optional)" : field.charAt(0).toUpperCase() + field.slice(1)}{["firstName", "lastName", "email"].includes(field) ? " *" : ""}
                              </Form.Label>
                              <Form.Control
                                as={field === "bio" ? "textarea" : "input"}
                                rows={field === "bio" ? 3 : undefined}
                                type={field === "email" ? "email" : "text"}
                                name={field}
                                value={profile[field] || ""}
                                onChange={handleChange}
                                disabled={!editing}
                                isInvalid={!!errors[field]}
                                className={`rounded-3 profile-input ${errors[field] ? "profile-input-error" : ""}`}
                              />
                              <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
                            </Form.Group>
                          </motion.div>
                        </Col>
                      ))}
                    </Row>
                    <motion.div variants={itemVariants} className="d-flex gap-2 mt-4">
                      {!editing ? (
                        <Button variant="outline-primary" onClick={() => setEditing(true)} className="rounded-3 fw-medium btn-outline-gold">Edit</Button>
                      ) : (
                        <>
                          <Button variant="outline-primary" onClick={handleSave} className="rounded-3 fw-medium btn-outline-gold">Save</Button>
                          <Button variant="outline-secondary" onClick={handleCancel} className="rounded-3 fw-medium btn-outline-secondary-custom">Cancel</Button>
                        </>
                      )}
                    </motion.div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className={`p-4 border-0 rounded-3 profile-card ${theme === "dark" ? "profile-card-dark" : ""}`}>
                <Card.Body>
                  <motion.h3 variants={titleVariants} className={`profile-heading ${theme === "dark" ? "text-white" : "text-dark"}`}>
                    Security Settings
                  </motion.h3>
                  <motion.p variants={itemVariants} className={theme === "dark" ? "text-light" : "text-muted"}>
                    Change your password below. A confirmation email will be sent upon success.
                  </motion.p>
                  <motion.p variants={itemVariants} className={theme === "dark" ? "text-light" : "text-muted"}>
                    Forgot your password?{" "}
                    <a href="/forgot-password" style={{ color: "#B68E0C" }}>Reset it here</a>.
                  </motion.p>

                  {secMessage && (
                    <motion.div variants={itemVariants}>
                      <Alert variant="success" className={`rounded-3 border-0 text-center alert-custom-${themeClass}`}>{secMessage}</Alert>
                    </motion.div>
                  )}
                  {secError && (
                    <motion.div variants={itemVariants}>
                      <Alert variant="danger" className={`rounded-3 border-0 text-center alert-custom-${themeClass}`}>{secError}</Alert>
                    </motion.div>
                  )}

                  <Form onSubmit={handlePasswordChange}>
                    {[
                      { label: "Current Password", state: currentPassword, setState: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
                      { label: "New Password", state: newPassword, setState: setNewPassword, show: showNew, setShow: setShowNew, showStrength: true },
                      { label: "Confirm New Password", state: confirmPassword, setState: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
                    ].map((field, idx) => (
                      <motion.div key={idx} variants={itemVariants}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>{field.label}</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={field.show ? "text" : "password"}
                              placeholder={field.label}
                              value={field.state}
                              onChange={(e) => field.setState(e.target.value)}
                              required
                              className="rounded-3 profile-input"
                            />
                            <Button variant="outline-secondary" onClick={() => field.setShow(!field.show)} className="rounded-3" style={{ color: "#B68E0C" }}>
                              {field.show ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                          {field.showStrength && newPassword && (
                            <>
                              <ProgressBar className="mt-2 rounded-3 password-strength" now={(passwordStrength.score + 1) * 20} variant={strengthVariant(passwordStrength.score)} label={passwordStrength.score >= 3 ? "Strong" : "Weak"} />
                              <div className="password-feedback">{passwordStrength.feedback.suggestions.join(" ")}</div>
                            </>
                          )}
                        </Form.Group>
                      </motion.div>
                    ))}
                    <motion.div variants={itemVariants}>
                      <Button type="submit" variant="outline-primary" disabled={secLoading} className="rounded-3 fw-medium btn-outline-gold">
                        {secLoading ? "Changing..." : "Change Password"}
                      </Button>
                    </motion.div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
