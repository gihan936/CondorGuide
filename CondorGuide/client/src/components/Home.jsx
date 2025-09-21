import React, { useContext } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { motion as Motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

import bannerBg from "../assets/banner.jpg";
import mapImg from "../assets/map.jpg";
import classroomsImg from "../assets/classrooms.jpg";
import issuesImg from "../assets/issues.jpg";
import securityImg from "../assets/security.jpg";

const enhancedFeatures = [
  {
    title: "Interactive Campus Map",
    text: "Navigate your campus with ease using our AI-powered interactive map with real-time updates and personalized routes.",
    detailedFeatures: [
      "Real-time location tracking",
      "Building information & hours",
      "Accessibility routes",
      "Points of interest"
    ],
    image: mapImg,
    link: "/map",
    category: "Navigation",
    icon: "fas fa-map-marked-alt",
    color: "primary",
    stats: { users: "2.3K+", rating: "4.9" }
  },
  {
    title: "Smart Classroom Finder",
    text: "Easily check real-time availability of classrooms, study spaces, and labs with advanced booking and instant notification features.",
    detailedFeatures: [
      "Live availability status",
      "Advanced booking system",
      "Capacity & amenities info",
      "Smart notifications"
    ],
    image: classroomsImg,
    link: "/classrooms",
    category: "Academic",
    icon: "fas fa-chalkboard-teacher",
    color: "success",
    stats: { users: "1.8K+", rating: "4.7" }
  },
  {
    title: "Campus Issue Reporter",
    text: "Easily report campus issues by uploading photos, setting priority levels, and receiving real-time status updates from campus administration",
    detailedFeatures: [
      "Photo & video uploads",
      "Priority classification",
      "Status tracking",
      "Admin feedback system"
    ],
    image: issuesImg,
    link: "/issues",
    category: "Support",
    icon: "fas fa-exclamation-triangle",
    color: "warning",
    stats: { users: "950+", rating: "4.5" }
  },
  {
    title: "Emergency Security Hub",
    text: "Access emergency contacts, raise instant alarms, and connect with campus security through our comprehensive safety platform.",
    detailedFeatures: [
      "One-tap emergency alerts",
      "Live security contact",
      "Location sharing",
      "Safety escort requests"
    ],
    image: securityImg,
    link: "/security",
    category: "Safety",
    icon: "fas fa-shield-alt",
    color: "danger",
    stats: { users: "3.1K+", rating: "5.0" }
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      when: "beforeChildren", 
      staggerChildren: 0.15,
      duration: 0.6
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.7,
      ease: [0.25, 0.25, 0.25, 0.75]
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const bannerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1.2, ease: "easeOut" }
  }
};

const Home = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <main className={theme === "dark" ? "home-dark" : "home-light"}>
      <div className="home-banner-section" style={{
          backgroundImage: `url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "70vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}>
        

        <div className="banner-overlay" style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem"
        }}>
          
          <Motion.div
            className="text-center text-white banner-content"
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            style={{
              position: "relative",
              zIndex: 2,
              margin: "auto"
            }}
          >
            <h1 className="display-3 banner-text mb-4">
              Welcome to 
              <span className="text-gold"> Condor Guide</span>
            </h1>
            <p className="lead banner-lead mb-4 mx-auto">
              Your intelligent companion designed to transform campus life through smart navigation, 
              real-time updates, and comprehensive safety features.
            </p>
            <div className="banner-buttons">
              <Button 
                href="/map" 
                variant="gold" 
                size="lg" 
                className="me-3 px-5 py-3 fw-bold banner-btn-primary"
              >
                <i className="fas fa-compass me-2"></i>
                Explore Campus
              </Button>
            </div>
          </Motion.div>
        </div>
        
        <Motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: "absolute",
            bottom: "0.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2
          }}
        >
          <div className="scroll-arrow">
            <i className="fas fa-chevron-down"></i>
          </div>
        </Motion.div>
      </div>

      <Container className="my-5 py-5">
        <Motion.div 
          className="text-center mb-5"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className={`display-5 fw-bold mb-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Everything You Need for
            <span className="text-gold"> Campus Success</span>
          </h2>
          <p className={`lead ${theme === "dark" ? "text-light" : "text-muted"} mx-auto`}>
            Discover our comprehensive suite of tools designed to enhance your campus experience
          </p>
        </Motion.div>

        <Motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row className="g-4">
            {enhancedFeatures.map((feature, i) => (
              <Col key={i} md={6} lg={3}>
                <Motion.a 
                  href={feature.link} 
                  className="card-link text-decoration-none" 
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className={`enhanced-feature-card h-100 ${theme === "dark" ? "card-dark" : "card-light"}`}>
                    <div className="card-image-container">
                      <Card.Img 
                        variant="top" 
                        src={feature.image} 
                        alt={feature.title} 
                        className="enhanced-card-img" 
                      />
                    </div>

                    <Card.Body className="p-4">
                      <div className="card-header-section mb-3">
                        <Badge variant="outline" className="subtitle-badge mb-2">
                          {feature.subtitle}
                        </Badge>
                        <Card.Title className="fw-bold text-gold mb-2 card-title-enhanced">
                          {feature.title}
                        </Card.Title>
                        <Card.Text className={`${theme === "dark" ? "text-light" : "text-muted"} mb-3`}>
                          {feature.text}
                        </Card.Text>
                      </div>

                      <div className="features-list mb-3">
                        {feature.detailedFeatures.map((item, idx) => (
                          <div key={idx} className="feature-item">
                            <i className="fas fa-check-circle text-gold me-2"></i>
                            <span className={`${theme === "dark" ? "text-light" : "text-muted"} small`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline-gold" 
                        className="w-100 fw-semibold action-btn"
                        size="sm"
                      >
                        Explore Feature
                        <i className="fas fa-arrow-right ms-2"></i>
                      </Button>
                    </Card.Body>
                  </Card>
                </Motion.a>
              </Col>
            ))}
          </Row>
        </Motion.div>
      </Container>

      <Container className="my-5 py-5">
        <Motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Row className="justify-content-center">
              <div className="about-section-enhanced">
                <h2 className={`display-6 fw-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Empowering Campus Life Through
                  <span className="text-gold"> Smart Technology</span>
                </h2>
                <p className={`lead mb-4 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                  Condor Guide is more than just a campus app – it's your comprehensive companion designed 
                  to transform how students and faculty interact with campus resources, ensuring safety, 
                  efficiency, and enhanced learning experiences.
                </p>
                
                <Row className="benefits-row g-4 my-5">
                  <Col md={4}>
                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <i className="fas fa-mobile-alt text-gold"></i>
                      </div>
                      <h5 className={`mt-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Mobile First
                      </h5>
                      <p className={`small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                        Optimized for mobile devices with offline capabilities
                      </p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <i className="fas fa-lock text-gold"></i>
                      </div>
                      <h5 className={`mt-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Secure & Private
                      </h5>
                      <p className={`small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                        Your data is protected with enterprise-grade security
                      </p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="benefit-item">
                      <div className="benefit-icon">
                        <i className="fas fa-rocket text-gold"></i>
                      </div>
                      <h5 className={`mt-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Always Improving
                      </h5>
                      <p className={`small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                        Regular updates based on user feedback and needs
                      </p>
                    </div>
                  </Col>
                </Row>

                {/* CTA Section */}
                <div className="cta-section mt-5">
                  <Button href="/signup" variant="gold" size="lg" className="me-3 px-4 py-3 fw-semibold">
                    Get Started Today
                    <i className="fas fa-rocket ms-2"></i>
                  </Button>
                </div>
              </div>
          </Row>
        </Motion.div>
      </Container>

      <Container className="my-5 py-5">
        <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-5">
            <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
              What Students Say
            </h2>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <div className={`testimonial-card p-4 h-100 ${theme === "dark" ? "bg-dark" : "bg-light"}`}>
                <div className="testimonial-stars mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-3`}>
                  "Condor Guide has completely transformed how I navigate campus. The real-time classroom 
                  availability feature saved me countless hours!"
                </p>
                <div className="testimonial-author">
                  <strong className={theme === "dark" ? "text-white" : "text-black"}>
                    Sarah Johnson
                  </strong>
                  <small className={`d-block ${theme === "dark" ? "text-light" : "text-muted"}`}>
                    Computer Science Student
                  </small>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className={`testimonial-card p-4 h-100 ${theme === "dark" ? "bg-dark" : "bg-light"}`}>
                <div className="testimonial-stars mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-3`}>
                  "The security features give me peace of mind, especially during late-night study sessions. 
                  It's like having campus security in my pocket."
                </p>
                <div className="testimonial-author">
                  <strong className={theme === "dark" ? "text-white" : "text-black"}>
                    Michael Chen
                  </strong>
                  <small className={`d-block ${theme === "dark" ? "text-light" : "text-muted"}`}>
                    Engineering Student
                  </small>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className={`testimonial-card p-4 h-100 ${theme === "dark" ? "bg-dark" : "bg-light"}`}>
                <div className="testimonial-stars mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold"></i>
                  ))}
                </div>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-3`}>
                  "As faculty, I love how easy it is to report maintenance issues. The response time has 
                  improved dramatically since we started using this platform."
                </p>
                <div className="testimonial-author">
                  <strong className={theme === "dark" ? "text-white" : "text-black"}>
                    Dr. Emily Rodriguez
                  </strong>
                  <small className={`d-block ${theme === "dark" ? "text-light" : "text-muted"}`}>
                    Mathematics Professor
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Motion.div>
      </Container>

      <footer className="text-center my-4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit our Facebook page"
          title="Facebook"
          className="mx-2"
        >
          <i className="fab fa-facebook"></i>
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit our Twitter profile"
          title="Twitter"
          className="mx-2"
        >
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit our Instagram profile"
          title="Instagram"
          className="mx-2"
        >
          <i className="fab fa-instagram"></i>
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit our LinkedIn profile"
          title="LinkedIn"
          className="mx-2"
        >
          <i className="fab fa-linkedin"></i>
        </a>
      </footer>
    </main>
  );
};

export default Home;