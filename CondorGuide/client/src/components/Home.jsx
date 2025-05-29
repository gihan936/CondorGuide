import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import banner from '../assets/banner.jpg';
import mapImg from '../assets/map.jpg';
import classroomsImg from '../assets/classrooms.jpg';
import issuesImg from '../assets/issues.jpg';
import securityImg from '../assets/security.jpg';

const Home = () => (
  <main>
    <div
      style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '60vh',
      }}
    >
      <div className="d-flex h-100 align-items-center justify-content-center text-white text-center">
        <h1 className="display-4 bg-dark bg-opacity-50 p-3 rounded">Welcome to Condor Guide</h1>
      </div>
    </div>
    <Container className="my-5">
      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Img variant="top" src={mapImg} />
            <Card.Body>
              <Card.Title>College Map</Card.Title>
              <Card.Text>Navigate your campus with ease using our interactive map.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Img variant="top" src={classroomsImg} />
            <Card.Body>
              <Card.Title>Available Classrooms</Card.Title>
              <Card.Text>Check real-time availability of classrooms for your study sessions.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Img variant="top" src={issuesImg} />
            <Card.Body>
              <Card.Title>Report Issues</Card.Title>
              <Card.Text>Quickly report any campus issues to the administration.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Img variant="top" src={securityImg} />
            <Card.Body>
              <Card.Title>Security Alarm</Card.Title>
              <Card.Text>Access emergency contacts and raise alarms instantly.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </main>
);

export default Home;
