import React, { useContext } from "react";
import { Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import {  FaUserCircle } from "react-icons/fa";
import { AiOutlineFontSize } from "react-icons/ai";
import logoLight from "../assets/logo.png";
import logoDark from "../assets/white_logo.png";
import { Image as BSImage } from "react-bootstrap"; 

const Header = () => {
  const { theme, toggleTheme, fontSize, changeFontSize } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { localStorage.removeItem("user"); navigate("/"); };

  return (
    <>
      <style>
        {`
          .custom-navbar {
            padding: 0.5rem 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background: ${theme === "dark" ? "#1a1a1a" : "#ffffff"};
          }
          .nav-link-custom {
            font-size: 0.9rem;
            font-weight: 500;
            color: ${theme === "dark" ? "#e0e0e0" : "#333333"};
            padding: 0.5rem 0.75rem;
            transition: color 0.3s ease, background 0.3s ease;
            border-radius: 0.25rem;
          }
          .nav-link-custom:hover {
            color: #c4aa11;
            background: ${theme === "dark" ? "rgba(196, 170, 17, 0.1)" : "rgba(196, 170, 17, 0.1)"};
          }
          .nav-link-custom.active {
            color: #c4aa11;
            font-weight: 600;
            background: ${theme === "dark" ? "rgba(196, 170, 17, 0.2)" : "rgba(196, 170, 17, 0.2)"};
          }
          .logo-img {
            transition: transform 0.3s ease;
          }
          .logo-img:hover {
            transform: scale(1.1);
          }
          .font-size-dropdown .dropdown-toggle {
            display: flex;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            color: ${theme === "dark" ? "#e0e0e0" : "#333333"};
            font-size: 1.2rem;
            transition: color 0.3s ease, background 0.3s ease;
          }
          .font-size-dropdown .dropdown-toggle:hover {
            background: ${theme === "dark" ? "rgba(196, 170, 17, 0.1)" : "rgba(196, 170, 17, 0.1)"};
            color: #c4aa11;
          }
          .avatar-dropdown .dropdown-toggle {
            display: flex;
            align-items: center;
            padding: 0;
            border: 2px solid #c4aa11;
            border-radius: 50%;
            font-size: 1.5rem;
            color: ${theme === "dark" ? "#e0e0e0" : "#333333"};
            transition: border-color 0.3s ease, color 0.3s ease;
          }
          .avatar-dropdown .dropdown-toggle:hover {
            border-color: ${theme === "dark" ? "#e0e0e0" : "#333333"};
            color: #c4aa11;
          }
          .dropdown-menu-${theme} {
            background: ${theme === "dark" ? "#2a2a2a" : "#ffffff"};
            border: 1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"};
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          .dropdown-item {
            font-size: 0.85rem;
            color: ${theme === "dark" ? "#e0e0e0" : "#333333"};
            padding: 0.5rem 1rem;
          }
          .dropdown-item:hover {
            background: ${theme === "dark" ? "rgba(196, 170, 17, 0.2)" : "rgba(196, 170, 17, 0.1)"};
            color: #c4aa11;
          }
          .dropdown-item.active {
            background: ${theme === "dark" ? "rgba(196, 170, 17, 0.3)" : "rgba(196, 170, 17, 0.2)"};
            color: #c4aa11;
          }
          .navbar-toggler {
            border: none;
            padding: 0.25rem;
          }
          .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='${theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"}' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          }
        `}
      </style>
      <Navbar expand="lg" variant={theme} className={`custom-navbar ${theme}`}>
        <Container fluid className="px-2 px-md-4 d-flex justify-content-between align-items-center">
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <BSImage src={theme === "dark" ? logoDark : logoLight} alt="Condor Guide" height="50" width="50" className="me-2 logo-img" />
            <span className="fw-bold fs-5 text-gold">Condor Guide</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto d-flex align-items-center gap-2 gap-lg-3">
              <Nav.Link href="/" className={`nav-link-custom ${isActive("/") && "active"}`}>Home</Nav.Link>
              <Nav.Link href="/about" className={`nav-link-custom ${isActive("/about") && "active"}`}>About Us</Nav.Link>
              <Nav.Link href="/classrooms" className={`nav-link-custom ${isActive("/classrooms") && "active"}`}>Available Classrooms</Nav.Link>
              {user?.role !== "admin" && user?.role !== "superadmin" && (
                <>
                  <Nav.Link href="/map" className={`nav-link-custom ${isActive("/map") && "active"}`}>College Map</Nav.Link>
                </>
              )}
              {user?.role === "user" && (
                <>
                  
                  <Nav.Link href="/issues" className={`nav-link-custom ${isActive("/issues") && "active"}`}>Report Issues</Nav.Link>
                  <Nav.Link href="/security-alerts" className={`nav-link-custom ${isActive("/security-alerts") && "active"}`}>Security Alarm</Nav.Link>
                  <Nav.Link href="/donate" className={`nav-link-custom ${isActive("/donate") && "active"}`}>Donate</Nav.Link>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <Nav.Link href="/issue-management" className={`nav-link-custom ${isActive("/issue-management") && "active"}`}>Issue Management</Nav.Link>
                  <Nav.Link href="/classroom-management" className={`nav-link-custom ${isActive("/classroom-management") && "active"}`}>Classroom Management</Nav.Link>
                  <Nav.Link href="/security-alerts" className={`nav-link-custom ${isActive("/security-alerts") && "active"}`}>Security Alert Management</Nav.Link>
                  <Nav.Link href="/user-management" className={`nav-link-custom ${isActive("/user-management") && "active"}`}>User Management</Nav.Link>
                </>
              )}
              {user?.role === "superadmin" && (
                <>
                  <Nav.Link href="/admin-management" className={`nav-link-custom ${isActive("/admin-management") && "active"}`}>User Management</Nav.Link>
                  <Nav.Link href="/issue-management" className={`nav-link-custom ${isActive("/issue-management") && "active"}`}>Issue Management</Nav.Link>
                  <Nav.Link href="/classroom-management" className={`nav-link-custom ${isActive("/classroom-management") && "active"}`}>Classroom Management</Nav.Link>
                  <Nav.Link href="/security-alerts" className={`nav-link-custom ${isActive("/security-alerts") && "active"}`}>Security Alert Management</Nav.Link>
                </>
              )}
              {user?.role === "security" && (
                <Nav.Link href="/security-alerts" className={`nav-link-custom ${isActive("/security-alerts") && "active"}`}>Security Alert Management</Nav.Link>
              )}
              {user?.role === "maintenance" && (
                <Nav.Link href="/issue-management" className={`nav-link-custom ${isActive("/issue-management") && "active"}`}>Issue Management</Nav.Link>
              )}
              <Dropdown align="end" className="font-size-dropdown">
                <Dropdown.Toggle variant="link" id="dropdown-font-size" className="focus-ring">
                  <AiOutlineFontSize size={24}/>
                </Dropdown.Toggle>
                <Dropdown.Menu className={`dropdown-menu-${theme}`}>
                  <Dropdown.Header>Font Size</Dropdown.Header>
                  <Dropdown.Item onClick={() => changeFontSize("small")} active={fontSize === "small"} className="focus-ring">Small</Dropdown.Item>
                  <Dropdown.Item onClick={() => changeFontSize("medium")} active={fontSize === "medium"} className="focus-ring">Medium</Dropdown.Item>
                  <Dropdown.Item onClick={() => changeFontSize("large")} active={fontSize === "large"} className="focus-ring">Large</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown align="end" className="avatar-dropdown">
                <Dropdown.Toggle variant="link" id="dropdown-avatar" className="p-0 border-0 focus-ring">
                  <FaUserCircle size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu className={`dropdown-menu-${theme}`}>
                  {user && <>
                    <Dropdown.Header>{user.email}</Dropdown.Header>
                    <Dropdown.Item href="/profile" className="focus-ring">Profile</Dropdown.Item>
                  </>}
                  <Dropdown.Item onClick={toggleTheme} className="focus-ring">Toggle {theme === "light" ? "Dark" : "Light"} Mode</Dropdown.Item>
                  <Dropdown.Divider />
                  {!user ? (
                    <Dropdown.Item href="/login" className="focus-ring">Login</Dropdown.Item>
                  ) : (
                    <Dropdown.Item onClick={handleLogout} className="focus-ring">Logout</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;