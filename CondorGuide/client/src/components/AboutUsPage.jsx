import React, { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion as Motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaRocket, FaEye, FaUsers, FaLightbulb, FaCheckCircle, FaLaptopCode } from "react-icons/fa";
import GihanImg from "../assets/gihan.jpg";

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
    image: "",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Kushadini",
    role: "Back End Developer",
    image: "",
    linkedin: "#",
    github: "#",
  },
];


// Tech stack
const techStack = ["React", "Bootstrap", "Node.js", "Express", "MongoDB", "Figma", "SMTP", "GridFS"];

// Core values
const coreValues = [
  { icon: FaUsers, title: "User-First", description: "Your experience drives our development." },
  { icon: FaLightbulb, title: "Innovation", description: "Constantly seeking new ways to solve old problems." },
  { icon: FaCheckCircle, title: "Reliability", description: "Building a platform that is always available when you need it." },
  { icon: FaLaptopCode, title: "Accessibility", description: "Designing for everyone, ensuring equal access to tools." }
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

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8 }
  }
};

const AboutUs = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <main className={`py-5 ${theme === "dark" ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header Section */}
      <Container className="my-5 py-5">
        <Motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className={`display-4 fw-bold mb-3 ${theme === "dark" ? "text-white" : "text-black"}`}>
            About <span className="text-gold">Condor Guide</span>
          </h1>
          <p className={`lead mx-auto ${theme === "dark" ? "text-light" : "text-muted"}`} style={{ maxWidth: "600px" }}>
            Building smarter campuses through technology and accessibility.
          </p>
        </Motion.div>
      </Container>

      {/* Mission & Vision Section */}
      <Container className="my-5">
        <Motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row className="g-4">
            {[{ 
              title: "Our Mission", 
              icon: <FaRocket size={30} className="text-gold" />, 
              text: "Our mission is to simplify campus life by providing intuitive tools for navigation, classroom availability, reporting, and more—all in one unified platform."
            }, {
              title: "Our Vision", 
              icon: <FaEye size={30} className="text-gold" />, 
              text: "We envision a connected and accessible digital ecosystem for educational institutions worldwide, streamlining communication, safety, and space utilization."
            }].map((item, idx) => (
              <Col md={6} key={idx}>
                <Motion.div variants={cardVariants} whileHover="hover">
                  <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}>
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-gold bg-opacity-10 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                          {item.icon}
                        </div>
                        <h3 className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{item.title}</h3>
                      </div>
                      <Card.Text className={theme === "dark" ? "text-light" : "text-muted"}>{item.text}</Card.Text>
                    </Card.Body>
                  </Card>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Motion.div>
      </Container>

      {/* Our Story Section */}
      <Container className="my-5">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className={`display-6 fw-bold text-center mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Our <span className="text-gold">Story</span>
          </h2>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}>
                <Card.Body className="p-4 p-md-5">
                  <ul className="timeline">
                    {[
                      { title: "Idea Sparked", text: "Navigating campus was hard, and we felt it. The frustration of the everyday sparked an idea for a better way." },
                      { title: "Team Formed", text: "Fueled by a shared vision, we came together – a small group of students determined to build a student-first platform." },
                      { title: "Prototyping", text: "Our vision started taking shape with early wireframes and Figma mockups. Late nights were fueled by coffee and the excitement of creation." },
                      { title: "Launch", text: "Condor Guide went live! It was an incredible moment seeing our solution instantly help thousands of students on campus." }
                    ].map((item, idx) => (
                      <Motion.li
                        key={idx}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        <div className="timeline-marker" style={{ background: "#B68E0C" }}></div>
                        <div className="timeline-content">
                          <h6 className="fw-bold text-gold">{item.title}</h6>
                          <p className={theme === "dark" ? "text-light" : "text-muted"}>{item.text}</p>
                        </div>
                      </Motion.li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Motion.div>
      </Container>

      {/* Core Values Section */}
      <Container className="my-5">
        <Motion.div
          className="text-center mb-5"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Our <span className="text-gold">Core Values</span>
          </h2>
        </Motion.div>
        <Motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row xs={1} md={2} lg={4} className="g-4">
            {coreValues.map((value, idx) => (
              <Col key={idx}>
                <Motion.div variants={cardVariants} whileHover="hover">
                  <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}>
                    <Card.Body className="p-4 text-center">
                      <value.icon className="mb-3" style={{ fontSize: "2.5rem", color: "#B68E0C" }} />
                      <Card.Title className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{value.title}</Card.Title>
                      <Card.Text className={theme === "dark" ? "text-light" : "text-muted"}>{value.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Motion.div>
      </Container>

      {/* Team Section */}
      <Container className="my-5">
        <Motion.div
          className="text-center mb-5"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Meet the <span className="text-gold">Team</span>
          </h2>
        </Motion.div>
        <Motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row xs={1} sm={2} md={3} className="g-4 justify-content-center">
            {team.map((member, idx) => (
              <Col key={idx}>
                <Motion.div variants={cardVariants} whileHover="hover">
                  <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}>
                    <Card.Body className="d-flex flex-column align-items-center p-4">
                      <img
                        src={member.image || "https://via.placeholder.com/150"}
                        alt={member.name}
                        className="rounded-circle mb-3 border border-3 border-gold"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                      <h5 className={`fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>{member.name}</h5>
                      <p className={theme === "dark" ? "text-light" : "text-muted"}>{member.role}</p>
                      <div className="mt-auto d-flex gap-3">
                        <a href={member.github} className="text-reset" aria-label="GitHub">
                          <FaGithub size={24} className="text-gold" />
                        </a>
                        <a href={member.linkedin} className="text-reset" aria-label="LinkedIn">
                          <FaLinkedin size={24} className="text-gold" />
                        </a>
                      </div>
                    </Card.Body>
                  </Card>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Motion.div>
      </Container>

      {/* Technologies Section */}
      <Container className="my-5">
        <Motion.div
          className="text-center mb-5"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Technologies We <span className="text-gold">Use</span>
          </h2>
        </Motion.div>
        <Motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {techStack.map((tech, idx) => (
              <Motion.span
                key={idx}
                variants={cardVariants}
                className={`badge rounded-pill px-4 py-2 fw-semibold ${theme === "dark" ? "bg-gold text-dark" : "bg-dark text-light"}`}
              >
                {tech}
              </Motion.span>
            ))}
          </div>
        </Motion.div>
      </Container>

      {/* Get in Touch Section */}
      <Container className="my-5 text-center">
        <Motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={`display-6 fw-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Get in <span className="text-gold">Touch</span>
          </h2>
          <p className={`lead mb-4 ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Have questions, suggestions, or feedback? We'd love to hear from you.
          </p>
          <div className="d-flex justify-content-center align-items-center mb-4">
            <FaEnvelope size={24} className="text-gold me-3" />
            <a href="mailto:support@condorguide.ca" className={`text-decoration-none ${theme === "dark" ? "text-gold" : "text-gold"}`}>
              support@condorguide.ca
            </a>
          </div>
          <Button 
            variant="outline-gold" 
            size="lg" 
            className="px-4 py-2 fw-semibold" 
            style={{ color: "#B68E0C" }}
          >
            Contact Us
            <FaEnvelope className="ms-2" style={{ color: "#B68E0C" }} />
          </Button>
        </Motion.div>
      </Container>

      {/* Footer */}
      <footer className="text-center my-4">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="d-flex justify-content-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-gold">
              <FaGithub size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gold">
              <FaLinkedin size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gold">
              <FaTwitter size={24} />
            </a>
          </div>
        </Motion.div>
      </footer>
    </main>
  );
};

export default AboutUs;