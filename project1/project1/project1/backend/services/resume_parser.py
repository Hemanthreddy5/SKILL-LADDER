import os
import io
import re
from PyPDF2 import PdfReader
from typing import List, Dict, Any, Set, Tuple

class ResumeParser:
    def __init__(self):
        # A simplified, comprehensive, categorized skill taxonomy for professional indexing.
        self.taxonomy = self._get_massive_taxonomy()

    def _get_massive_taxonomy(self) -> Dict[str, List[str]]:
        """A comprehensive, categorized skill taxonomy for professional indexing."""
        return {
            "Programming Languages": [
                "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "PHP", "Ruby", "Swift", "Kotlin", "Go", 
                "Rust", "Scala", "Perl", "Haskell", "SQL", "R", "MATLAB", "Dart", "Solidity", "Assembly", "VB.NET", "Bash",
                "Cobol", "Fortran", "Lisp", "Prolog", "Objective-C", "Elixir", "Erlang", "F#", "Groovy", "Julia", "Lua", "PowerShell"
            ],
            "Web Frameworks & Libraries": [
                "React", "React.js", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "jQuery", "Bootstrap", 
                "Tailwind CSS", "Redux", "MobX", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", 
                "Ruby on Rails", "Asp.net", "NestJS", "GraphQL", "Material UI", "Chakra UI", "SASS", "LESS", "Webpack",
                "Vite", "Babel", "Gulp", "Prisma", "Sequelize", "TypeORM", "Mongoose", "Socket.io", "Astro"
            ],
            "Industrial Automation and Control": [
                "PLC Programming", "Siemens PLC", "S7 300", "S7 1200", "S7-300", "S7-1200", "OMRON PLC", "Allen Bradley", "AB PLC", "ABB PLC", 
                "SCADA", "HMI", "VFD", "PROFIBUS", "PROFINET", "ASI Communication", "Ladder Diagram", 
                "Functional Block Diagram", "FBD", "WinCC", "Simatic Manager", "CX Programmer", "Keyence", "ASRS Warehouse",
                "Track and Trace", "SEW VFD", "Parameter Setting", "Encoder", "IR Device", "Profibus Coupler",
                "Control Panel Design", "Panel Wiring", "Electrical Load Calculation", "Cable Sizing", "SCADA Integration",
                "Industrial Network Troubleshooting", "Ethernet/IP", "Modbus RTU", "Modbus TCP", "Safety PLC",
                "Emergency System Integration", "Servo Motor", "Motion Control", "PID Control Tuning", "Root Cause Analysis",
                "RCA", "Preventive Maintenance", "Predictive Maintenance", "Energy Management Systems"
            ],
            "Industry 4.0 and Smart Manufacturing": [
                "IIoT", "Industrial Internet of Things", "Digital Twin", "MES", "Manufacturing Execution Systems",
                "OEE", "Overall Equipment Effectiveness", "Data Logging", "Process Optimization", "Remote Monitoring",
                "Barcode System", "RFID Integration", "Industrial Cybersecurity"
            ],
            "Engineering and Maintenance": [
                "Equipment Commissioning", "Site Maintenance", "Troubleshooting", "Production Control", 
                "Material Management", "Procurement", "Client Relationship Management", "Manpower Management",
                "AutoCAD", "EPLAN", "Circuit Breaker", "Bus Bar", "Induction Motor", "Sensors", "Installation",
                "Electrical Installation", "PLC Projects", "Wehrhann AAC Plant", "Contactor", "Relay",
                "Preventive Maintenance", "Corrective Maintenance", "Calibration", "P&ID", "Schematic Reading",
                "BOM Management", "Spare Parts Management", "Quality Control", "Lean Manufacturing Principles"
            ],
            "IT & Networking": [
                "Data Center", "Server Installation", "Storage System", "Network Switches", "Firewall Configuration",
                "RedHat", "CentOS", "Oracle SQL", "MSSQL", "Tomcat", "Web Application Installation",
                "Virtualization", "VMware", "Hyper-V", "Backup & Recovery", "Disaster Recovery",
                "Network Architecture", "Cloud Basics", "AWS Fundamentals", "Azure Fundamentals",
                "Linux Server Hardening", "Database Optimization", "API Integration", "Active Directory", "DNS", "DHCP",
                "VPN Configuration", "Network Monitoring", "Wi-Fi Networks", "VoIP", "SAN", "NAS", "Load Balancing"
            ],
            "Project & Business Management": [
                "Project Planning", "Project Scheduling", "MS Project", "Primavera", "Budget Planning",
                "Cost Control", "Vendor Evaluation", "Technical Negotiation", "Risk Assessment",
                "Mitigation Planning", "KPI Development", "Performance Tracking", "SOP Development",
                "Lean Manufacturing", "Six Sigma", "Kaizen", "Continuous Improvement", "Stakeholder Management",
                "Resource Allocation", "Change Management", "Quality Management", "Procurement Management",
                "Contract Management", "Business Process Improvement", "Strategic Planning", "Market Analysis"
            ],
            "Leadership & Professional": [
                "Leadership", "Decision-Making", "Conflict Resolution", "Cross-Functional Coordination",
                "Technical Training", "Mentoring", "Stakeholder Management", "Change Management",
                "Time Management", "Priority Management", "Presentation Skills", "Reporting Skills",
                "Motivational Leader", "Strategic Thinker", "Team Player", "Innovative", "Communicator",
                "Coaching", "Delegation", "Performance Management", "Emotional Intelligence", "Adaptability",
                "Problem Solving", "Critical Thinking", "Negotiation", "Public Speaking", "Active Listening"
            ]
        }

    def _clean_text(self, text: str) -> str:
        """Strip invisible noise and normalize whitespace."""
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """Simplified text extraction using PyPDF2."""
        text = ""
        if filename.lower().endswith(".pdf"):
            try:
                pdf_reader = PdfReader(io.BytesIO(file_content))
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                print(f"Error extracting PDF with PyPDF2: {e}")
            return self._clean_text(text)
        elif filename.lower().endswith(".docx"):
            # docx processing usually needs python-docx, which is not in requirements
            # Returning empty as it's not supported by PyPDF2
            return ""
        return ""

    def parse_resume(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Simplified parsing pipeline without spacy."""
        if isinstance(file_content, str):
            text = self._clean_text(file_content)
        else:
            text = self.extract_text(file_content, filename)
            
        if not text.strip():
            return {"error": "Document appears empty or unreadable or unsupported format."}
            
        text_lower = text.lower()
        
        # 1. Map skills from taxonomy using simple string matching
        categorized_skills = {}
        all_found = set()
        
        for category, skill_list in self.taxonomy.items():
            found_in_category = []
            for skill in skill_list:
                # Use word boundary search for better accuracy
                if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
                    found_in_category.append(skill)
                    all_found.add(skill)
            if found_in_category:
                categorized_skills[category] = sorted(found_in_category)
        
        # 2. Extract contact info using regex
        email = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        phone = re.findall(r'\(?\+?\d{1,4}?[\s.-]?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,9}', text)
        
        # 3. CGPA & Experience
        cgpa = None
        percentage = None
        cgpa_match = re.search(r'(?:CGPA|GPA|SGPA|Pointer)[\s:]*([0-9]\.?[0-9]{0,2})(?:\/[1]?[0])?', text, re.IGNORECASE)
        if cgpa_match:
            cgpa = cgpa_match.group(1)
            
        perc_match = re.search(r'(\d{2}(?:\.\d{1,2})?)[\s]*(?:%|percent|percentage)', text, re.IGNORECASE)
        if perc_match:
            percentage = perc_match.group(1)
            
        exp_match = re.search(r'(\d+)\+?\s*(?:years|yrs|year)', text, re.IGNORECASE)
        experience = exp_match.group(1) if exp_match else "0"
        
        # 4. Result Formatting
        flat_skills = sorted(list(all_found), key=lambda x: x.lower())
        
        # Unified Academic Score logic
        if cgpa:
            academic_score = cgpa
            score_type = "CGPA"
        elif percentage:
            academic_score = f"{percentage}%"
            score_type = "Percentage"
        else:
            academic_score = "N/A"
            score_type = "Score"
            
        # Scoring logic
        score = 40 + min(60, len(all_found) * 5)

        return {
            "skills": flat_skills,
            "categorized_skills": categorized_skills,
            "contact": {
                "email": email[0] if email else None,
                "phone": phone[0] if phone else None
            },
            "academic_score": academic_score,
            "score_type": score_type,
            "years_of_experience": experience,
            "ats_score": min(100, score),
            "status": "success",
            "filename": filename,
            "text_preview": text[:300].replace('\n', ' ').strip() + "..."
        }

# Singleton
resume_parser = ResumeParser()
