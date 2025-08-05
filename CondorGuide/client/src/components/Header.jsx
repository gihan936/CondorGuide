import React, { useContext } from "react";
import {
  Navbar,
  Nav,
  Dropdown,
  Image,
  Container,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import logoLight from "../assets/logo.png";
import logoDark from "../assets/white_logo.png";
import avatar from "../assets/avatar.png";

const Header = () => {
  const { theme, toggleTheme, fontSize, changeFontSize } =
    useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar
      expand="lg"
      bg={theme}
      variant={theme}
      className={`py-3 shadow-sm ${theme === "light" ? "bg-white" : "bg-black"}`}
    >
      <Container fluid className="px-4 d-flex justify-content-between align-items-center">
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
            <Nav.Link
              href="/"
              className={`nav-link-custom focus-ring ${isActive("/") ? "active fw-bold text-decoration-underline" : ""}`}
            >
              Home
            </Nav.Link>

            {user?.role !== "admin" && user?.role !== "superadmin" && (
              <Nav.Link
                href="/map"
                className={`nav-link-custom focus-ring ${isActive("/map") ? "active fw-bold text-decoration-underline" : ""}`}
              >
                College Map
              </Nav.Link>
            )}

            {user?.role === "user" && (
              <>
                <Nav.Link
                  href="/classrooms"
                  className={`nav-link-custom focus-ring ${isActive("/classrooms") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Available Classrooms
                </Nav.Link>
                <Nav.Link
                  href="/issues"
                  className={`nav-link-custom focus-ring ${isActive("/issues") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Report Issues
                </Nav.Link>
                <Nav.Link
                  href="/security-alerts"
                  className={`nav-link-custom focus-ring ${isActive("/security-alerts") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Security Alarm
                </Nav.Link>
                <Nav.Link
                  href="/donate"
                  className={`nav-link-custom focus-ring ${isActive("/donate") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Donate
                </Nav.Link>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Nav.Link
                  href="/issue-management"
                  className={`nav-link-custom focus-ring ${isActive("/issue-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Issue Management
                </Nav.Link>
                <Nav.Link
                  href="/classroom-management"
                  className={`nav-link-custom focus-ring ${isActive("/classroom-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Classroom Management
                </Nav.Link>
                <Nav.Link
                  href="/security-alerts"
                  className={`nav-link-custom focus-ring ${isActive("/security-alerts") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Security Alert Management
                </Nav.Link>
                <Nav.Link
                  href="/user-management"
                  className={`nav-link-custom focus-ring ${isActive("/user-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  User Management
                </Nav.Link>
              </>
            )}

            {user?.role === "superadmin" && (
              <>
                <Nav.Link
                  href="/admin-management"
                  className={`nav-link-custom focus-ring ${isActive("/admin-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Admin Management
                </Nav.Link>
                <Nav.Link
                  href="/issue-management"
                  className={`nav-link-custom focus-ring ${isActive("/issue-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Issue Management
                </Nav.Link>
                <Nav.Link
                  href="/classroom-management"
                  className={`nav-link-custom focus-ring ${isActive("/classroom-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Classroom Management
                </Nav.Link>
                <Nav.Link
                  href="/security-alerts"
                  className={`nav-link-custom focus-ring ${isActive("/security-alerts") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  Security Alert Management
                </Nav.Link>
                <Nav.Link
                  href="/user-management"
                  className={`nav-link-custom focus-ring ${isActive("/user-management") ? "active fw-bold text-decoration-underline" : ""}`}
                >
                  User Management
                </Nav.Link>
              </>
            )}

            {user?.role === "security" && (
              <Nav.Link
                href="/security-alerts"
                className={`nav-link-custom focus-ring ${isActive("/security-alerts") ? "active fw-bold text-decoration-underline" : ""}`}
              >
                Security Alert Management
              </Nav.Link>
            )}

            {user?.role === "maintenance" && (
              <Nav.Link
                href="/issue-management"
                className={`nav-link-custom focus-ring ${isActive("/issue-management") ? "active fw-bold text-decoration-underline" : ""}`}
              >
                Issue Management
              </Nav.Link>
            )}

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-font-size"
                size="sm"
                title="Adjust font size for accessibility"
                tabIndex={0}
                className="focus-ring"
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
                  className="focus-ring"
                >
                  Small
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeFontSize("medium")}
                  active={fontSize === "medium"}
                  className="focus-ring"
                >
                  Medium
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeFontSize("large")}
                  active={fontSize === "large"}
                  className="focus-ring"
                >
                  Large
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-avatar"
                className="p-0 border-0 focus-ring"
                tabIndex={0}
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
                    <Dropdown.Item href="/profile" className="focus-ring">Profile</Dropdown.Item>
                  </>
                )}
                <Dropdown.Item onClick={toggleTheme} className="focus-ring">
                  Toggle {theme === "light" ? "Dark" : "Light"} Mode
                </Dropdown.Item>
                <Dropdown.Divider />
                {!user ? (
                  <Dropdown.Item href="/login" className="focus-ring">Login</Dropdown.Item>
                ) : (
                  <Dropdown.Item onClick={handleLogout} className="focus-ring">
                    Logout
                  </Dropdown.Item>
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
