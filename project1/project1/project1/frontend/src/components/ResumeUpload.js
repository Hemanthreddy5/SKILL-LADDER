import React, { useRef, useState } from "react";

export default function ResumeUpload({ onResult }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      setError("Please select a PDF resume file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("http://localhost:8001/upload_resume", {
        method: "POST",
        body: formData,
        mode: 'cors'
      });
      if (response.ok && data) {
        onResult(data);
      } else {
        const errorData = data || { error: "Failed to scan resume" };
        setError(errorData.error || "Server error during analysis");
      }
    } catch (err) {
      setError("Connection error: Ensure backend is running on port 8001");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">Resume Screening</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInput}
          onChange={handleFileChange}
          className="mb-4"
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload & Scan Resume"}
        </button>
      </form>
    </div>
  );
}
