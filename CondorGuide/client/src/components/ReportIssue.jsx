import React, { useContext, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

const ReportIssue = () => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const categories = ['Facility', 'Technical', 'Security', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.category) errs.category = 'Please select a category.';
    if (!formData.priority) errs.priority = 'Please select a priority level.';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Submit to backend API
      console.log('Issue submitted:', formData);
      setSubmitted(true);
      setErrors({});
    }
  };

  const themeClasses = theme === 'light' ? 'bg-white text-dark' : 'bg-black text-white';

  return (
    <Container className={`py-5 ${themeClasses}`}>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className={`p-4 shadow ${themeClasses}`}>
            <h2 className="mb-4 text-center" style={{ color: '#e1c212' }}>Report an Issue</h2>
            {submitted && <Alert variant="success">Issue reported successfully!</Alert>}
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Form.Group className="mb-3">
                <Form.Label>Issue Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter issue title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Describe the issue"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    isInvalid={!!errors.category}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    isInvalid={!!errors.priority}
                  >
                    <option value="">Select Priority</option>
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.priority}</Form.Control.Feedback>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Upload Image (camera or gallery)</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="text-center">
                <Button
                  variant="dark"
                  type="submit"
                  className="px-5 py-2 fw-bold"
                  style={{ backgroundColor: '#e1c212', color: '#000', border: 'none' }}
                >
                  Submit
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportIssue;
