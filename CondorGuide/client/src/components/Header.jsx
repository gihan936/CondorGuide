import React, { useContext } from 'react';
import { Navbar, Nav, Dropdown, Image } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Navbar bg={theme} variant={theme} expand="lg" className="px-4">
      <Navbar.Brand href="/">
        <Image src={logo} alt="Condor Guide" height="40" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/map">College Map</Nav.Link>
          <Nav.Link href="/classrooms">Available Classrooms</Nav.Link>
          <Nav.Link href="/issues">Report Issues</Nav.Link>
          <Nav.Link href="/security">Security Alarm</Nav.Link>
        </Nav>
        <Dropdown align="end">
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            <Image src={avatar} roundedCircle height="30" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
            <Dropdown.Item onClick={toggleTheme}>
              Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="/logout">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
