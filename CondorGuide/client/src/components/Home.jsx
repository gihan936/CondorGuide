import React, { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion as Motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

import bannerBg from "../assets/banner.jpg";
import mapImg from "../assets/map.jpg";
import classroomsImg from "../assets/classrooms.jpg";
import issuesImg from "../assets/issues.jpg";
import securityImg from "../assets/security.jpg";

const features = [
  {
    title: "College Map",
    text: "Navigate your campus with ease using our interactive map.",
    image: mapImg,
    link: "/map",
  },
  {
    title: "Available Classrooms",
    text: "Check real-time availability of classrooms for your study sessions.",
    image: classroomsImg,
    link: "/classrooms",
  },
  {
    title: "Report Issues",
    text: "Quickly report any campus issues to the administration.",
    image: issuesImg,
    link: "/issues",
  },
  {
    title: "Security Alarm",
    text: "Access emergency contacts and raise alarms instantly.",
    image: securityImg,
    link: "/security",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Home = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <main>
      <div
        className="home-banner-section"
        style={{
          backgroundImage: `url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "50vh",
          position: "relative",
        }}
      >
        <div className="banner-overlay d-flex align-items-center justify-content-center">
          <Motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              className="display-4 banner-text"
              style={{ color: "#B68E0C" }}
            >
              Welcome to Condor Guide
            </h1>
            <p className="lead">
              Your smart companion to navigate, report, and secure your college
              experience.
            </p>
            <Button
              href="/map"
              variant="warning"
              className="mt-3 px-4 py-2 fw-bold"
            >
              Explore Campus
            </Button>
          </Motion.div>
        </div>
      </div>

      <Container className="my-5">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3}>
                <Motion.a
                  href={feature.link}
                  className="card-link text-decoration-none text-dark"
                  variants={cardVariants}
                >
                  <Card className="feature-card h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={feature.image}
                      alt=" "
                      className="feature-card-img"
                    />
                    <Card.Body>
                      <Card.Title className="fw-bold text-black">
                        {feature.title}
                      </Card.Title>
                      <Card.Text>{feature.text}</Card.Text>
                    </Card.Body>
                  </Card>
                </Motion.a>
              </Col>
            ))}
          </Row>
        </Motion.div>
      </Container>

      <Container className="my-5 text-center">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className={`${theme === "dark" ? "text-white" : "text-black"} mb-3`}
          >
            About Condor Guide
          </h2>
          <p className={`${theme === "dark" ? "text-light" : "text-black-50"}`}>
            This platform is built for students and faculty to enhance campus
            life with easy access to navigation, room availability, emergency
            tools, and issue reporting.
          </p>
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
