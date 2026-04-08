import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeRunner from "./CodeRunner";

// Company-specific question banks for distinct mock tests
const COMPANY_QUESTIONS = {
  IBM: [
    { q: "What is IBM's flagship AI platform?", a: "Watson", type: "short" },
    { q: "Which programming language is primarily used for IBM mainframes?", a: "COBOL", type: "mcq", options: ["Java", "COBOL", "Python", "C++"] },
    { q: "What does IBM stand for?", a: "International Business Machines", type: "short" },
    { q: "IBM's cloud platform is called?", a: "IBM Cloud", type: "mcq", options: ["AWS", "Azure", "IBM Cloud", "Google Cloud"] },
    { q: "What is the time complexity of merge sort?", a: "O(n log n)", type: "short" },
    { q: "Python: What does the 'with' statement do?", a: "It simplifies exception handling by encapsulating common preparation and cleanup tasks.", type: "short" },
    { q: "What is memoization in dynamic programming?", a: "Caching results of expensive function calls", type: "short" },
    { q: "Which data structure is best for implementing a priority queue?", a: "Heap", type: "mcq", options: ["Array", "Linked List", "Heap", "Stack"] }
  ],
  Google: [
    { q: "What is Google's mobile operating system?", a: "Android", type: "short" },
    { q: "Which programming language was developed by Google?", a: "Go", type: "mcq", options: ["Python", "Java", "Go", "JavaScript"] },
    { q: "What is Google's cloud platform called?", a: "Google Cloud Platform", type: "short" },
    { q: "What does GCP stand for?", a: "Google Cloud Platform", type: "short" },
    { q: "What is the output of: System.out.println(1 + 2 + \"3\"); in Java?", a: "33", type: "short" },
    { q: "Which data structure is used for BFS traversal?", a: "Queue", type: "mcq", options: ["Stack", "Queue", "Tree", "Heap"] },
    { q: "What is the complexity of Dijkstra's algorithm using a min-heap?", a: "O((V+E) log V)", type: "short" },
    { q: "What is the main advantage of a trie over a hash table?", a: "Efficient prefix search", type: "short" }
  ],
  Amazon: [
    { q: "What is Amazon's cloud service called?", a: "AWS", type: "short" },
    { q: "Which programming language is commonly used for Amazon's backend services?", a: "Java", type: "mcq", options: ["Python", "Java", "C++", "Ruby"] },
    { q: "What does AWS stand for?", a: "Amazon Web Services", type: "short" },
    { q: "Amazon's virtual assistant is called?", a: "Alexa", type: "short" },
    { q: "What is the maximum subarray sum problem called?", a: "Kadane's Algorithm", type: "short" },
    { q: "What does CAP theorem stand for?", a: "Consistency, Availability, Partition tolerance", type: "short" },
    { q: "Which sorting algorithm is stable?", a: "Merge sort", type: "mcq", options: ["Heap sort", "Quick sort", "Merge sort", "Selection sort"] },
    { q: "What is a lambda function in Python?", a: "An anonymous function", type: "short" }
  ],
  Microsoft: [
    { q: "What is Microsoft's cloud platform?", a: "Azure", type: "short" },
    { q: "Which programming language was developed by Microsoft?", a: "C#", type: "mcq", options: ["Java", "Python", "C#", "Go"] },
    { q: "What is Microsoft's productivity suite called?", a: "Office 365", type: "short" },
    { q: "Microsoft's database management system is?", a: "SQL Server", type: "mcq", options: ["MySQL", "PostgreSQL", "SQL Server", "Oracle"] },
    { q: "What is the .NET framework?", a: "A software development platform", type: "short" },
    { q: "Which design pattern ensures a class has only one instance?", a: "Singleton", type: "short" },
    { q: "What is polymorphism in OOP?", a: "The ability of objects to take multiple forms", type: "short" },
    { q: "Time complexity of binary search?", a: "O(log n)", type: "mcq", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"] }
  ]
};

const APTITUDE_QUESTIONS = [
  { q: "What is 12 * 8?", a: "96", type: "short" },
  { q: "If a train travels 60km in 1.5 hours, what is its speed? (km/h)", a: "40", type: "short" },
  { q: "Find the next number: 2, 6, 12, 20, ...", a: "30", type: "short" },
  { q: "Which of the following is a prime number?", a: "13", type: "mcq", options: ["12", "13", "14", "15"] },
  { q: "The sum of angles in a triangle is?", a: "180", type: "mcq", options: ["90", "180", "270", "360"] },
  { q: "The sky is blue. True or False?", a: "True", type: "tf" },
  { q: "If 5x = 20, what is x?", a: "4", type: "short" },
  { q: "What is the average of 10, 20, 30, 40, 50?", a: "30", type: "short" },
  { q: "A man buys 5 pens for ₹50. Cost per pen?", a: "10", type: "short" },
  { q: "Simplify: 3/4 + 1/8", a: "7/8", type: "short" },
  { q: "What is 15% of 200?", a: "30", type: "short" },
  { q: "Ratio of 2:3 equals fraction?", a: "2/3", type: "short" },
  { q: "Compound interest is interest on?", a: "principal and accumulated interest", type: "short" },
  { q: "Speed = Distance/Time. If D=120km, T=3h, Speed?", a: "40", type: "short" },
  { q: "Solve: 9^2 - 7^2", a: "32", type: "short" },
  { q: "LCM of 6 and 8?", a: "24", type: "short" },
  { q: "HCF of 18 and 24?", a: "6", type: "short" },
];

const REASONING_QUESTIONS = [
  { q: "Find the odd one out: Apple, Banana, Carrot, Mango", a: "Carrot", type: "mcq", options: ["Apple", "Banana", "Carrot", "Mango"] },
  { q: "If CAT is coded as DBU, then DOG is coded as?", a: "EPH", type: "short" },
  { q: "Complete the series: A, C, F, J, O, ?", a: "U", type: "short" },
  { q: "Which direction is opposite to South-East?", a: "North-West", type: "mcq", options: ["North-East", "North-West", "South-West", "South-East"] },
  { q: "If all roses are flowers and some flowers are red, then some roses are red. True?", a: "Cannot be concluded", type: "mcq", options: ["True", "False", "Cannot be concluded", "None"] },
  { q: "Arrange by height: P>Q, R<S, P<S, Who is tallest?", a: "S", type: "short" },
  { q: "Mirror image of 'b' looks like?", a: "d", type: "short" },
  { q: "If today is Monday, what day is 100 days later?", a: "Wednesday", type: "short" },
  { q: "Which does not belong: Circle, Triangle, Square, Cube", a: "Cube", type: "mcq", options: ["Circle", "Triangle", "Square", "Cube"] },
  { q: "If 2 means '+', 3 means '-', 4 means '×', then 8 4 2 3 2 = ?", a: "14", type: "short" },
  { q: "Blood relation: A is B's mother, B is C's sister. A is to C?", a: "Grandmother or Mother (insufficient info)", type: "short" },
  { q: "Statement: Some cats are dogs. Conclusion: Some dogs are cats.", a: "True", type: "mcq", options: ["True", "False"] },
  { q: "Coding: If SUN = TVO, then MOON = ?", a: "NPP O", type: "short" },
  { q: "Analogies: Hand:Glove :: Foot:?", a: "Sock", type: "short" },
  { q: "Series: 1, 4, 9, 16, ?", a: "25", type: "short" },
  { q: "Direction: Facing North, turn right, right, left. Now facing?", a: "South", type: "short" },
  { q: "Odd one: Twitter, Facebook, Instagram, Chrome", a: "Chrome", type: "short" },
  { q: "Complete: BA, DC, FE, HG, ?", a: "JI", type: "short" },
  { q: "If ALL=27 and DOG=26, then CAT=?", a: "24", type: "short" },
  { q: "Shadow of a pole at noon points?", a: "North or none (short)", type: "short" }
];

const PROGRAMMING_QUESTIONS = [
  { q: "What does '===' mean in JavaScript?", a: "strict equality", type: "short" },
  { q: "What is the output of: print(len('hello')) in Python?", a: "5", type: "short" },
  { q: "Which data structure uses FIFO?", a: "queue", type: "mcq", options: ["stack", "queue", "tree", "graph"] },
  { q: "What is the time complexity of binary search?", a: "O(log n)", type: "mcq", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"] },
  { q: "What keyword is used to define a function in Python?", a: "def", type: "short" },
  { q: "HTML stands for HyperText Markup Language. True or False?", a: "True", type: "tf" },
];

const MNC_ADVANCED_APTITUDE = [
  { topic: "LCM & HCF", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of LCM & HCF. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to LCM & HCF. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Mixtures & Alligation", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Mixtures & Alligation. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Mixtures & Alligation. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Time & Work (Men–Days)", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Time & Work (Men–Days). The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Time & Work (Men–Days). 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Ratio & Proportion", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Ratio & Proportion. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Ratio & Proportion. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Roots & Surds", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Roots & Surds. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Roots & Surds. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Blood Relations", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Blood Relations. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Blood Relations. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Directions", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Directions. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Directions. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Mensuration", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Mensuration. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Mensuration. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Trigonometry", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Trigonometry. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Trigonometry. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Data Interpretation", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Data Interpretation. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Data Interpretation. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" },
  { topic: "Logical Reasoning", q: "A multinational corporation is conducting a high-level recruitment assessment. This problem is designed to evaluate a candidate’s analytical ability, structured reasoning, quantitative interpretation, and multi-step logical processing skills. In this case, the scenario revolves around the concept of Logical Reasoning. The situation involves multiple variables interacting simultaneously under constrained operational conditions. The candidate must carefully interpret ratios, quantities, dependencies, and implied relationships before applying appropriate formulas and reasoning techniques. The question integrates real-world corporate-style problem solving where multiple departments, operational cycles, or individuals interact over time. Numerical values are structured in such a way that shortcuts may lead to incorrect conclusions unless fundamental principles are clearly applied. You are required to: 1. Identify the correct mathematical or logical framework relevant to Logical Reasoning. 2. Break the scenario into sequential solvable components. 3. Compute intermediate values accurately. 4. Arrive at the final result after validating assumptions. All calculations must be precise. Assume standard mathematical constants wherever necessary. Choose the most appropriate answer from the following options:", options: ["Option 1", "Option 2", "Option 3", "Option 4"], a: "Option 1", type: "mcq" }
];

// Generate 50 questions by repeating the set with unique indices
const FULL_MNC_SET = Array.from({ length: 50 }, (_, i) => {
  const baseQ = MNC_ADVANCED_APTITUDE[i % MNC_ADVANCED_APTITUDE.length];
  return {
    ...baseQ,
    id: i + 1,
    q: `Question ${i + 1} (${baseQ.topic}): ${baseQ.q}`
  };
});

function getRandomQuestions(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function ProcturedExam() {
  // Get exam data from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const company = urlParams.get('company') || 'General';
  const jobTitle = urlParams.get('jobTitle') || 'Position';
  const userEmail = urlParams.get('userEmail') || '';
  const mode = urlParams.get('mode') || '';

  // Permission states
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // Debug info to help diagnose “blank video” issues.
  const [videoDebug, setVideoDebug] = useState(null);

  // Video stream
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const attachStreamToVideo = useCallback(() => {
    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;

    // Some browsers may return tracks in a disabled state after view changes.
    stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });

    // Re-attach only when needed; resetting srcObject causes visible flicker.
    video.muted = true;
    video.autoplay = true;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const videoTracks = stream.getVideoTracks ? stream.getVideoTracks() : [];
    const videoTrack = videoTracks[0];
    setVideoDebug({
      srcObjectSet: video.srcObject === stream,
      videoReadyState: video.readyState,
      videoTrackExists: !!videoTrack,
      videoTrackEnabled: videoTrack?.enabled,
      videoTrackReadyState: videoTrack?.readyState,
      videoTrackCount: videoTracks.length
    });

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        // Helpful when debugging “blank video even though camera permission was granted”.
        console.error("video.play() failed:", err);
      }
    };

    const onMeta = () => {
      tryPlay();
      video.removeEventListener("loadedmetadata", onMeta);
    };

    if (video.readyState >= 2) tryPlay();
    video.addEventListener("loadedmetadata", onMeta);
  }, [setVideoDebug]);

  // Attach the acquired stream to the video element *after* it mounts.
  // (The permissions screen doesn't render the <video>, so assigning srcObject
  // inside requestPermissions can be too early and leaves a blank feed.)
  useEffect(() => {
    if (!hasPermissions) return;
    attachStreamToVideo();

    // Retry a few times to handle timing/paint delays where the <video>
    // element appears slightly after permissions were granted.
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      attachStreamToVideo();
      if (tries >= 10) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [hasPermissions, attachStreamToVideo]);

  // Proctoring states
  const [audioLevel, setAudioLevel] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Exam states
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // When the UI swaps the <video> element (ready screen -> exam screen),
  // ensure the already-created stream is attached once for the new node.
  useEffect(() => {
    if (!hasPermissions) return;

    attachStreamToVideo();

    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      attachStreamToVideo();
      if (tries >= 6) clearInterval(id); // ~1.2s retry window
    }, 200);

    return () => clearInterval(id);
  }, [hasPermissions, examStarted, attachStreamToVideo]);

  // Questions
  const [questions, setQuestions] = useState([]);

  // Initialize company-specific questions
  useEffect(() => {
    // SPECIAL MODE: MNC Advanced Aptitude Practice Set (50 Questions)
    if (mode === 'aptitude_reasoning_30' || mode === 'mnc_aptitude_50' || company === 'MNC') {
      setQuestions(FULL_MNC_SET);
      return;
    }

    let companyQs = [];
    if (company && COMPANY_QUESTIONS[company]) {
      companyQs = COMPANY_QUESTIONS[company];
    } else {
      companyQs = [
        ...APTITUDE_QUESTIONS.slice(0, 4),
        ...PROGRAMMING_QUESTIONS.slice(0, 4)
      ];
    }
    const selectedQuestions = getRandomQuestions(companyQs, 5);
    setQuestions(selectedQuestions.map(q => ({ ...q, typeGroup: 'company' })));
  }, [company, mode]);

  // Proctoring: Tab visibility & blur detection
  useEffect(() => {
    if (!examStarted || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("Tab switch detected! This incident has been logged.");
      }
    };

    const handleBlur = () => {
      addWarning("Window focus lost! Stay on the exam screen.");
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted, submitted, warningCount]);

  const addWarning = (msg) => {
    setWarningMessage(msg);
    setShowWarning(true);
    setWarningCount(prev => prev + 1);

    // Auto-hide warning after 3s
    setTimeout(() => setShowWarning(false), 3000);

    // Auto-submit if too many warnings
    if (warningCount >= 5) {
      alert("Too many proctoring violations. The exam will be submitted automatically.");
      handleSubmitExam();
    }
  };

  // Timer effect
  useEffect(() => {
    if (!examStarted || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-move to next question when time runs out
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(curr => curr + 1);
            return 60;
          } else {
            // Auto-submit if it's the last question
            handleSubmitExam();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, submitted, currentQuestion, questions.length]);

  // Request camera and microphone permissions
  const requestPermissions = async () => {
    setIsRequestingPermissions(true);
    setPermissionError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Audio Monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      setHasPermissions(true);
      setPermissionError('');
    } catch (error) {
      console.error('Permission denied:', error);
      setPermissionError('Camera and microphone access is required to start the exam. Please allow permissions and try again.');
      setHasPermissions(false);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // Start mock test
  const startExam = () => {
    if (!hasPermissions) {
      setPermissionError('Please grant camera and microphone permissions first.');
      return;
    }
    setExamStarted(true);
    setTimeLeft(60);

    // The exam UI swaps to a different <video>. Schedule an attach/play as
    // soon as the new node is painted.
    requestAnimationFrame(() => attachStreamToVideo());

    // Request Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.log("Fullscreen request failed");
    }
  };

  // Handle answer change
  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
      setTimeLeft(60);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
      setTimeLeft(60);
    }
  };

  // Submit mock test
  const handleSubmitExam = () => {
    setSubmitted(true);
    const totalQuestions = questions.length;
    let score = 0;
    questions.forEach((q, idx) => {
      const answer = String(answers[idx] ?? "").trim().toLowerCase();
      const correct = String(q.a ?? "").trim().toLowerCase();
      if (answer && correct && answer === correct) {
        score += 1;
      }
    });
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Exit Fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Clean up video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Send results to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'MOCK_TEST_COMPLETED',
        data: {
          company,
          jobTitle,
          userEmail,
          answers,
          score,
          totalQuestions,
          percentage,
          violations: warningCount,
          completedAt: new Date().toISOString()
        }
      }, '*');
    }

    // Auto-close after 3 seconds
    setTimeout(() => {
      window.close();
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Prevent tab close/refresh during mock test
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStarted && !submitted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your mock test progress will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted, submitted]);

  if (!hasPermissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Proctored Mock Test</h1>
            <p className="text-gray-600 mb-4">{jobTitle} @ {company}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This mock test requires camera and microphone access for proctoring purposes.
              Your video will be monitored during the test to ensure integrity.
            </p>
            {permissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{permissionError}</p>
              </div>
            )}
          </div>

          <button
            onClick={requestPermissions}
            disabled={isRequestingPermissions}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRequestingPermissions ? 'Requesting Permissions...' : 'Grant Camera & Microphone Access'}
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start Mock Test</h1>
            <p className="text-gray-600 mb-4">{jobTitle} @ {company}</p>
          </div>

          <div className="mb-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-32 bg-gray-200 rounded-lg object-cover"
            />
            <p className="text-sm text-gray-600 mt-2">Camera is active and ready</p>
            {videoDebug && (
              <p className="text-[10px] text-gray-600 mt-1">
                debug: srcObject={String(videoDebug.srcObjectSet)} trackCount={videoDebug.videoTrackCount} trackEnabled={String(videoDebug.videoTrackEnabled)} trackReady={videoDebug.videoTrackReadyState} videoReady={videoDebug.videoReadyState}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Mock Test Instructions:</h3>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              <li>• {questions.length} questions total</li>
              <li>• 60 seconds per question</li>
              <li>• Audio & Video proctoring active</li>
              <li>• Tab switching will trigger warnings</li>
              <li>• Fullscreen mode is mandatory</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Start Proctored Exam
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mock Test Completed!</h1>
          <p className="text-gray-600 mb-4">Your answers have been submitted successfully.</p>
          <div className="p-4 bg-gray-50 rounded-lg mb-4 text-sm text-gray-600">
            Incidents logged: {warningCount}
          </div>
          <p className="text-sm text-gray-500">This window will close automatically in a few seconds.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold border-2 border-white">
            ⚠️ {warningMessage}
          </div>
        </div>
      )}

      {/* Header with timer and video */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {company === 'MNC' ? 'MNC-Level Advanced Aptitude Practice Set' : `${company} Mock Test`}
            </h1>
            <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Audio Level Indicator */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-600 mb-1">Voice</p>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${audioLevel > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(audioLevel * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Timer */}
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
              }`}>
              {timeLeft}s
            </div>

            {/* Video feed */}
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-32 h-24 bg-gray-200 rounded-lg object-cover border-2 border-blue-300 shadow-md"
              />
              <p className="text-[10px] text-red-500 font-bold mt-1">● REC LIVE</p>
              {videoDebug && (
                <p className="text-[10px] text-gray-600 mt-1">
                  debug: srcObject={String(videoDebug.srcObjectSet)} trackCount={videoDebug.videoTrackCount} trackEnabled={String(videoDebug.videoTrackEnabled)} trackReady={videoDebug.videoTrackReadyState} videoReady={videoDebug.videoReadyState}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-800 leading-relaxed mb-6">
            {currentQ.q}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => (
              <label key={idx} className={`flex items-center gap-3 p-4 border rounded-xl transition-all cursor-pointer ${answers[currentQuestion] === option
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-5 h-5 text-indigo-600"
                />
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Previous
          </button>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium mr-4">
              <span>Violations: {warningCount}</span>
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg font-bold"
              >
                Submit Final Exam
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg font-bold"
              >
                Save & Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
