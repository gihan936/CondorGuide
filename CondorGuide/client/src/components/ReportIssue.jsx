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
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, currentUser } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    } else {
      fetchIssues();
    }
  }, [isAuthenticated]);

  const fetchIssues = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const token = localStorage.getItem("token");

      const response = await axios.get(`${baseURL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userIssues = response.data.data.filter(
        (issue) => issue.createdBy?._id === currentUser?._id
      );

      setIssues(userIssues);
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

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required.";
    if (!formData.description.trim())
      errs.description = "Description is required.";
    if (!formData.category) errs.category = "Please select a category.";
    if (!formData.subcategory)
      errs.subcategory = "Please select a subcategory.";
    if (!formData.priority) errs.priority = "Please select a priority level.";
    if (!formData.location.trim())
      errs.location = "Location number is required.";
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
    } catch (error) {
      console.error("Error:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit issue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeClasses =
    theme === "light" ? "bg-white text-dark" : "bg-black text-white";

  const filteredIssues = issues.filter((issue) => {
    return (
      (!statusFilter || issue.status === statusFilter) &&
      (!categoryFilter || issue.category === categoryFilter)
    );
  });

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Handle different path formats
    let cleanPath = imagePath;
    if (imagePath.startsWith("uploads/")) {
      cleanPath = imagePath;
    } else if (imagePath.startsWith("/uploads/")) {
      cleanPath = imagePath.slice(1);
    } else if (!imagePath.includes("uploads/")) {
      cleanPath = `uploads/${imagePath.replace(/^\/+/, "")}`;
    }

    const fullUrl = `${baseURL}/${cleanPath}`;
    console.log("Image URL constructed:", fullUrl);
    return fullUrl;
  };

  const renderDashboard = () => (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Filter by Status</option>
            {["Open", "In Progress", "Resolved", "Closed"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Filter by Category</option>
            {Object.keys(categoryOptions).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {filteredIssues.length === 0 ? (
        <Alert variant="info" className="text-center">
          You haven't reported any issues yet.
        </Alert>
      ) : (
        filteredIssues.map((issue) => (
          <Card key={issue._id} className={`mb-3 ${themeClasses} shadow`}>
            <Card.Body>
              <Card.Title>
                {issue.title} <Badge bg="secondary">{issue.status}</Badge>
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {issue.category} ➝ {issue.subcategory}
              </Card.Subtitle>
              <Card.Text>
                <strong>Priority:</strong> {issue.priority}
                <br />
                <strong>Location:</strong> {issue.location}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(issue.createdAt).toLocaleString()}
                <br />
                {issue.image && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(issue.image)}
                      alt="Issue"
                      style={{
                        maxWidth: "200px",
                        height: "auto",
                        borderRadius: "0.5rem",
                        maxHeight: "300px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          getImageUrl(issue.image)
                        );
                        e.target.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(
                          "Image loaded successfully:",
                          getImageUrl(issue.image)
                        );
                      }}
                    />
                  </div>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div
        className={`d-flex justify-content-center align-items-center ${themeClasses}`}
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className={`py-5 ${themeClasses}`}>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4" fill>
        <Tab eventKey="form" title="Report Issue">
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className={`p-4 shadow ${themeClasses}`}>
                <h2 className="mb-4 text-center" style={{ color: "#e1c212" }}>
                  Report an Issue
                </h2>
                {submitted && (
                  <Alert variant="success">Issue reported successfully!</Alert>
                )}
                {submitError && <Alert variant="danger">{submitError}</Alert>}
                <Form onSubmit={handleSubmit} encType="multipart/form-data">
                  {/* TITLE */}
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
                    <Form.Control.Feedback type="invalid">
                      {formErrors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* DESCRIPTION */}
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
                    <Form.Control.Feedback type="invalid">
                      {formErrors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* CATEGORY & SUBCATEGORY */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Main Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={(e) => {
                          handleInputChange(e);
                          setFormData((prev) => ({ ...prev, subcategory: "" }));
                        }}
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
                          <option key={idx} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.subcategory}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  {/* PRIORITY & LOCATION */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
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
                    </Col>

                    <Col md={6}>
                      <Form.Label>Location Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter location number (e.g., 2A204)"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.location}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.location}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  {/* IMAGE */}
                  <Form.Group className="mb-4">
                    <Form.Label>Upload Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <div className="text-center">
                    <Button
                      variant="dark"
                      type="submit"
                      className="px-5 py-2 fw-bold"
                      style={{
                        backgroundColor: "#e1c212",
                        color: "#000",
                        border: "none",
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="dashboard" title="Complaint History">
          {renderDashboard()}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ReportIssue;
