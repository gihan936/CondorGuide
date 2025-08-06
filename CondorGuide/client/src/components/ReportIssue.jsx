import React, { useContext, useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Spinner,
  Tab,
  Tabs,
  Badge,
} from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";


const ReportIssue = () => {
  const { theme, fontSize } = useContext(ThemeContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [key, setKey] = useState("form");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    priority: "",
    image: null,
    location: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locations, setLocations] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    } else {
      fetchIssues();
      fetchLocations();
    }
  }, [isAuthenticated, navigate, location]);

  const fetchLocations = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/classrooms/locations`);
      setLocations(response.data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchIssues = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await axios.get(`${baseURL}/api/issues/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIssues(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setLoading(false);
    }
  };

  const categoryOptions = {
    "Facilities & Maintenance": [
      "Broken furniture (desks, chairs, benches)",
      "Damaged walls, ceilings, or floors",
      "Washroom maintenance issues",
      "Leaking pipes or water damage",
    ],
    "Lighting & Electrical": [
      "Flickering or broken lights",
      "Power outages in classrooms/hallways",
      "Exposed or faulty wiring",
      "Broken power outlets or switches",
    ],
    "HVAC & Air Quality": [
      "Classroom too hot or cold",
      "No air circulation or ventilation",
      "AC or heater not functioning",
      "Odour or smoke from vents",
    ],
    "Safety & Accessibility": [
      "Broken door handles or locks",
      "Inaccessible entryways or ramps",
      "Emergency exits blocked or non-functional",
      "Missing or damaged signage",
    ],
    "Cleanliness & Sanitation": [
      "Overflowing garbage bins",
      "Unclean washrooms",
      "Spills or stains in public areas",
      "Pest or rodent presence",
    ],
  };

  const priorities = ["Low", "Medium", "High", "Urgent"];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const toggleRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Sorry, your browser does not support voice input.");
      return;
    }

    if (!recognitionInstance) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recog = new SpeechRecognition();
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 1;

      recog.onstart = () => setIsRecording(true);
      recog.onerror = () => setIsRecording(false);
      recog.onend = () => setIsRecording(false);

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData((prev) => ({
          ...prev,
          description: prev.description
            ? `${prev.description} ${transcript}`
            : transcript,
        }));
      };

      setRecognitionInstance(recog);
      recog.start();
    } else {
      if (isRecording) {
        recognitionInstance.stop();
      } else {
        recognitionInstance.start();
      }
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required.";
    if (!formData.description.trim()) errs.description = "Description is required.";
    if (!formData.category) errs.category = "Please select a category.";
    if (!formData.subcategory) errs.subcategory = "Please select a subcategory.";
    if (!formData.priority) errs.priority = "Please select a priority level.";
    if (!formData.location.trim()) errs.location = "Location is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${baseURL}/api/issues`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubmitted(true);
        setFormErrors({});
        setFormData({
          title: "",
          description: "",
          category: "",
          subcategory: "",
          priority: "",
          image: null,
          location: "",
        });
        fetchIssues();
        setKey("dashboard");
      }
    } catch {
      setSubmitError("Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch(priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'warning';
      case 'Low': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Open': return 'warning';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'danger';
      case 'Pending': return 'warning';
      default: return 'light';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    return (
      (!statusFilter || issue.status === statusFilter) &&
      (!categoryFilter || issue.category === categoryFilter)
    );
  });

  const renderDashboard = () => (
    <div className="report-issue-dashboard">
      <div className="report-issue-filters-section">
        <Row className="mb-4">
          <Col md={6}>
            <div className="report-issue-filter-group">
              <label className="report-issue-filter-label">Filter by Status</label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="report-issue-filter-select"
              >
                <option value="">All Statuses</option>
                {["Open", "In Progress", "Resolved", "Closed"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Col>
          <Col md={6}>
            <div className="report-issue-filter-group">
              <label className="report-issue-filter-label">Filter by Category</label>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="report-issue-filter-select"
              >
                <option value="">All Categories</option>
                {Object.keys(categoryOptions).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Col>
        </Row>
      </div>

      <div className="report-issue-stats">
        <Row className="mb-4">
          <Col md={3}>
            <div className="report-issue-stat-card">
              <div className="report-issue-stat-number">{issues.length}</div>
              <div className="report-issue-stat-label">Total Issues</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="report-issue-stat-card">
              <div className="report-issue-stat-number">
                {issues.filter(i => i.status === 'Open').length}
              </div>
              <div className="report-issue-stat-label">Open Issues</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="report-issue-stat-card">
              <div className="report-issue-stat-number">
                {issues.filter(i => i.status === 'In Progress').length}
              </div>
              <div className="report-issue-stat-label">In Progress</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="report-issue-stat-card">
              <div className="report-issue-stat-number">
                {issues.filter(i => i.status === 'Resolved').length}
              </div>
              <div className="report-issue-stat-label">Resolved</div>
            </div>
          </Col>
        </Row>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="report-issue-empty-state">   
          <h3>No Issues Found</h3>
          <p>You haven't reported any issues yet or no issues match your filters.</p>
          <Button 
            className="report-issue-cta-button" 
            onClick={() => setKey("form")}
          >
            Report Your First Issue
          </Button>
        </div>
      ) : (
        <div className="report-issue-grid">
          {filteredIssues.map((issue) => (
            <Card key={issue._id} className="report-issue-card">
              <div className="report-issue-card-header">
                <div className="report-issue-card-badges">
                  <Badge 
                    bg={getStatusBadgeVariant(issue.status)}
                    className="report-issue-status-badge"
                  >
                    {issue.status}
                  </Badge>
                  <Badge 
                    bg={getPriorityBadgeVariant(issue.priority)}
                    className="report-issue-priority-badge"
                  >
                    {issue.priority}
                  </Badge>
                </div>
              </div>
              
              <Card.Body className="report-issue-card-body">
                {issue.image && (
                  <div className="report-issue-image-container">
                    <img
                      src={issue.image}
                      alt="Issue"
                      className="report-issue-image"
                      onError={(e) => {
                        console.error("Image failed to load:", issue.image);
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                
                <div className="report-issue-card-content">
                  <h3 className="report-issue-card-title">{issue.title}</h3>
                  <div className="report-issue-category-info">
                    <span className="report-issue-category">{issue.category}</span>
                    <span className="report-issue-subcategory"> → {issue.subcategory}</span>
                  </div>
                  
                  <div className="report-issue-details">
                    <div className="report-issue-detail-item">
                      <span className="report-issue-detail-text">{issue.location}</span>
                    </div>
                    <div className="report-issue-detail-item">
                      <span className="report-issue-detail-text">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="report-issue-loading">
        <Spinner animation="border" className="report-issue-spinner" />
        <p>Loading your issues...</p>
      </div>
    );
  }

  return (
    <div className={`report-issue-container ${theme} font-${fontSize}`}>
      <Container className="report-issue-main">
        <div className="report-issue-header">
          <h1 className="report-issue-page-title">Issue Management</h1>
          <p className="report-issue-page-subtitle">Report and track facility issues efficiently</p>
        </div>

        <Tabs 
          activeKey={key} 
          onSelect={(k) => setKey(k)} 
          className="report-issue-tabs" 
          fill
        >
          <Tab eventKey="form" title={
            <span className="report-issue-tab-content">
              Report Issue
            </span>
          }>
            <div className="report-issue-form-section">
              <Card className="report-issue-form-card">
                <Card.Header className="report-issue-form-header">
                  <h2 className="report-issue-form-title">Report New Issue</h2>
                  <p className="report-issue-form-subtitle">
                    Help us maintain our facilities by reporting any issues you encounter
                  </p>
                </Card.Header>

                <Card.Body className="report-issue-form-body">
                  {submitted && (
                    <Alert variant="success" className="report-issue-success-alert">
                      <strong>Success!</strong> Your issue has been reported successfully and will be reviewed shortly.
                    </Alert>
                  )}
                  {submitError && (
                    <Alert variant="danger" className="report-issue-error-alert">
                      <strong>Error!</strong> {submitError}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="report-issue-form">
                    <div className="report-issue-form-group">
                      <Form.Label className="report-issue-label">
                        Issue Title
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief description of the issue"
                        className="report-issue-input"
                        isInvalid={!!formErrors.title}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.title}
                      </Form.Control.Feedback>
                    </div>

                    <div className="report-issue-form-group">
                      <Form.Label className="report-issue-label">
                        Description
                      </Form.Label>
                      <div className="report-issue-description-container">
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Provide detailed information about the issue"
                          className="report-issue-textarea"
                          isInvalid={!!formErrors.description}
                        />
                        <Button
                          type="button"
                          onClick={toggleRecording}
                          className={`report-issue-voice-btn ${isRecording ? 'recording' : ''}`}
                          aria-label="Toggle voice input"
                        >
                          🎤
                        </Button>
                      </div>
                      {isRecording && (
                        <div className="report-issue-recording-indicator">
                          <span className="report-issue-pulse"></span>
                          Listening... speak now
                        </div>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {formErrors.description}
                      </Form.Control.Feedback>
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="report-issue-form-group">
                          <Form.Label className="report-issue-label">
                            Main Category
                          </Form.Label>
                          <Form.Select
                            name="category"
                            value={formData.category}
                            onChange={(e) => {
                              handleInputChange(e);
                              setFormData((prev) => ({ ...prev, subcategory: "" }));
                            }}
                            className="report-issue-select"
                            isInvalid={!!formErrors.category}
                          >
                            <option value="">Select Main Category</option>
                            {Object.keys(categoryOptions).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.category}
                          </Form.Control.Feedback>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="report-issue-form-group">
                          <Form.Label className="report-issue-label">
                            Subcategory
                          </Form.Label>
                          <Form.Select
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                            disabled={!formData.category}
                            className="report-issue-select"
                            isInvalid={!!formErrors.subcategory}
                          >
                            <option value="">Select Subcategory</option>
                            {categoryOptions[formData.category]?.map((sub, idx) => (
                              <option key={idx} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.subcategory}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="report-issue-form-group">
                          <Form.Label className="report-issue-label">
                            Priority Level
                          </Form.Label>
                          <Form.Select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="report-issue-select"
                            isInvalid={!!formErrors.priority}
                          >
                            <option value="">Select Priority</option>
                            {priorities.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.priority}
                          </Form.Control.Feedback>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="report-issue-form-group">
                          <Form.Label className="report-issue-label">
                            Location
                          </Form.Label>
                          <Form.Select
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="report-issue-select"
                            isInvalid={!!formErrors.location}
                          >
                            <option value="">Select Location</option>
                            {locations.map((loc, i) => (
                              <option key={i} value={loc.location_name}>
                                {loc.location_name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.location}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>

                    <div className="report-issue-form-group">
                      <Form.Label className="report-issue-label">
                        Upload Image (Optional)
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="report-issue-file-input"
                      />
                      <small className="report-issue-help-text">
                        Upload a photo to help us understand the issue better
                      </small>
                    </div>

                    <div className="report-issue-submit-section">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="report-issue-submit-btn"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Report
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="dashboard" title={
            <span className="report-issue-tab-content">
              Issue History
            </span>
          }>
            {renderDashboard()}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default ReportIssue;