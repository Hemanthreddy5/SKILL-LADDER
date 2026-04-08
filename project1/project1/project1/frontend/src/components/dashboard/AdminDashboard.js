import React from "react";
import AdminPanel from "./AdminPanel";

export default function AdminDashboard({ user }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-blue-700 py-12">
      <div className="glass-card max-w-4xl w-full p-8 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-blue-200 mb-4">Admin Dashboard</h2>
        <div className="mb-6 text-lg text-white/80">Welcome, <span className="font-semibold text-blue-100">{user.email}</span>!</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* User Monitoring Card */}
          <div className="glass p-6 rounded-2xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-bold text-blue-100 mb-2">Monitor Users</h3>
            <div className="text-white/70">View and manage all platform users.</div>
          </div>
          {/* Interview Management Card */}
          <div className="glass p-6 rounded-2xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-bold text-blue-100 mb-2">Manage Interviews</h3>
            <div className="text-white/70">Schedule and oversee interviews for all roles.</div>
          </div>
          {/* Edit Platform Info Card */}
          <div className="glass p-6 rounded-2xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-bold text-blue-100 mb-2">Edit Platform Info</h3>
            <div className="text-white/70">Modify platform-wide settings and content.</div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-lg animate-fadeIn">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
