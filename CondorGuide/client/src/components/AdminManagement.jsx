import React, { useEffect, useState, useContext } from "react";
import { Container, Table, Button, Dropdown } from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";
import { User, Edit } from "lucide-react"; // Removed Trash2 since we're replacing Delete
import axios from "axios";

// Roles array
const roles = ['user', 'security', 'maintenance', 'admin', 'superadmin'];

const UserManagement = () => {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/users`)
      .then(res => setUsers(res.data.filter(user => user.role !== 'superadmin')))
      .catch(err => console.error(err));
  }, []);

  const updateRole = async (email, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/update-role`, { email, role: newRole });
      setUsers(prev =>
        prev.map(user => user.email === email ? { ...user, role: newRole } : user)
      );
    } catch {
      alert("Failed to update role");
    }
  };

  const toggleUserStatus = async (email, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus === 'enable' ? 'disable' : 'enable'} this user?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/delete`, { data: { email } });
        setUsers(prev =>
          prev.map(user =>
            user.email === email ? { ...user, status: currentStatus === 'enable' ? 'disable' : 'enable' } : user
          )
        );
      } catch {
        alert("Failed to toggle user status");
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <main className="py-4 py-md-5" style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
      <Container className="p-3 p-md-4" style={{ backgroundColor: "transparent" }}>
        <div className="text-center mb-4 mb-md-5">
          <h1 className={`display-6 fw-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            User <span style={{ color: "#B68E0C" }}>Management</span>
          </h1>
          <p className={`lead ${theme === "dark" ? "text-light" : "text-muted"}`}>
            Efficiently manage user roles and permissions.
          </p>
        </div>

        <div className="table-responsive" style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table
            className={`border-0 rounded-3 overflow-hidden ${theme === "dark" ? "table-dark" : "table-light"}`}
            style={{ backgroundColor: "#fff", minWidth: "600px" }}
          >
            <thead style={{ background: theme === "dark" ? "#222" : "#f1f3f5", color: theme === "dark" ? "#fff" : "#333" }}>
              <tr>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "200px" }}>
                  Email
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Role
                </th>
                <th className="px-4 py-3 text-start" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "150px" }}>
                  Status
                </th>
                <th className="px-4 py-3 text-center" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "200px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "transparent" }}>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center" style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr
                    key={user.email}
                    style={{
                      borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                      backgroundColor: "transparent"
                    }}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="d-flex align-items-center">
                        <User size={18} className="me-2" style={{ color: "#B68E0C" }} />
                        <span className={theme === "dark" ? "text-white" : "text-black"} style={{ wordBreak: "break-all" }}>
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${theme === "dark" ? "#fff" : "#333"}`,
                          color: theme === "dark" ? "#fff" : "#333",
                          fontSize: "0.9rem"
                        }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: user.status === 'enable' ? '#d4edda' : '#f8d7da',
                          border: `1px solid ${user.status === 'enable' ? '#c3e6cb' : '#f5c6cb'}`,
                          color: user.status === 'enable' ? '#155724' : '#721c24',
                          fontSize: "0.9rem"
                        }}
                      >
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline"
                            size="sm"
                            className="d-flex align-items-center"
                            style={{
                              borderColor: "#B68E0C",
                              color: "#B68E0C",
                              fontWeight: 500
                            }}
                          >
                            <Edit size={16} className="me-1" />
                            Edit Role
                          </Dropdown.Toggle>
                          <Dropdown.Menu
                            className={theme === "dark" ? "bg-dark border-dark" : "bg-white border-light"}
                            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                          >
                            {roles.filter(role => role !== 'superadmin').map((role, idx) => (
                              <Dropdown.Item
                                key={idx}
                                className={theme === "dark" ? "text-white" : "text-black"}
                                active={user.role === role}
                                onClick={() => updateRole(user.email, role)}
                                style={{ fontWeight: 500 }}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                        <Button
                          variant={user.status === 'enable' ? 'outline-danger' : 'outline-success'}
                          size="sm"
                          className="d-flex align-items-center"
                          style={{ fontWeight: 500 }}
                          onClick={() => toggleUserStatus(user.email, user.status)}
                        >
                          {user.status === 'enable' ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  style={{
                    backgroundColor: currentPage === i + 1 ? "#B68E0C" : "transparent",
                    color: currentPage === i + 1 ? "#fff" : theme === "dark" ? "#fff" : "#333",
                    borderColor: theme === "dark" ? "#444" : "#ddd",
                  }}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </main>
  );
};

export default UserManagement;