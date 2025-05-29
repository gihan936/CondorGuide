import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => (
  <footer className="bg-dark text-light py-4 mt-auto">
    <Container>
      <Row>
        <Col md={4}>
          <h5>Condor Guide</h5>
          <p>Your campus companion for navigation and safety.</p>
        </Col>
        <Col md={4}>
          <h5>Quick Links</h5>
          <ul className="list-unstyled">
            <li><a href="/map" className="text-light">College Map</a></li>
            <li><a href="/classrooms" className="text-light">Available Classrooms</a></li>
            <li><a href="/issues" className="text-light">Report Issues</a></li>
            <li><a href="/security" className="text-light">Security Alarm</a></li>
          </ul>
        </Col>
        <Col md={4}>
          <h5>Contact Us</h5>
          <p>Email: support@condorguide.com</p>
          <p>Phone: +1 (123) 456-7890</p>
        </Col>
      </Row>
      <hr className="bg-light" />
      <p className="text-center mb-0">&copy; {new Date().getFullYear()} Condor Guide. All rights reserved.</p>
    </Container>
  </footer>
);

export default Footer;
