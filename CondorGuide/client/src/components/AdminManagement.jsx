import React, { useEffect, useState, useContext } from "react";
import { Container, Table, Button, Dropdown } from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";
import { User, Trash2, Edit } from "lucide-react";
import axios from "axios";

// Roles array
const roles = ['user', 'security', 'maintenance', 'admin', 'superadmin'];

const UserManagement = () => {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);

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

  const deleteUser = async (email) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/delete`, { data: { email } });
        setUsers(prev => prev.filter(user => user.email !== email));
      } catch {
        alert("Failed to delete user");
      }
    }
  };

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
                <th className="px-4 py-3 text-center" style={{ fontWeight: 600, borderBottom: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`, minWidth: "200px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "transparent" }}>
              {users.map(user => (
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
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center"
                        style={{ fontWeight: 500 }}
                        onClick={() => deleteUser(user.email)}
                      >
                        <Trash2 size={16} className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </main>
  );
};

export default UserManagement;