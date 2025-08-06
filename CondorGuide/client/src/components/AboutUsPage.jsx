import React, { useContext } from "react";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";
import { FaRocket, FaEye, FaUsers, FaLightbulb, FaCheckCircle, FaLaptopCode } from "react-icons/fa";
import { useSpring, animated } from '@react-spring/web'; // Import useSpring and animated

const team = [
  {
    name: "Gihan Edirisinghe Kodikara",
    role: "Full Stack Developer",
    image: "",
    linkedin: "#",
    github: "#",
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

const techStack = ["React", "Bootstrap", "Node.js", "Express", "MongoDB", "Figma", "SMTP", "GridFS"];

const coreValues = [
  { icon: FaUsers, title: "User-First", description: "Your experience drives our development." },
  { icon: FaLightbulb, title: "Innovation", description: "Constantly seeking new ways to solve old problems." },
  { icon: FaCheckCircle, title: "Reliability", description: "Building a platform that is always available when you need it." },
  { icon: FaLaptopCode, title: "Accessibility", description: "Designing for everyone, ensuring equal access to tools." }
];

const AnimatedTitle = ({ children, style }) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 },
    delay: 200
  });
  return <animated.h2 style={{ ...props, ...style }}>{children}</animated.h2>;
};

const AboutUs = () => {
  const { theme, fontSize } = useContext(ThemeContext);

  const fontSizeMap = {
    small: "fs-6",
    medium: "fs-5",
    large: "fs-4",
  };

  const getTextClass = () => `${fontSizeMap[fontSize]} ${theme === "light" ? "text-secondary" : "text-light"}`;
  const getTitleClass = () => `fw-bold ${theme === "light" ? "text-dark" : "text-white"}`;
  const getCardClass = () => `h-100 border-0 shadow-lg p-3 ${theme === "light" ? "bg-white" : "bg-secondary text-white"}`;
  const fade = useSpring({ from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1 }, config: { mass: 1, tension: 200, friction: 20 }, delay: 500 });

  return (
    <div className={`py-5 ${theme === "light" ? "bg-white text-dark" : "bg-dark text-white"}`}>
      <Container>
        <Row className="mb-5 py-5 text-center rounded-4 shadow" style={{ background: theme === "light" ? "#fff3cd" : "#3a3a3a" }}>
          <Col>
            <h1 className="display-4 fw-bold mb-3" style={{ color: "#B68E0C", textShadow: "1px 1px 8px rgba(182,142,12,0.6)" }}>About Condor Guide</h1>
            <animated.p className={`lead ${getTextClass()}`} style={useSpring({ from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" }, delay: 500 })}>
              Building smarter campuses through technology and accessibility.
            </animated.p>
          </Col>
        </Row>

        <Row className="mb-5 gy-5 align-items-stretch">
          {[{ title: "Our Mission", icon: <FaRocket size={30} className="text-dark" />, text: "Our mission is to simplify campus life by providing intuitive tools for navigation, classroom availability, reporting, and more—all in one unified platform." },
            { title: "Our Vision", icon: <FaEye size={30} className="text-dark" />, text: "We envision a connected and accessible digital ecosystem for educational institutions worldwide, streamlining communication, safety, and space utilization." }].map((item, idx) => (
              <Col md={6} key={idx}>
                <animated.div style={fade}>
                  <div className={`rounded-4 p-4 shadow-lg h-100 ${theme === "light" ? "bg-white" : "bg-secondary"}`}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px" }}>
                        {item.icon}
                      </div>
                      <h2 className={getTitleClass()}>{item.title}</h2>
                    </div>
                    <p className={getTextClass()}>{item.text}</p>
                  </div>
                </animated.div>
              </Col>
            ))}
        </Row>

        <Row className="mb-5">
          <Col lg={{ span: 10, offset: 1 }}>
            <animated.div className={`rounded-4 p-5 shadow position-relative overflow-hidden ${theme === "light" ? "bg-light" : "bg-secondary"}`} style={{ background: theme === "light" ? "linear-gradient(135deg, #fff 0%, #fffbe6 100%)" : "linear-gradient(135deg, #3c3c3c 0%, #2f2f2f 100%)" }}>
              <AnimatedTitle style={{ textAlign: "center", color: "#B68E0C", marginBottom: "2rem" }}>Our Story</AnimatedTitle>
              <animated.div className="timeline-wrapper" style={fade}>
                <ul className={`timeline ${getTextClass()}`}>
                  <li>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="fw-bold" style={{ color: "#B68E0C" }}>Idea Sparked</h6>
                      <p>Navigating campus was hard, and we felt it. The frustration of the everyday sparked an idea for a better way.</p>
                    </div>
                  </li>
                  <li>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="fw-bold" style={{ color: "#B68E0C" }}>Team Formed</h6>
                      <p>Fueled by a shared vision, we came together – a small group of students determined to build a student-first platform.</p>
                    </div>
                  </li>
                  <li>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="fw-bold" style={{ color: "#B68E0C" }}>Prototyping</h6>
                      <p>Our vision started taking shape with early wireframes and Figma mockups. Late nights were fueled by coffee and the excitement of creation.</p>
                    </div>
                  </li>
                  <li>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="fw-bold" style={{ color: "#B68E0C" }}>Launch</h6>
                      <p>Condor Guide went live! It was an incredible moment seeing our solution instantly help thousands of students on campus.</p>
                    </div>
                  </li>
                </ul>
              </animated.div>
            </animated.div>
          </Col>
        </Row>

        <Row className="mb-5 text-center">
          <AnimatedTitle style={{ marginBottom: "1rem", color: "#B68E0C" }}>Core Values</AnimatedTitle>
          <Row xs={1} md={2} lg={4} className="g-4">
            {coreValues.map((value, idx) => {
              const cardProps = useSpring({ from: { opacity: 0, transform: 'translateY(50px)' }, to: { opacity: 1, transform: 'translateY(0)' }, delay: 200 * idx });
              return (
                <Col key={idx}>
                  <animated.div style={cardProps}>
                    <Card className={`${getCardClass()} hover-card`}>
                      <Card.Body>
                        <value.icon className="mb-3" style={{ fontSize: "2.5rem", color: "#B68E0C" }} />
                        <Card.Title className="fw-bold">{value.title}</Card.Title>
                        <Card.Text className={getTextClass()}>{value.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </animated.div>
                </Col>
              );
            })}
          </Row>
        </Row>

        <Row className="mb-5 text-center">
          <AnimatedTitle style={{ marginBottom: "1rem", color: "#B68E0C" }}>Meet the Team</AnimatedTitle>
          <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
            {team.map((member, idx) => {
              const cardProps = useSpring({
                from: { opacity: 0, transform: 'scale(0.8)' },
                to: { opacity: 1, transform: 'scale(1)' },
                delay: 200 * idx, // Staggered animation
              });
              return (
                <Col key={idx} className={idx === 1 ? 'mt-md-5' : ''}> {/* Staggered layout logic */}
                  <animated.div style={cardProps}>
                    <Card className={`${getCardClass()} hover-card`}>
                      <Card.Body className="d-flex flex-column align-items-center">
                        <Image
                          src={member.image}
                          roundedCircle
                          height={150}
                          width={150}
                          className="mb-3 border border-3 border-warning"
                          alt={member.name}
                        />
                        <h5 className="fw-bold mt-2">{member.name}</h5>
                        <p className="text-muted">{member.role}</p>
                        <div className="mt-auto social-icons-container">
                          <a href={member.github} className="me-3 text-reset" aria-label="GitHub">
                            <FaGithub size={24} style={{ color: "#B68E0C" }} />
                          </a>
                          <a href={member.linkedin} className="text-reset" aria-label="LinkedIn">
                            <FaLinkedin size={24} style={{ color: "#B68E0C" }} />
                          </a>
                        </div>
                      </Card.Body>
                    </Card>
                  </animated.div>
                </Col>
              );
            })}
          </Row>
        </Row>

        <Row className="mb-5">
          <Col className="text-center">
            <AnimatedTitle style={{ marginBottom: "1rem", color: "#B68E0C" }}>Technologies We Use</AnimatedTitle>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className={`badge rounded-pill fs-6 px-4 py-2 hover-badge ${
                    theme === "light" ? "bg-dark text-light" : "bg-warning text-dark"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="mb-5 text-center">
          <Col>
            <AnimatedTitle style={{ marginBottom: "1rem", color: "#B68E0C" }}>Get in Touch</AnimatedTitle>
            <animated.p className={getTextClass()} style={fade}>
              Have questions, suggestions, or feedback? We'd love to hear from you.
            </animated.p>
            <animated.div className="d-flex justify-content-center align-items-center mt-3" style={fade}>
              <FaEnvelope className="me-3" size={24} style={{ color: "#B68E0C" }} />
              <a href="mailto:support@condorguide.ca" className="text-decoration-none" style={{ color: theme === "light" ? "#B68E0C" : "#FFC107" }}>
                <span className={getTextClass()}>support@condorguide.ca</span>
              </a>
            </animated.div>
          </Col>
        </Row>

        <Row className="text-center">
          <Col>
            <animated.h5 className="fw-bold" style={{ ...fade, color: "#B68E0C" }}>Follow Us</animated.h5>
            <div className="d-flex justify-content-center gap-4 mt-2">
              <a href="#" aria-label="GitHub" className="text-reset fs-4 hover-icon" style={{ color: "#B68E0C" }}><FaGithub /></a>
              <a href="#" aria-label="LinkedIn" className="text-reset fs-4 hover-icon" style={{ color: "#B68E0C" }}><FaLinkedin /></a>
              <a href="#" aria-label="Twitter" className="text-reset fs-4 hover-icon" style={{ color: "#B68E0C" }}><FaTwitter /></a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
