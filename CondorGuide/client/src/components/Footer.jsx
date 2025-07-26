import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGlobe,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="custom-footer bg-black text-white pt-4">
      <Container>
        <Row className="gy-4">
          {/* Contact Us */}
          <Col md={4}>
            <h5 className="footer-heading">Contact Us</h5>
            <p>Email: support@conestogacollege.ca</p>
            <p>Phone: +1 (519) 748-5220</p>
            <p>Address: 299 Doon Valley Dr, Kitchener, ON</p>
          </Col>

          {/* Quick Links */}
          <Col md={4}>
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="footer-links list-unstyled">
              <li><a href="/">Home</a></li>
              <li><a href="/map">College Map</a></li>
              <li><a href="/classrooms">Available Classrooms</a></li>
              <li><a href="/issues">Report Issues</a></li>
              <li><a href="/security">Security Alarm</a></li>
            </ul>
          </Col>

          {/* Social + College Link */}
          <Col md={4}>
            <h5 className="footer-heading">Stay Connected</h5>
            <div className="social-icons d-flex gap-3 mb-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                title="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            </div>
            <a
              href="https://www.conestogac.on.ca/"
              target="_blank"
              rel="noreferrer"
              className="college-link"
              aria-label="Visit Conestoga College website"
              title="Visit Conestoga College"
            >
              <FaGlobe className="me-2" />
              Visit Conestoga College
            </a>
          </Col>
        </Row>
        <hr className="footer-divider" />
        <p className="text-center text-white-50 mb-0">
          © {new Date().getFullYear()} Conestoga College Guide. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
