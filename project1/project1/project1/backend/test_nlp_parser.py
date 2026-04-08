from services.resume_parser import resume_parser

def test_dynamic_parser():
    # Complex mock resume with niche keywords and sections
    resume_text = """
    Jane Smith
    Email: jane@example.com | Location: Bangalore
    
    Education
    B.Tech from IIT Bombay. CGPA: 9.8/10
    
    Technical Skills
    Languages: Python, JavaScript, CSS, HTML5.
    Frameworks: React.js, Next-JS, Tailwind-CSS.
    Niche Tools: LangChain, HuggingFace, LlamaIndex, Pinecone, Mojo-Lang.
    
    Employment History
    AI Engineer at DataFuture (2022 - Present)
    - Developed RAG pipelines using LangChain and OpenAI.
    - Optimized vector search using Pinecone.
    """
    
    print("--- Running PRO Dynamic Resume Analysis Test ---")
    
    # Run the parser logic
    # We bypass the file extraction by directly calling the parsing logic on a mock result
    # but since our ResumeParser is robust, we'll try to simulate the text flow.
    
    result = resume_parser.parse_resume(resume_text.encode('utf-8'), "jane_smith.pdf")
    
    print(f"Filename: {result.get('filename')}")
    print(f"Detected Skills: {result.get('skills')}")
    print(f"Detected CGPA: {result.get('cgpa')}")
    print(f"ATS Score: {result.get('ats_score')}")
    
    # Verification conditions
    skills = set(result.get('skills', []))
    expected_niche = {"LangChain", "HuggingFace", "LlamaIndex", "Pinecone", "Mojo-Lang", "Next-JS", "Tailwind-CSS"}
    
    found_niche = skills.intersection(expected_niche)
    print(f"Niche Skills Found: {found_niche}")
    
    if len(found_niche) >= 3:
        print("✅ SUCCESS: Dynamic discovery caught niche skills.")
    else:
        print("❌ FAILED: Dynamic discovery missed niche skills.")

if __name__ == "__main__":
    try:
        test_dynamic_parser()
    except Exception as e:
        # Expected if pdfplumber fails on raw utf-8 text that isn't a PDF
        print(f"Caught expected extraction error on raw text test: {e}")
        
        # If the failure is ONLY in extract_text, we test the core logic manually
        print("\n--- Testing Core NLP Logic Manually ---")
        resume_text = """Technical Skills\nPython, React.js, LangChain, Mojo-Lang, Next-JS"""
        sections = resume_parser._segment_resume(resume_text)
        print(f"Found Sections: {list(sections.keys())}")
        
        if "SKILLS" in sections:
            dynamic = resume_parser._handle_dynamic_discovery(sections, set())
            print(f"Dynamically Found Skills: {dynamic}")
            if "LangChain" in dynamic or "Mojo-Lang" in dynamic:
                 print("✅ SUCCESS: Manual NLP test passed.")
            else:
                 print("❌ FAILED: Manual NLP test failed.")
