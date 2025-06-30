import React, { useContext, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';


const ReportIssue = () => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: '',
    image: null,
<<<<<<< Updated upstream
    location: '',
=======
    location: '', // Location field added
>>>>>>> Stashed changes
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const handleInputChange = e => {
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
    if (!formData.subcategory) errs.subcategory = 'Please select a subcategory.';
    if (!formData.priority) errs.priority = 'Please select a priority level.';
<<<<<<< Updated upstream
    if (!formData.location.trim()) errs.location = 'Location number is required.';
    return errs;
  };

const handleSubmit = async e => {
  e.preventDefault();
  const validationErrors = validateForm();
  
  if (Object.keys(validationErrors).length > 0) {
    setFormErrors(validationErrors);
    return;
  }
=======
    if (!formData.location.trim()) errs.location = 'Location number is required.'; 
    return errs;
  };

  const handleSubmit = async e => {
  e.preventDefault();
  const errs = validateForm();
  if (Object.keys(errs).length) return setErrors(errs);

  const data = new FormData();
  // Append all fields including the image
  data.append('title', formData.title);
  data.append('description', formData.description);
  data.append('category', formData.category);
  data.append('subcategory', formData.subcategory);
  data.append('priority', formData.priority);
  data.append('location', formData.location);
  if (formData.image) {
    data.append('image', formData.image);
  }

  try {
    const response = await fetch('http://localhost:5000/api/issues', {
      method: 'POST',
      body: data,
      // Don't set Content-Type header - let the browser set it with the correct boundary
    });

    const resJson = await response.json();
    
    if (response.ok) {
      setSubmitted(true);
      setErrors({});
    } else {
      setErrors({ submit: resJson.message || 'Submission failed' });
    }
  } catch (err) {
    console.error('Network or server error:', err);
    setErrors({ submit: 'Network or server error' });
  }
};

>>>>>>> Stashed changes

  setIsSubmitting(true);
  setSubmitError('');

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('subcategory', formData.subcategory);
    formDataToSend.append('priority', formData.priority);
    formDataToSend.append('location', formData.location);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    
    const response = await axios.post(`${baseURL}/api/issues`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
      // Remove withCredentials since we're not using auth
    });

    if (response.data.success) {
      setSubmitted(true);
      setFormErrors({});
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        priority: '',
        image: null,
        location: '',
      });
    }
  } catch (error) {
    console.error('Full error:', error);
    console.error('Error response:', error.response);
    setSubmitError(
      error.response?.data?.message || 
      error.message || 
      'Failed to submit issue. Please try again.'
    );
  } finally {
    setIsSubmitting(false);
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
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Form onSubmit={handleSubmit} encType="multipart/form-data">

              <Form.Group className="mb-3">
                <Form.Label>Issue Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter issue title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.title}
                />
                <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Describe the issue"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.description}
                />
                <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Main Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={e => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, subcategory: '' }));
                    }}
                    isInvalid={!!formErrors.category}
                  >
                    <option value="">Select Main Category</option>
                    {Object.keys(categoryOptions).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.category}</Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Subcategory</Form.Label>
                  <Form.Select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                    isInvalid={!!formErrors.subcategory}
                  >
                    <option value="">Select Subcategory</option>
                    {categoryOptions[formData.category]?.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.subcategory}</Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.priority}
                  >
                    <option value="">Select Priority</option>
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.priority}</Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Location Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location number (e.g., Room 204)"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.location}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.location}</Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Location Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location number (e.g., Room 204)"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    isInvalid={!!errors.location}
                  />
                  <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Upload Image (camera or gallery)</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <div className="text-center">
                <Button
                  variant="dark"
                  type="submit"
                  className="px-5 py-2 fw-bold"
                  style={{ backgroundColor: '#e1c212', color: '#000', border: 'none' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
