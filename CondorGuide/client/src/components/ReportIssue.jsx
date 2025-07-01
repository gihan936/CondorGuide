import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportIssue = () => {
  const { theme } = useContext(ThemeContext);
  const {  isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: '',
    image: null,
    location: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, navigate, location]);

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
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${baseURL}/api/issues`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
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
      console.error('Error:', error);
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

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center ${themeClasses}`} style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className={`py-5 ${themeClasses}`}>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className={`p-4 shadow ${themeClasses}`}>
            <h2 className="mb-4 text-center" style={{ color: '#e1c212' }}>Report an Issue </h2>
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
