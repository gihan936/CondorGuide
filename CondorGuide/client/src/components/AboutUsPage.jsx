import React, { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaRocket, FaEye, FaUsers, FaLightbulb, FaCheckCircle, FaLaptopCode } from "react-icons/fa";
import GihanImg from "../assets/gihan.jpg";
import KushadiniImg from "../assets/Kushadini.jpg";
import ShannthaImg from "../assets/shanntha.jpg";

// Team data
const team = [
  {
    name: "Gihan Edirisinghe Kodikara",
    role: "Full Stack Developer | Software Engineer",
    image: GihanImg,
    linkedin: "https://www.linkedin.com/in/gihan-niranga/",
    github: "https://github.com/gihan936",
  },
  {
    name: "Shanntha Kumar",
    role: "Full Stack Developer",
    image: ShannthaImg,
    linkedin: "https://www.linkedin.com/in/shanntha-kumar-k-b210a6240",
    github: "https://github.com/shannthakumar",
  },
  {
    name: "Kushadini Mallawaarachchi",
    role: "Full Stack Developer",
    image: KushadiniImg,
    linkedin: "https://www.linkedin.com/in/kushadini-amali-mallawaarachchi-6479461b0/",
    github: "https://github.com/kushadini",
  },
];

// Tech stack
const techStack = ["React.js", "Bootstrap", "Node.js", "Express", "MongoDB", "Mapbox GL JS", "geojson.io", "Figma", "SMTP", "GridFS", "JWT", "Stripe"];

// Core values
const coreValues = [
  { icon: FaUsers, title: "User-First", description: "Your experience drives our development." },
  { icon: FaLightbulb, title: "Innovation", description: "Constantly seeking new ways to solve old problems." },
  { icon: FaCheckCircle, title: "Reliability", description: "Building a platform always available when you need it." },
  { icon: FaLaptopCode, title: "Accessibility", description: "Designing for everyone, ensuring equal access to tools." }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    y: -5,
    scale: 1.03,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const AboutUs = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <main className={`py-5 ${theme === "dark" ? "bg-dark text-white" : "bg-light text-dark"}`} style={{ overflow: "hidden" }}>
      {/* Header Section */}
      <Container className="my-5 py-5">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h1 className={`display-4 fw-bold mb-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
            About <span style={{ color: "#B68E0C" }}>Condor Guide</span>
          </h1>
          <p className={`lead mx-auto ${theme === "dark" ? "text-light" : "text-muted"}`} style={{ maxWidth: "600px" }}>
            Building smarter campuses through technology and accessibility.
          </p>
        </motion.div>
      </Container>

      {/* Mission & Vision Section */}
      <Container className="my-5">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row className="g-4">
            {[{ 
              title: "Our Mission", 
              icon: <FaRocket size={30} style={{ color: "#B68E0C" }} />, 
              text: "Our mission is to simplify campus life by providing intuitive tools for navigation, classroom availability, reporting, and more—all in one unified platform."
            }, {
              title: "Our Vision", 
              icon: <FaEye size={30} style={{ color: "#B68E0C" }} />, 
              text: "We envision a connected and accessible digital ecosystem for educational institutions worldwide, streamlining communication, safety, and space utilization."
            }].map((item, idx) => (
              <Col md={6} key={idx}>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Card 
                    className={`h-100 border-0 rounded-3 overflow-hidden ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`} 
                    style={{ 
                      background: theme === "dark" 
                        ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))" 
                        : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: "60px", 
                            height: "60px", 
                            background: "rgba(182, 142, 12, 0.1)",
                          }}
                        >
                          {item.icon}
                        </div>
                        <h3 className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{item.title}</h3>
                      </div>
                      <Card.Text className={theme === "dark" ? "text-light" : "text-muted"}>{item.text}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>

      {/* Our Story Section */}
      <Container className="my-5">
        <motion.div variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className={`display-6 fw-bold text-center mb-5 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Our <span style={{ color: "#B68E0C" }}>Story</span>
          </h2>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="d-flex flex-column gap-5 position-relative">
                  {[
                    { step: 1, title: "Idea Sparked", text: "Navigating campus was hard, and we felt it. The frustration of the everyday sparked an idea for a better way." },
                    { step: 2, title: "Team Formed", text: "Fueled by a shared vision, we came together – a small group of students determined to build a student-first platform." },
                    { step: 3, title: "Prototyping", text: "Our vision started taking shape with early wireframes and Figma mockups. Late nights were fueled by coffee and the excitement of creation." },
                    { step: 4, title: "Launch", text: "Condor Guide went live! It was an incredible moment seeing our solution instantly help thousands of students on campus." }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className={`d-flex align-items-center ${idx % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                      style={{ position: "relative", minHeight: "150px" }}
                      variants={itemVariants}
                      whileHover="hover"
                    >
                      <Col xs={12} md={6} className="p-3">
                        <div 
                          className={`p-4 rounded-3 ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`} 
                          style={{ 
                            background: theme === "dark" 
                              ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))" 
                              : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <div className="d-flex align-items-center mb-3">
                            <span
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#B68E0C",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "1.2rem"
                              }}
                            >
                              {item.step}
                            </span>
                            <h5 className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{item.title}</h5>
                          </div>
                          <p className={theme === "dark" ? "text-light" : "text-muted"}>{item.text}</p>
                        </div>
                      </Col>
                      {idx < 3 && (
                        <motion.div
                          className="position-absolute"
                          style={{
                            width: "2px",
                            backgroundColor: "#B68E0C",
                            height: "80px",
                            left: "50%",
                            top: "100%",
                            transform: "translateX(-50%)"
                          }}
                          initial={{ height: 0 }}
                          whileInView={{ height: "80px" }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          viewport={{ once: true }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>

      {/* Core Values Section */}
      <Container className="my-5">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Our <span style={{ color: "#B68E0C" }}>Core Values</span>
          </h2>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row xs={1} md={2} lg={4} className="g-4">
            {coreValues.map((value, idx) => (
              <Col key={idx}>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Card 
                    className={`h-100 border-0 rounded-3 overflow-hidden ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`} 
                    style={{ 
                      background: theme === "dark" 
                        ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))" 
                        : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <Card.Body className="p-4 text-center">
                      <value.icon className="mb-3" style={{ fontSize: "2.5rem", color: "#B68E0C" }} />
                      <Card.Title className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{value.title}</Card.Title>
                      <Card.Text className={theme === "dark" ? "text-light" : "text-muted"}>{value.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>

      {/* Team Section */}
      <Container className="my-5">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Meet the <span style={{ color: "#B68E0C" }}>Team</span>
          </h2>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row xs={1} sm={2} md={3} className="g-4 justify-content-center">
            {team.map((member, idx) => (
              <Col key={idx}>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Card 
                    className={`h-100 border-0 rounded-3 overflow-hidden ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`} 
                    style={{ 
                      background: theme === "dark" 
                        ? "linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))" 
                        : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <Card.Body className="d-flex flex-column align-items-center p-4">
                      <motion.img
                        src={member.image || "https://via.placeholder.com/150"}
                        alt={member.name}
                        className="rounded-circle mb-3 border border-3"
                        style={{ width: "150px", height: "150px", objectFit: "cover", borderColor: "#B68E0C" }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                      />
                      <h5 className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{member.name}</h5>
                      <p className={theme === "dark" ? "text-light" : "text-muted"}>{member.role}</p>
                      <div className="mt-auto d-flex gap-3">
                        <motion.a 
                          href={member.github} 
                          className="text-reset" 
                          aria-label="GitHub"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaGithub size={24} style={{ color: "#B68E0C" }} />
                        </motion.a>
                        <motion.a 
                          href={member.linkedin} 
                          className="text-reset" 
                          aria-label="LinkedIn"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaLinkedin size={24} style={{ color: "#B68E0C" }} />
                        </motion.a>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>

      {/* Technologies Section */}
      <Container className="my-5">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Technologies We <span style={{ color: "#B68E0C" }}>Use</span>
          </h2>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {techStack.map((tech, idx) => (
              <motion.span
                key={idx}
                className={`badge rounded-pill px-4 py-2 fw-semibold`}
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${theme === "dark" ? "#fff" : "#333"}`,
                  color: theme === "dark" ? "#fff" : "#333",
                  fontSize: "0.9rem"
                }}
                variants={itemVariants}
                whileHover={{ scale: 1.1, borderColor: "#B68E0C" }}
                transition={{ duration: 0.3 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </Container>

      {/* Get in Touch Section */}
      <Container className="my-5 text-center">
        <motion.div variants={titleVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className={`display-6 fw-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Get in <span style={{ color: "#B68E0C" }}>Touch</span>
          </h2>
          <p className={`lead mb-4 ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Have questions, suggestions, or feedback? We'd love to hear from you.
          </p>
          <motion.div 
            className="d-flex justify-content-center align-items-center mb-4"
            variants={itemVariants}
          >
            <FaEnvelope size={24} style={{ color: "#B68E0C" }} className="me-3" />
            <motion.a 
              href="mailto:support@condorguide.ca" 
              className={`text-decoration-none`} 
              style={{ color: "#B68E0C" }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              support@condorguide.ca
            </motion.a>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline"
              size="lg" 
              className="px-4 py-2 fw-semibold custom-button"
              style={{ backgroundColor: "transparent", borderColor: "#B68E0C", color: "#B68E0C" }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#B68E0C", 
                color: theme === "dark" ? "#fff" : "#333" 
              }}
              transition={{ duration: 0.3 }}
            >
              Contact Us
              <FaEnvelope className="ms-2" style={{ color: "#B68E0C" }} />
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* Footer */}
      <footer className="text-center my-4">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="d-flex justify-content-center gap-4">
            {[
              { href: "https://github.com", label: "GitHub", icon: <FaGithub size={24} /> },
              { href: "https://linkedin.com", label: "LinkedIn", icon: <FaLinkedin size={24} /> },
              { href: "https://twitter.com", label: "Twitter", icon: <FaTwitter size={24} /> }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                style={{ color: "#B68E0C" }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </footer>
    </main>
  );
};

export default AboutUs;