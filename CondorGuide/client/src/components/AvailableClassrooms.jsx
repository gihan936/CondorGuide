import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

const wings = ['A', 'B', 'C', 'D', 'E', 'F'];

const AvailableClassrooms = () => {
  const { theme } = useContext(ThemeContext);
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedWing, setSelectedWing] = useState('');
  const [message, setMessage] = useState('');

  const handleWingClick = async (wing) => {
    setSelectedWing(wing);
    setMessage('');

    if (!date || !from || !to) {
      setMessage('Please select date and time range.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/classrooms/available', {
        date, from, to, wing
      });

      setAvailableRooms(res.data);
      if (res.data.length === 0) {
        setMessage(`No available rooms found in ${wing} Wing at that time.`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error fetching availability.');
    }
  };

  return (
    <section className={`classroom-section ${theme}`}>
      <Container className="py-5">
        <h2 className="text-center mb-4">Check Available Classrooms</h2>

        <Card className="shadow p-4 mb-5 classroom-form-card">
          <Form>
            <Row className="gy-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label htmlFor="dateInput">Select Date</Form.Label>
                  <Form.Control
                    id="dateInput"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label htmlFor="fromTime">From</Form.Label>
                  <Form.Control
                    id="fromTime"
                    type="time"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label htmlFor="toTime">To</Form.Label>
                  <Form.Control
                    id="toTime"
                    type="time"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card>

        <Row className="gy-3 mb-4 text-center">
          {wings.map((wing, idx) => (
            <Col xs={6} md={4} key={idx}>
              <div
                className="wing-card"
                onClick={() => handleWingClick(wing)}
                aria-label={`Check available rooms in ${wing} Wing`}
              >
                <span>{wing} Wing</span>
              </div>
            </Col>
          ))}
        </Row>

        {message && <p className="text-center text-warning fw-bold">{message}</p>}

        {availableRooms.length > 0 && (
          <Card className="p-4 mt-4 shadow">
            <h5 className="text-center mb-3">Available Rooms in {selectedWing} Wing</h5>
            <Table striped bordered hover>
              <thead>
                <tr><th>Room Number</th></tr>
              </thead>
              <tbody>
                {availableRooms.map((room, i) => (
                  <tr key={i}>
                    <td>{room.location_number}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>
    </section>
  );
};

export default AvailableClassrooms;
