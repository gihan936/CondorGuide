import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/users") // fetch all users
      .then(res => setUsers(res.data.filter(user => user.role != 'superadmin')))
      .catch(err => console.error(err));
  }, []);

  const updateRole = async (email, newRole) => {
    try {
      await axios.put("http://localhost:5000/api/users/update-role", { email, role: newRole });
      setUsers(prev =>
        prev.map(user => user.email === email ? { ...user, role: newRole } : user)
      );
    } catch (error) {
      alert("Failed to update role");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Super Admin Panel</h1>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.email} className="border-t">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                {user.role === "admin" ? (
                  <button
                    className="bg-red-500 px-3 py-1 rounded"
                    onClick={() => updateRole(user.email, "user")}
                  >
                    Revoke Admin
                  </button>
                ) : (
                  <button
                    className="bg-green-600 px-3 py-1 rounded"
                    onClick={() => updateRole(user.email, "admin")}
                  >
                    Make Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
