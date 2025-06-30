import React, { useContext, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

const ReportIssue = () => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: '',
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const categoryOptions = {
    'Facilities & Maintenance': [
      'Broken furniture (desks, chairs, benches)',
      'Damaged walls, ceilings, or floors',
      'Washroom maintenance issues',
      'Leaking pipes or water damage',
    ],
    'Lighting & Electrical': [
      'Flickering or broken lights',
      'Power outages in classrooms/hallways',
      'Exposed or faulty wiring',
      'Broken power outlets or switches',
    ],
    'HVAC & Air Quality': [
      'Classroom too hot or cold',
      'No air circulation or ventilation',
      'AC or heater not functioning',
      'Odour or smoke from vents',
    ],
    'Safety & Accessibility': [
      'Broken door handles or locks',
      'Inaccessible entryways or ramps',
      'Emergency exits blocked or non-functional',
      'Missing or damaged signage',
    ],
    'Cleanliness & Sanitation': [
      'Overflowing garbage bins',
      'Unclean washrooms',
      'Spills or stains in public areas',
      'Pest or rodent presence',
    ],
  };

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.category) errs.category = 'Please select a category.';
    if (!formData.subcategory) errs.subcategory = 'Please select a subcategory.';
    if (!formData.priority) errs.priority = 'Please select a priority level.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const response = await fetch('http://localhost:5000/api/issues/report', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitted(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        priority: '',
        image: null,
      });
      setErrors({});
    } catch (error) {
      alert('Failed to submit the issue. Please try again.');
    }
  };

  const themeClasses = theme === 'light' ? 'bg-white text-dark' : 'bg-black text-white';

  return (
    <Container className={`py-5 ${themeClasses}`}>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className={`p-4 shadow ${themeClasses}`}>
            <h2 className="mb-4 text-center" style={{ color: '#e1c212' }}>
              Report an Issue
            </h2>
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
                  <Form.Label>Main Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => ({ ...prev, subcategory: '' }));
                    }}
                    isInvalid={!!errors.category}
                  >
                    <option value="">Select Main Category</option>
                    {Object.keys(categoryOptions).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Subcategory</Form.Label>
                  <Form.Select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    disabled={!formData.category}
                    isInvalid={!!errors.subcategory}
                  >
                    <option value="">Select Subcategory</option>
                    {categoryOptions[formData.category]?.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.subcategory}</Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    isInvalid={!!errors.priority}
                  >
                    <option value="">Select Priority</option>
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
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
