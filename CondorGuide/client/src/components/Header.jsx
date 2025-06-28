import React, { useContext } from 'react';
import { Navbar, Nav, Dropdown, Image, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import logoLight from '../assets/logo.png';
import logoDark from '../assets/white_logo.png';
import avatar from '../assets/avatar.png';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Navbar
      expand="lg"
      bg={theme}
      variant={theme}
      className={`py-3 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
    >
      <Container fluid className="px-4 d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <Image
            src={theme === 'dark' ? logoDark : logoLight}
            alt="Condor Guide"
            height="70"
            width="70"
            className="me-2"
          />
          <span
            className="fw-bold fs-4"
            style={{ color: '#e1c212', letterSpacing: '0.5px' }}
          >
            Condor Guide
          </span>
        </Navbar.Brand>

        {/* Responsive Toggle */}
        <Navbar.Toggle aria-controls="main-navbar" />

        {/* Nav Links & Avatar */}
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            <Nav.Link href="/" className="nav-link-custom">Home</Nav.Link>
            <Nav.Link href="/map" className="nav-link-custom">College Map</Nav.Link>
            <Nav.Link href="/classrooms" className="nav-link-custom">Available Classrooms</Nav.Link>
            <Nav.Link href="/issues" className="nav-link-custom">Report Issues</Nav.Link>
            <Nav.Link href="/security" className="nav-link-custom">Security Alarm</Nav.Link>

            {/* Avatar Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-avatar"
                className="p-0 border-0"
              >
                <Image
                  src={avatar}
                  roundedCircle
                  height="40"
                  style={{ border: '2px solid #e1c212' }}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu className={`dropdown-menu-${theme}`}>
                {user && (
                  <Dropdown.Header>
                    {user.email}
                  </Dropdown.Header>
                )}

                {user && <Dropdown.Item href="/profile">Profile</Dropdown.Item>}

                <Dropdown.Item onClick={toggleTheme}>
                  Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                </Dropdown.Item>

                <Dropdown.Divider />

                {!user ? (
                  <Dropdown.Item href="/login">Login</Dropdown.Item>
                ) : (
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
