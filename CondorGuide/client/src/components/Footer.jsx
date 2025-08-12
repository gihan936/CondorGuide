import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGlobe } from "react-icons/fa";

const Footer = () => (
  <footer className="custom-footer py-5">
    <Container>
      <Row className="gy-4">
        <Col md={4}>
          <h5 className="footer-heading">Contact Us</h5>
          <p>Email: support@conestogacollege.ca</p>
          <p>Phone: +1 (519) 748‑5220</p>
          <p>Address: 299 Doon Valley Dr, Kitchener, ON</p>
        </Col>
        <Col md={4}>
          <h5 className="footer-heading">Quick Links</h5>
          <ul className="footer-links list-unstyled">
            <li><a href="/">Home</a></li>
            <li><a href="/map">College Map</a></li>
            <li><a href="/classrooms">Available Classrooms</a></li>
            <li><a href="/issues">Report Issues</a></li>
            <li><a href="/security">Security Alarm</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="../../sitemap.html">Site Map</a></li>
          </ul>
        </Col>
        <Col md={4}>
          <h5 className="footer-heading">Stay Connected</h5>
          <div className="social-icons d-flex gap-3 mb-3">
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
          <a href="https://www.conestogac.on.ca/" className="college-link" target="_blank" rel="noreferrer">
            <FaGlobe className="me-2" /> Visit Conestoga College
          </a>
        </Col>
      </Row>
      <hr className="footer-divider mt-4" />
      <p className="text-center text-white-50 mb-0">
        © {new Date().getFullYear()} Conestoga College Guide. All rights reserved.
      </p>
    </Container>
  </footer>
);

export default Footer;