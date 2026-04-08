import React from "react";

const JOBS_DB = [
  { title: "Python Developer", company: "TechNova", location: "Remote", salary: "₹12-18 LPA", skills: ["python", "django", "flask"], description: "Build scalable backend services using Python." },
  { title: "Frontend Engineer", company: "WebWorks", location: "Bangalore, India", salary: "₹10-16 LPA", skills: ["react", "javascript", "css", "html"], description: "Develop modern web interfaces with React." },
  { title: "Data Analyst", company: "InsightX", location: "Hyderabad, India", salary: "₹7-12 LPA", skills: ["excel", "sql", "data analysis", "powerbi"], description: "Analyze business data and generate reports." },
  { title: "Machine Learning Engineer", company: "AI Labs", location: "Remote", salary: "₹14-22 LPA", skills: ["python", "machine learning", "tensorflow", "pytorch"], description: "Build ML models and deploy solutions." },
  { title: "DevOps Engineer", company: "CloudOps", location: "Chennai, India", salary: "₹13-19 LPA", skills: ["aws", "docker", "kubernetes", "git"], description: "Manage CI/CD pipelines and cloud infrastructure." },
  { title: "Backend Developer", company: "Appify", location: "Gurgaon, India", salary: "₹11-17 LPA", skills: ["nodejs", "express", "mongodb"], description: "Develop REST APIs and manage databases." },
  { title: "Full Stack Developer", company: "StackMinds", location: "Pune, India", salary: "₹13-20 LPA", skills: ["react", "nodejs", "sql"], description: "Work on both frontend and backend systems." },
  { title: "QA Engineer", company: "TestRight", location: "Noida, India", salary: "₹8-13 LPA", skills: ["selenium", "cypress", "testing"], description: "Automate and execute test cases for web apps." },
  { title: "Cloud Engineer", company: "Cloudify", location: "Remote", salary: "₹12-18 LPA", skills: ["aws", "azure", "gcp"], description: "Manage cloud deployments and services." },
  { title: "Android Developer", company: "AppGenix", location: "Mumbai, India", salary: "₹10-15 LPA", skills: ["android", "kotlin", "java"], description: "Develop native Android applications." },
  { title: "iOS Developer", company: "iTechies", location: "Delhi, India", salary: "₹10-16 LPA", skills: ["swift", "ios", "objective-c"], description: "Build and maintain iOS mobile apps." },
  { title: "UI/UX Designer", company: "DesignHub", location: "Remote", salary: "₹9-14 LPA", skills: ["figma", "sketch", "adobe xd"], description: "Design user interfaces and experiences." },
  { title: "Product Manager", company: "Prodigy", location: "Bangalore, India", salary: "₹18-28 LPA", skills: ["product", "agile", "scrum"], description: "Lead product development and strategy." },
  { title: "Business Analyst", company: "BizAnalytics", location: "Hyderabad, India", salary: "₹8-14 LPA", skills: ["excel", "sql", "requirements"], description: "Gather requirements and analyze business needs." },
  { title: "Cybersecurity Analyst", company: "SecureNet", location: "Remote", salary: "₹13-19 LPA", skills: ["security", "network", "firewall"], description: "Monitor and secure IT infrastructure." },
  { title: "Network Engineer", company: "NetConnect", location: "Chennai, India", salary: "₹9-13 LPA", skills: ["network", "cisco", "routing"], description: "Maintain and troubleshoot network systems." },
  { title: "Database Administrator", company: "DataSafe", location: "Pune, India", salary: "₹11-16 LPA", skills: ["mysql", "postgresql", "oracle"], description: "Manage and optimize database systems." },
  { title: "Content Writer", company: "WriteWise", location: "Remote", salary: "₹5-10 LPA", skills: ["writing", "seo", "content"], description: "Create and edit technical content." },
  { title: "Salesforce Developer", company: "CRMPro", location: "Gurgaon, India", salary: "₹12-18 LPA", skills: ["salesforce", "apex", "crm"], description: "Customize and maintain Salesforce solutions." },
  { title: "Game Developer", company: "PlayForge", location: "Bangalore, India", salary: "₹10-16 LPA", skills: ["unity", "c#", "game design"], description: "Develop and deploy interactive games." },
  { title: "Embedded Systems Engineer", company: "EmbedTech", location: "Hyderabad, India", salary: "₹11-15 LPA", skills: ["embedded", "c", "microcontroller"], description: "Design and program embedded devices." },
  { title: "Digital Marketing Specialist", company: "MarketGenius", location: "Delhi, India", salary: "₹7-12 LPA", skills: ["marketing", "seo", "google ads"], description: "Plan and execute digital marketing campaigns." },
  { title: "Operations Manager", company: "OpsFlow", location: "Mumbai, India", salary: "₹15-23 LPA", skills: ["operations", "management", "planning"], description: "Oversee daily business operations." },
  { title: "Blockchain Developer", company: "BlockWorks", location: "Remote", salary: "₹16-25 LPA", skills: ["blockchain", "solidity", "web3"], description: "Develop smart contracts and blockchain apps." },
  { title: "Technical Support Engineer", company: "HelpDeskPro", location: "Kolkata, India", salary: "₹6-9 LPA", skills: ["support", "troubleshooting", "customer"], description: "Provide technical support to clients." },
  { title: "SAP Consultant", company: "SAPify", location: "Pune, India", salary: "₹14-21 LPA", skills: ["sap", "erp", "consulting"], description: "Implement and support SAP solutions." },
  { title: "AI Researcher", company: "DeepThink", location: "Bangalore, India", salary: "₹20-32 LPA", skills: ["ai", "research", "python"], description: "Research and develop AI algorithms." },
  { title: "Systems Administrator", company: "SysOps", location: "Chennai, India", salary: "₹8-13 LPA", skills: ["linux", "windows", "infrastructure"], description: "Maintain and administer IT systems." },
  { title: "E-commerce Manager", company: "ShopEase", location: "Delhi, India", salary: "₹10-18 LPA", skills: ["ecommerce", "management", "marketing"], description: "Manage online sales and operations." },
  { title: "HR Specialist", company: "PeopleFirst", location: "Hyderabad, India", salary: "₹7-11 LPA", skills: ["hr", "recruitment", "onboarding"], description: "Handle HR processes and recruitment." }
];

export default function JobSuggestions({ skills }) {
  if (!skills || skills.length === 0) return null;
  // Suggest jobs where at least one skill matches
  const suggested = JOBS_DB.filter(job => job.skills.some(skill => skills.includes(skill)));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">Job Suggestions</h2>
      {suggested.length === 0 ? (
        <p className="text-gray-600">No matching jobs found for your skills.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {suggested.map((job, idx) => (
            <li key={idx} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-blue-800">{job.title}</h3>
                  <p className="text-gray-600">{job.company} &mdash; {job.location}</p>
                  <p className="text-gray-700 text-sm mt-1">{job.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.skills.map((skill, sidx) => (
                      <span key={sidx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
