import React, { useState, useEffect } from 'react';

export default function JobRecommendations({ user, skills = [], onViewActivities }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [successModal, setSuccessModal] = useState({ open: false, job: null });

  // Job categories
  const categories = [
    { id: 'all', name: 'All Jobs', icon: '💼' },
    { id: 'software', name: 'Software Development', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'design', name: 'UI/UX Design', icon: '🎨' },
    { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'product', name: 'Product Management', icon: '📋' },
    { id: 'internship', name: 'Internships', icon: '🎓' }
  ];

  // No seeded sample jobs. Show only provider-posted jobs from backend.
  const sampleJobs = [];

  useEffect(() => {
    const guessCategory = (job) => {
      const title = (job.title || '').toLowerCase();
      if (title.includes('intern')) return 'internship';
      if (title.includes('data') || title.includes('ml') || title.includes('ai')) return 'data';
      if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'design';
      if (title.includes('marketing')) return 'marketing';
      if (title.includes('sales')) return 'sales';
      if (title.includes('product')) return 'product';
      return 'software';
    };

    const mapBackendJob = (j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type || j.job_type || 'Full-time',
      salary: j.salary || j.salary_range || '',
      category: j.category || guessCategory(j),
      skills: Array.isArray(j.skills) ? j.skills : [],
      description: j.description || '',
      postedDate: j.posted_date || j.created_at || '',
      experience: j.experience || '',
      remote: typeof j.remote === 'boolean' ? j.remote : false,
      applicationLimit: j.application_limit ?? null,
      applicationsReceived: j.applications_received ?? 0,
      remainingSlots: j.remaining_slots ?? null,
      deadline: j.deadline || null,
      status: j.status || 'Active'
    });

    const loadJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8001/get_all_jobs');
        if (!response.ok) throw new Error('Backend unavailable');
        const data = await response.json();
        const backendJobs = Array.isArray(data.jobs) ? data.jobs.map(mapBackendJob) : [];

        setJobs(backendJobs);
      } catch (_) {
        // If backend is unavailable, do not inject test data.
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Initialize applied jobs based on localStorage for this user
  useEffect(() => {
    try {
      const existingApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      const userApplied = existingApplied
        .filter(a => a.userEmail === (user?.email || ''))
        .map(a => a.jobId);
      setAppliedJobs(userApplied);
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedCategory, searchTerm, skills]);

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by skill match (if skills are provided)
    if (skills.length > 0) {
      filtered = filtered.map(job => {
        const matchingSkills = job.skills.filter(skill =>
          skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        return {
          ...job,
          skillMatch: matchingSkills.length,
          matchPercentage: (matchingSkills.length / job.skills.length) * 100
        };
      }).sort((a, b) => b.skillMatch - a.skillMatch);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (job) => {
    try {
      if (!user || !user.email) {
        alert('Please login to apply.');
        return;
      }
      if (job.status && job.status !== 'Active') {
        alert(`Applications are ${String(job.status).toLowerCase()} for this job.`);
        return;
      }

      const application = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: Date.now(),
        userEmail: user.email,
        status: 'Applied'
      };

      const existingApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      // Prevent duplicates
      const alreadyApplied = existingApplied.some(a => a.userEmail === user.email && a.jobId === job.id);
      if (alreadyApplied) {
        setAppliedJobs(prev => Array.from(new Set([...prev, job.id])));
        setSuccessModal({ open: true, job });
        return;
      }
      const updated = [...existingApplied, application];
      localStorage.setItem('appliedJobs', JSON.stringify(updated));

      setAppliedJobs(prev => Array.from(new Set([...prev, job.id])));
      setSuccessModal({ open: true, job });

      // Also notify backend so providers can see applications
      try {
        const response = await fetch('http://localhost:8001/apply_job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: job.id, user_email: user.email })
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.detail || 'Could not apply for this job.');
        }
      } catch (_) {}
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Error applying to job. Please try again.');
    }
  };

  const getSkillMatchColor = (matchPercentage) => {
    if (matchPercentage >= 80) return 'text-emerald-600 bg-emerald-100';
    if (matchPercentage >= 60) return 'text-blue-600 bg-blue-100';
    if (matchPercentage >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-8 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-6">
            Job Recommendations
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Discover personalized opportunities that perfectly match your skills and experience
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl mb-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
              />
              <svg className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl'
                    : 'bg-white/20 text-gray-700 hover:bg-white/30 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="mr-3 text-xl">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
                      <p className="text-xl text-gray-600 font-medium">{job.company}</p>
                      <p className="text-gray-500">{job.location}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                    job.type === 'Internship' ? 'bg-purple-100 text-purple-700' :
                    job.type === 'Full-time' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {job.type}
                  </span>
                  {job.remote && (
                    <span className="block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium">
                      Remote
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">{job.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-white/20 rounded-xl">
                    <span className="text-2xl mr-3">💰</span>
                    <div>
                      <div className="font-semibold text-gray-800">{job.salary}</div>
                      <div className="text-sm text-gray-600">Salary</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-white/20 rounded-xl">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <div className="font-semibold text-gray-800">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}</div>
                      <div className="text-sm text-gray-600">Apply by</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className={`px-3 py-1 rounded-xl font-semibold ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {job.status === 'Active' ? 'Active' : 'Applications Closed'}
                  </span>
                  {job.applicationLimit ? (
                    <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-700 font-semibold">
                      {Math.max(job.remainingSlots ?? (job.applicationLimit - job.applicationsReceived), 0)} applications left
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 font-semibold">
                      {job.applicationsReceived || 0} applications received
                    </span>
                  )}
                </div>
              </div>

              {/* Skill Match */}
              {job.skillMatch !== undefined && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-800">Skill Match</span>
                    <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${getSkillMatchColor(job.matchPercentage)}`}>
                      {job.skillMatch}/{job.skills.length} skills ({Math.round(job.matchPercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-2000 shadow-lg"
                      style={{ width: `${job.matchPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Required Skills */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 rounded-full text-sm font-medium border border-purple-500/30 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(job)}
                disabled={appliedJobs.includes(job.id) || (job.status && job.status !== 'Active')}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                  appliedJobs.includes(job.id) || (job.status && job.status !== 'Active')
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                }`}
              >
                {appliedJobs.includes(job.id) ? 'Applied ✓' : (job.status && job.status !== 'Active' ? 'Applications Closed' : 'Apply Now')}
              </button>
            </div>
          ))}
        </div>

        {/* Success Modal */}
        {successModal.open && successModal.job && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-slideUp">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Successfully Applied!</h3>
              <p className="text-center text-gray-600 mb-6">You applied to <b>{successModal.job.title}</b> at <b>{successModal.job.company}</b>. You can view this in Activities.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessModal({ open: false, job: null })}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="flex-1 text-center py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700"
                  onClick={() => {
                    setSuccessModal({ open: false, job: null });
                    if (typeof onViewActivities === 'function') {
                      onViewActivities();
                    }
                  }}
                >
                  View Activities
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No jobs found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
