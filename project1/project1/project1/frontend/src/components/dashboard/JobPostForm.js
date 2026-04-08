import React, { useState } from "react";

export default function JobPostForm({ postedJobs, setPostedJobs }) {
  const [form, setForm] = useState({
    company: "",
    location: "",
    salary: "",
    skills: ""
  });
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.company || !form.location || !form.salary || !form.skills) {
      setSuccess("All fields are required.");
      return;
    }
    const newJob = {
      ...form,
      skills: form.skills.split(",").map(s => s.trim()),
      postedAt: new Date().toISOString()
    };
    const updatedJobs = [newJob, ...(postedJobs || [])];
    setPostedJobs(updatedJobs);
    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));
    setForm({ company: "", location: "", salary: "", skills: "" });
    setSuccess("Job posted successfully!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        name="company"
        value={form.company}
        onChange={handleChange}
        placeholder="Company Name"
        className="w-full p-2 rounded bg-gray-800/60 text-white"
      />
      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
        className="w-full p-2 rounded bg-gray-800/60 text-white"
      />
      <input
        name="salary"
        value={form.salary}
        onChange={handleChange}
        placeholder="Salary (e.g. ₹10 LPA)"
        className="w-full p-2 rounded bg-gray-800/60 text-white"
      />
      <input
        name="skills"
        value={form.skills}
        onChange={handleChange}
        placeholder="Skills Required (comma separated)"
        className="w-full p-2 rounded bg-gray-800/60 text-white"
      />
      <button type="submit" className="glass-btn px-4 py-2 mt-2 w-full">Post Job</button>
      {success && <div className="text-green-400 text-sm mt-2">{success}</div>}
    </form>
  );
}
