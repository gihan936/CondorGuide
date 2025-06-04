import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

const wings = ['A Wing', 'B Wing', 'C Wing', 'D Wing', 'E Wing', 'F Wing'];

const Classrooms = () => {
  const { theme } = useContext(ThemeContext);
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedWing, setSelectedWing] = useState('');
  const [noRoomsMessage, setNoRoomsMessage] = useState('');

  const handleWingClick = async (wing) => {
    setSelectedWing(wing);
    setNoRoomsMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/classrooms/available', {
        date,
        from,
        to,
        wing
      });
      if (res.data.length === 0) {
        setNoRoomsMessage(`No available rooms found in ${wing} at that time.`);
      }
      setAvailableRooms(res.data);
    } catch (err) {
      console.error(err);
      setAvailableRooms([]);
      setNoRoomsMessage('Error fetching rooms. Please try again.');
    }
  };

  return (
    <section className={`classroom-section ${theme}`}>
      <Container className="py-5">
        <h2 className="text-center mb-5 classroom-section-heading">Check Available Classrooms</h2>

        {/* Date & Time Selection */}
        <Card className="shadow classroom-form-card mb-5">
          <Card.Body>
            <Form>
              <Row className="gy-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>From</Form.Label>
                    <Form.Control
                      type="time"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>To</Form.Label>
                    <Form.Control
                      type="time"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Wing Buttons */}
        <Row className="gy-4 text-center">
          {wings.map((wing, index) => (
            <Col xs={6} md={4} key={index}>
              <div className="wing-card" onClick={() => handleWingClick(wing)}>
                <span>{wing}</span>
              </div>
            </Col>
          ))}
        </Row>

        {/* Results Table */}
        {availableRooms.length > 0 && (
          <div className="mt-5">
            <h4 className="text-center mb-3">Available Rooms in {selectedWing}</h4>
            <Table striped bordered hover className="table">
              <thead>
                <tr>
                  <th>Room Number</th>
                </tr>
              </thead>
              <tbody>
                {availableRooms.map((room, index) => (
                  <tr key={index}>
                    <td>{room.roomNumber}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* No Rooms Message */}
        {noRoomsMessage && (
          <div className="text-center mt-4 text-warning fw-bold">
            {noRoomsMessage}
          </div>
        )}
      </Container>
    </section>
  );
};

export default Classrooms;
