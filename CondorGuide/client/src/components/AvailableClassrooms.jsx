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

  const handleWingClick = async (wing) => {
    setSelectedWing(wing);
    try {
      const res = await axios.post('http://localhost:5000/api/classrooms/available', {
        date,
        from,
        to,
        wing
      });
      setAvailableRooms(res.data);
    } catch (err) {
      console.error(err);
      setAvailableRooms([]);
    }
  };

  return (
    <section className={`classroom-section ${theme}`}>
      <Container className="py-5">
        <h2 className="text-center mb-5 classroom-section-heading">Check Available Class Rooms</h2>
        <Card className="shadow classroom-form-card mb-5">
          <Card.Body>
            <Form>
              <Row className="gy-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select Date</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>From</Form.Label>
                    <Form.Control type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>To</Form.Label>
                    <Form.Control type="time" value={to} onChange={(e) => setTo(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <Row className="gy-4 text-center">
          {wings.map((wing, index) => (
            <Col xs={6} md={4} key={index}>
              <div className="wing-card" onClick={() => handleWingClick(wing)}>
                <span>{wing}</span>
              </div>
            </Col>
          ))}
        </Row>

        {selectedWing && (
  <div className="mt-5">
    <h4 className="text-center">Available Rooms in {selectedWing}</h4>

    {availableRooms.length > 0 ? (
      <Table striped bordered hover className="mt-3">
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
    ) : (
      <p className="text-center text-danger fw-bold mt-3">No available classrooms found for this time slot.</p>
    )}
  </div>
)}

      </Container>
    </section>
  );
};

export default Classrooms;

// import React, { useContext } from 'react';
// import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
// import { ThemeContext } from '../context/ThemeContext';

// const wings = ['A Wing', 'B Wing', 'C Wing', 'D Wing', 'E Wing', 'F Wing'];

// const Classrooms = () => {
//   const { theme } = useContext(ThemeContext);

//   return (
//     <section className={`classroom-section ${theme}`}>
//       <Container className="py-5">
//         <h2 className="text-center mb-5 classroom-section-heading">Check Available Classrooms</h2>
//         <Card className="shadow classroom-form-card mb-5">
//           <Card.Body>
//             <Form>
//               <Row className="gy-3">
//                 <Col md={4}>
//                   <Form.Group controlId="date">
//                     <Form.Label>Select Date</Form.Label>
//                     <Form.Control type="date" />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group controlId="from">
//                     <Form.Label>From</Form.Label>
//                     <Form.Control type="time" />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group controlId="to">
//                     <Form.Label>To</Form.Label>
//                     <Form.Control type="time" />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <div className="text-center mt-4">
//                 <Button variant="customYellow" className="px-4">
//                   Check Availability
//                 </Button>
//               </div>
//             </Form>
//           </Card.Body>
//         </Card>

//         <Row className="gy-4 text-center">
//           {wings.map((wing, index) => (
//             <Col xs={6} md={4} key={index}>
//               <div className="wing-card">
//                 <span>{wing}</span>
//               </div>
//             </Col>
//           ))}
//         </Row>
//       </Container>
//     </section>
//   );
// };

// export default Classrooms;
