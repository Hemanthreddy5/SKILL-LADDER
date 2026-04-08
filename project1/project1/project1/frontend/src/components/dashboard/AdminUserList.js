import React, { useEffect, useState } from "react";

export default function AdminUserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8001/admin/all_users")
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">All Users</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-600">No users found.</div>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">History</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.role}</td>
                <td className="py-2 px-4">{u.history?.length || 0}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => onSelectUser(u.email)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
