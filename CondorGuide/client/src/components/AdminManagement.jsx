import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/users") // fetch all users
      .then(res => setUsers(res.data.filter(user => user.role !== 'superadmin')))
      .catch(err => console.error(err));
  }, []);

  const updateRole = async (email, newRole) => {
    try {
      await axios.put("http://localhost:5000/api/users/update-role", { email, role: newRole });
      setUsers(prev =>
        prev.map(user => user.email === email ? { ...user, role: newRole } : user)
      );
    } catch (error) {
      alert("Failed to update role"); // Keeping original alert as requested
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center p-4">Admin Management</h1>
        
        <div className="overflow-x-auto d-flex justify-content-center rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-black text-sm font-medium uppercase tracking-wider rounded-tl-lg">
                  Email
                </th>
                <th scope="col" className="px-5 py-3 text-left text-black text-sm font-medium uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-5 py-3 text-center text-black text-sm font-medium uppercase tracking-wider rounded-tr-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.email} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-5 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-5 py-2 whitespace-nowrap text-sm text-gray-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-2 whitespace-nowrap text-center text-sm font-medium">
                      {user.role === "admin" ? (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          onClick={() => updateRole(user.email, "user")}
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
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
      </div>
    </div>
  );
}