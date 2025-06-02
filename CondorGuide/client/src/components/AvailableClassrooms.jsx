import React, { useContext } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

const wings = ['A Wing', 'B Wing', 'C Wing', 'D Wing', 'E Wing', 'F Wing'];

const Classrooms = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <section className={`classroom-section ${theme}`}>
      <Container className="py-5">
        <h2 className="text-center mb-5 classroom-section-heading">Check Available Classrooms</h2>
        <Card className="shadow classroom-form-card mb-5">
          <Card.Body>
            <Form>
              <Row className="gy-3">
                <Col md={4}>
                  <Form.Group controlId="date">
                    <Form.Label>Select Date</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="from">
                    <Form.Label>From</Form.Label>
                    <Form.Control type="time" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="to">
                    <Form.Label>To</Form.Label>
                    <Form.Control type="time" />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-center mt-4">
                <Button variant="customYellow" className="px-4">
                  Check Availability
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Row className="gy-4 text-center">
          {wings.map((wing, index) => (
            <Col xs={6} md={4} key={index}>
              <div className="wing-card">
                <span>{wing}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Classrooms;
