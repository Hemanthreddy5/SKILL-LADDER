import React, { useState, useEffect } from 'react';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';

export default function EmployeeDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    skills: '',
    rounds: '3',
    website: '',
    type: 'Full-time',
    application_limit: '',
    deadline: ''
  });

  useEffect(() => {
    if (user) {
      loadEmployeeData();
    }
  }, [user]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      let fetchedJobs = [];
      let employeeApplications = [];
      let mockResults = [];

      // Load jobs posted by this employee
      const jobsResponse = await fetch(`http://localhost:8001/get_jobs_by_provider?posted_by=${encodeURIComponent(user.email)}`);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        fetchedJobs = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
        setJobs(fetchedJobs);
      }

      // Load all applications for this employee's jobs
      const applicationsResponse = await fetch(`http://localhost:8001/get_job_applications`);
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        const employeeJobIds = fetchedJobs.map(job => job.id);
        const allApplications = Array.isArray(applicationsData.applications) ? applicationsData.applications : [];
        employeeApplications = allApplications.filter(app => 
          employeeJobIds.includes(app.job_id) || employeeJobIds.includes(Number(app.job_id))
        );
        setApplications(employeeApplications);
      }

      // Load mock test results (optional) and keep only applicants for this provider's jobs.
      const mockResultsResponse = await fetch(`http://localhost:8001/get_mock_test_results`);
      if (mockResultsResponse.ok) {
        const mockResultsData = await mockResultsResponse.json();
        const allResults = Array.isArray(mockResultsData.results) ? mockResultsData.results : [];
        const applicantEmails = new Set(employeeApplications.map(app => app.user_email));
        mockResults = allResults.filter((result) => applicantEmails.has(result.user_email));
      }

      const uniqueApplicants = new Set(employeeApplications.map(app => app.user_email)).size;
      const avgMockScore = mockResults.length
        ? Math.round(mockResults.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / mockResults.length)
        : 0;

      const jobApplications = employeeApplications.reduce((acc, app) => {
        const title = app.job_title || `Job ${app.job_id}`;
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      const skillDistribution = fetchedJobs.reduce((acc, job) => {
        const skills = Array.isArray(job.skills) ? job.skills : [];
        skills.forEach((skill) => {
          acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
      }, {});

      // Analytics assembled from fetched data.
      setAnalytics({
        total_jobs: fetchedJobs.length,
        total_applications: employeeApplications.length,
        total_applicants: uniqueApplicants,
        average_mock_score: avgMockScore,
        job_applications: jobApplications,
        skill_distribution: skillDistribution,
        recent_mock_results: mockResults.slice(0, 10)
      });
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const skillsArray = jobForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      const response = await fetch('http://localhost:8001/post_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobForm,
          application_limit: jobForm.application_limit ? Number(jobForm.application_limit) : null,
          skills: skillsArray,
          posted_by: user.email
        })
      });

      if (response.ok) {
        alert('Job posted successfully!');
        setShowJobForm(false);
        setJobForm({
          title: '', company: '', location: '', salary: '', description: '',
          skills: '', rounds: '3', website: '', type: 'Full-time', application_limit: '', deadline: ''
        });
        loadEmployeeData(); // Reload data
      } else {
        const errorData = await response.json();
        alert(`Error posting job: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopApplications = async (jobId) => {
    if (!window.confirm('Stop accepting applications for this job?')) return;
    try {
      const response = await fetch(`http://localhost:8001/stop_job_applications/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posted_by: user.email })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'Unable to stop applications'}`);
        return;
      }
      loadEmployeeData();
    } catch (error) {
      console.error('Error stopping applications:', error);
      alert('Failed to stop applications. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`http://localhost:8001/delete_job/${jobId}?posted_by=${user.email}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Job deleted successfully!');
        loadEmployeeData(); // Reload data
      } else {
        const errorData = await response.json();
        const detail = Array.isArray(errorData?.detail)
          ? (errorData.detail[0]?.msg || 'Validation error')
          : (errorData?.detail || errorData?.message || 'Unable to delete job');
        alert(`Error deleting job: ${detail}`);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleDecision = async (applicationId, decision) => {
    try {
      const response = await fetch('http://localhost:8001/update_application_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: decision,
          posted_by: user.email
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.detail || 'Failed to update application status'}`);
        return;
      }
      alert(`Candidate ${decision} successfully`);
      loadEmployeeData();
    } catch (error) {
      console.error('Error updating application decision:', error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics?.total_jobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics?.total_applications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applicants</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics?.total_applicants || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Mock Score</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics?.average_mock_score || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applications Distribution</h3>
          {analytics?.job_applications && Object.keys(analytics.job_applications).length > 0 ? (
            <PieChart data={analytics.job_applications} />
          ) : (
            <div className="text-center text-gray-500 py-8">No applications yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Distribution</h3>
          {analytics?.skill_distribution && Object.keys(analytics.skill_distribution).length > 0 ? (
            <BarChart data={analytics.skill_distribution} />
          ) : (
            <div className="text-center text-gray-500 py-8">No skills data yet</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderJobUpload = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
        <button
          onClick={() => setShowJobForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Post New Job
        </button>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Post New Job</h3>
              <button
                onClick={() => setShowJobForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bangalore, Remote"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 8-15 LPA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Rounds</label>
                  <input
                    type="number"
                    value={jobForm.rounds}
                    onChange={(e) => setJobForm({...jobForm, rounds: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.application_limit}
                    onChange={(e) => setJobForm({...jobForm, application_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({...jobForm, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required *</label>
                <input
                  type="text"
                  required
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, JavaScript, HTML, CSS (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <textarea
                  required
                  rows="4"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed job description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                <input
                  type="url"
                  value={jobForm.website}
                  onChange={(e) => setJobForm({...jobForm, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://company.com"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Posted Jobs</h3>
        </div>
        <div className="p-6">
          {jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No jobs posted yet</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-gray-600">{job.salary} • {job.type}</p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={job.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                          {job.status || 'Active'}
                        </span>
                      </p>
                      {job.application_limit ? (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Applications:</span>{' '}
                          {job.applications_received || 0}/{job.application_limit}
                          {' '}({job.remaining_slots || 0} left)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Applications Received:</span> {job.applications_received || 0}
                        </p>
                      )}
                      {job.deadline && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-gray-700 mt-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {job.status === 'Active' && (
                        <button
                          onClick={() => handleStopApplications(job.id)}
                          className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
                        >
                          Stop Accepting
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
              </div>
            </div>
          </div>
              ))}
          </div>
          )}
            </div>
          </div>
        </div>
  );

  const renderMonitor = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Monitor Applications & Users</h2>
      
      {/* Applications Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No applications received yet</div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{app.job_title}</h4>
                      <p className="text-gray-600">Applicant: {app.user_email}</p>
                      <p className="text-gray-600">Company: {app.company}</p>
                      <p className="text-gray-500 text-sm">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        app.status === 'selected'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {app.status}
                      </span>
                      {app.status === 'applied' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleDecision(app.id, 'selected')}
                            className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
          </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Test Results */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mock Test Results</h3>
        </div>
        <div className="p-6">
          {analytics?.recent_mock_results && analytics.recent_mock_results.length > 0 ? (
            <div className="space-y-4">
              {analytics.recent_mock_results.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{result.user_email}</h4>
                      <p className="text-gray-600">Subject: {result.subject}</p>
                      <p className="text-gray-500 text-sm">Score: {result.score}/{result.total_questions}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{result.percentage}%</div>
                      <div className="text-sm text-gray-500">
                        {result.percentage >= 80 ? 'Excellent' : 
                         result.percentage >= 60 ? 'Good' : 
                         result.percentage >= 40 ? 'Average' : 'Needs Improvement'}
          </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No mock test results yet</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'jobUpload', name: 'Job Upload', icon: '📝' },
              { id: 'monitor', name: 'Monitor', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'jobUpload' && renderJobUpload()}
              {activeTab === 'monitor' && renderMonitor()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
