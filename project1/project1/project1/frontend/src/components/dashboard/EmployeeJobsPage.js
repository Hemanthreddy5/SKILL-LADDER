import React, { useState } from "react";

export default function EmployeeJobsPage({ onAddJob }) {
  const [form, setForm] = useState({
    company: "",
    passedOutYear: "",
    salary: "",
    jobRole: "",
    skills: ""
  });
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.company || !form.passedOutYear || !form.salary || !form.jobRole || !form.skills) {
      setSuccess("All fields are required.");
      return;
    }
    onAddJob({
      ...form,
      skills: form.skills.split(",").map(s => s.trim())
    });
    setSuccess("Job added!");
    setForm({ company: "", passedOutYear: "", salary: "", jobRole: "", skills: "" });
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-300 flex flex-col items-center p-10 animate-glow w-full max-w-lg">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Add Job Details</h2>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <input name="company" value={form.company} onChange={handleChange} placeholder="Company Name" className="w-full p-2 rounded bg-blue-50 border" />
          <input name="passedOutYear" value={form.passedOutYear} onChange={handleChange} placeholder="Passed Out Year" className="w-full p-2 rounded bg-blue-50 border" />
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary (e.g. ₹10 LPA)" className="w-full p-2 rounded bg-blue-50 border" />
          <input name="jobRole" value={form.jobRole} onChange={handleChange} placeholder="Job Role" className="w-full p-2 rounded bg-blue-50 border" />
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full p-2 rounded bg-blue-50 border" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Job</button>
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
}
