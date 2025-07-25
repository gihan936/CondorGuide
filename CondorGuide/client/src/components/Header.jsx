import React, { useContext } from "react";
import {
  Navbar,
  Nav,
  Dropdown,
  Image,
  Container,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import logoLight from "../assets/logo.png";
import logoDark from "../assets/white_logo.png";
import avatar from "../assets/avatar.png";

const Header = () => {
  const { theme, toggleTheme, fontSize, changeFontSize } =
    useContext(ThemeContext);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      bg={theme}
      variant={theme}
      className={`py-3 shadow-sm ${
        theme === "light" ? "bg-white" : "bg-black"
      }`}
    >
      <Container
        fluid
        className="px-4 d-flex justify-content-between align-items-center"
      >
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <Image
            src={theme === "dark" ? logoDark : logoLight}
            alt="Condor Guide"
            height="70"
            width="70"
            className="me-2"
          />
          <span className="fw-bold fs-4" style={{ color: "#B68E0C" }}>
            Condor Guide
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            {/* COMMON NAVS */}
            <Nav.Link href="/" className="nav-link-custom">
              Home
            </Nav.Link>

            {/* Map visible to non-admins */}
            {user?.role !== "admin" && user?.role !== "superadmin" && (
              <Nav.Link href="/map" className="nav-link-custom">
                College Map
              </Nav.Link>
            )}

            {/* USER ONLY */}
            {user?.role === "user" && (
              <>
                <Nav.Link href="/classrooms" className="nav-link-custom">
                  Available Classrooms
                </Nav.Link>
                <Nav.Link href="/issues" className="nav-link-custom">
                  Report Issues
                </Nav.Link>
                <Nav.Link href="/security-alerts" className="nav-link-custom">
                  Security Alarm
                </Nav.Link>
                <Nav.Link href="/donate" className="nav-link-custom">
                  Donate
                </Nav.Link>
              </>
            )}

            {/* ADMIN ONLY */}
            {user?.role === "admin" && (
              <>
                <Nav.Link href="/issue-management" className="nav-link-custom">
                  Issue Management
                </Nav.Link>
                <Nav.Link
                  href="/classroom-management"
                  className="nav-link-custom"
                >
                  Classroom Management
                </Nav.Link>
                <Nav.Link href="/security-alerts" className="nav-link-custom">
                  Security Alert Management
                </Nav.Link>
                <Nav.Link href="/user-management" className="nav-link-custom">
                  User Management
                </Nav.Link>
              </>
            )}

            {/* SUPERADMIN ONLY */}
            {user?.role === "superadmin" && (
              <>
                <Nav.Link href="/admin-management" className="nav-link-custom">
                  Admin Management
                </Nav.Link>
                <Nav.Link href="/issue-management" className="nav-link-custom">
                  Issue Management
                </Nav.Link>
                <Nav.Link
                  href="/classroom-management"
                  className="nav-link-custom"
                >
                  Classroom Management
                </Nav.Link>
                <Nav.Link href="/security-alerts" className="nav-link-custom">
                  Security Alert Management
                </Nav.Link>
                <Nav.Link href="/user-management" className="nav-link-custom">
                  User Management
                </Nav.Link>
              </>
            )}

            {/* SECURITY ONLY */}
            {user?.role === "security" && (
              <>
                <Nav.Link href="/security-alerts" className="nav-link-custom">
                  Security Alert Management
                </Nav.Link>
              </>
            )}
            {/* MAINTENANCE ONLY */}
            {user?.role === "maintenance" && (
              <>
                <Nav.Link href="/issue-management" className="nav-link-custom">
                  Issue Management
                </Nav.Link>
              </>
            )}

            {/* Font Size Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-font-size"
                size="sm"
                title="Adjust font size for accessibility"
              >
                <span style={{ fontSize: "14px" }}>A</span>
                <span style={{ fontSize: "16px" }}>A</span>
                <span style={{ fontSize: "18px" }}>A</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className={`dropdown-menu-${theme}`}>
                <Dropdown.Header>Font Size</Dropdown.Header>
                <Dropdown.Item
                  onClick={() => changeFontSize("small")}
                  active={fontSize === "small"}
                >
                  Small
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeFontSize("medium")}
                  active={fontSize === "medium"}
                >
                  Medium
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeFontSize("large")}
                  active={fontSize === "large"}
                >
                  Large
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

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
                  style={{ border: "2px solid #e1c212" }}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu className={`dropdown-menu-${theme}`}>
                {user && (
                  <>
                    <Dropdown.Header>{user.email}</Dropdown.Header>
                    <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                    <Dropdown.Item href="/profile/security">
                      Security
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Item onClick={toggleTheme}>
                  Toggle {theme === "light" ? "Dark" : "Light"} Mode
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
