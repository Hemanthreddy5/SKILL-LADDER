import React, { useMemo, useState } from "react";

export default function LearningPersonalized() {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState("");
  const [hours, setHours] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Your curated data (exact links & images you provided)
  const catalog = useMemo(
    () => ({
      "C Programming": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/19/C_Logo.png",
        playlists: [
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL",
          },
          {
            channel: "ProgrammingKnowledge",
            link: "https://www.youtube.com/playlist?list=PLS1QulWo1RIaUGP446_pWLgTZPiFizEMq",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=KJgsSFOSQv0",
          },
          {
            channel: "Jenny’s Lectures",
            link: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bEiyPaaH5V8g7KxmnmUr0e",
          },
          {
            channel: "Neso Academy",
            link: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjC2UujKJGU8ZyG9hS3Z1xZ",
          },
        ],
      },
      "C++ Programming": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg",
        playlists: [
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9agKNOsNXoMpFcJ8JGoweL_F",
          },
          {
            channel: "The Cherno",
            link: "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb",
          },
          {
            channel: "ProgrammingKnowledge",
            link: "https://www.youtube.com/playlist?list=PLS1QulWo1RIb9WVQGJ_vh-RQusbZgO_As",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
          },
          {
            channel: "Geeky Shows",
            link: "https://www.youtube.com/playlist?list=PLbGui_ZYuhijgTACCzw6bXXgP1O0nMQyP",
          },
        ],
      },
      Java: {
        image:
          "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
        playlists: [
          {
            channel: "Telusko",
            link: "https://www.youtube.com/playlist?list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3",
          },
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9ahwFDuExCpPFHAK829Wto2O",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=grEKMHGYyns",
          },
          {
            channel: "ProgrammingKnowledge",
            link: "https://www.youtube.com/playlist?list=PLS1QulWo1RIYmaxcEqw5JhK3b-6rt-JkR",
          },
          {
            channel: "BroCode",
            link: "https://www.youtube.com/playlist?list=PLZPZq0r_RZOM0mCHmbEVjT_PUBGx3JjKr",
          },
        ],
      },
      Python: {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
        playlists: [
          {
            channel: "Telusko",
            link: "https://www.youtube.com/playlist?list=PLsyeobzWxl7rtw3YT7d0G9RQ0DtRMi4cR",
          },
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9ah7DDtYtflgwMwpT3xmjXY9",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          },
          {
            channel: "ProgrammingKnowledge",
            link: "https://www.youtube.com/playlist?list=PLS1QulWo1RIb8nY0O0S68f_m4R8D45bma",
          },
          {
            channel: "Amigoscode",
            link: "https://www.youtube.com/playlist?list=PLwvrYc43l1Mxk2zCOcmGQ0bM3n1bw8Tz5",
          },
        ],
      },
      "Data Analytics": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/e/ea/Data_visualization_icon.png",
        playlists: [
          {
            channel: "Ken Jee",
            link: "https://www.youtube.com/playlist?list=PL2zq7klxX5ATMsmyRazei7ZXkP1GHt-vk",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
          },
          {
            channel: "Alex The Analyst",
            link: "https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE-JWJ6r0R8v2ZdD5A4NJd",
          },
          {
            channel: "Krish Naik",
            link: "https://www.youtube.com/playlist?list=PLZoTAELRMXVPB9dMaqgKV1pa4ZLlr4UHH",
          },
          {
            channel: "Luke Barousse",
            link: "https://www.youtube.com/playlist?list=PLVfyj7U8VQfR_iILR3dgsKxnfsZ1uLQeR",
          },
        ],
      },
      "Cyber Security": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cyber_Security_Icon.png",
        playlists: [
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=inWWhr5tnEA",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
          },
          {
            channel: "NetworkChuck",
            link: "https://www.youtube.com/playlist?list=PLDQaRcbiSnqF5U8ffMgZzSdbMwl80r5n_",
          },
          {
            channel: "The Cyber Mentor",
            link: "https://www.youtube.com/playlist?list=PLBf0hzazHTGOepimcI8xVwqKk5zwt9aAy",
          },
          {
            channel: "HackerSploit",
            link: "https://www.youtube.com/playlist?list=PLBf0hzazHTGNcJm_gGbx6KJM_cjDcvxmv",
          },
        ],
      },
      "Machine Learning": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/44/Machine_learning.png",
        playlists: [
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=7eh4d6sabA0",
          },
          {
            channel: "Krish Naik",
            link: "https://www.youtube.com/playlist?list=PLZoTAELRMXVNJkSgNFsU2XDY2LR2xE8mE",
          },
          {
            channel: "StatQuest",
            link: "https://www.youtube.com/playlist?list=PLblh5JKOoLUIcdlgu78MnlATeyx4cEVeR",
          },
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
          },
          {
            channel: "Codebasics",
            link: "https://www.youtube.com/playlist?list=PLeo1K3hjS3us_ELKYSj_Fth2tIEkdKXvV",
          },
        ],
      },
      DevOps: {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/0/05/Devops-toolchain.svg",
        playlists: [
          {
            channel: "TechWorld with Nana",
            link: "https://www.youtube.com/playlist?list=PLy7NrYWoggjwPggqtFsI_zMAwvG0SqYCb",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
          },
          {
            channel: "KodeKloud",
            link: "https://www.youtube.com/playlist?list=PL2We04F3Y_43DRYQSKS6BZI3YTr3cOjr0",
          },
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=lBfuK7iP0V4",
          },
          {
            channel: "edureka!",
            link: "https://www.youtube.com/playlist?list=PL9ooVrP1hQOFXZSuU2Ufs5ubtLb3JxItE",
          },
        ],
      },
      "Cloud Computing": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cloud_computing_icon.svg",
        playlists: [
          {
            channel: "AWS",
            link: "https://www.youtube.com/playlist?list=PLhr1KZpdzukcOr_6j_zmSrvYnLUtgqsZz",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=2LaAJq1lB1Q",
          },
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=2LaAJq1lB1Q",
          },
          {
            channel: "GCP",
            link: "https://www.youtube.com/playlist?list=PLIivdWyY5sqLVoXz3Fg3SX4M4MN1uH2A2",
          },
          {
            channel: "Azure Academy",
            link: "https://www.youtube.com/playlist?list=PLX-6jz4Hgu5wTyT9sXivwNxjqF1hZpJj_",
          },
        ],
      },
      "Quantum Computing": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/6a/Quantum_computing.png",
        playlists: [
          {
            channel: "Qiskit",
            link: "https://www.youtube.com/playlist?list=PLOFEBzvs-VvqRlTfj6oOoqGQtb7GpUiH6",
          },
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=JhHMJCUmq28",
          },
          {
            channel: "Microsoft Quantum",
            link: "https://www.youtube.com/playlist?list=PLlrxD0HtieHje-_287YJKhY8tDeSItwtg",
          },
          {
            channel: "IBM Quantum",
            link: "https://www.youtube.com/playlist?list=PLOFEBzvs-VvqRNRtVGbQ6S6A8IuJcR-6B",
          },
          {
            channel: "Quantum Computing India",
            link: "https://www.youtube.com/playlist?list=PLQHeap0RmkPjxsy8s4H5KUm_YzgGFZ5_N",
          },
        ],
      },
      "Artificial Intelligence (AI)": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/17/Artificial_Intelligence_logo_notext.svg",
        playlists: [
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=JMUxmLyrhSk",
          },
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=7E-sdXI4LB0",
          },
          {
            channel: "Krish Naik",
            link: "https://www.youtube.com/playlist?list=PLZoTAELRMXVPuWyNRH9x1T9JklL1Bzn_x",
          },
          {
            channel: "edureka!",
            link: "https://www.youtube.com/playlist?list=PL9ooVrP1hQOFXZSuU2Ufs5ubtLb3JxItE",
          },
          {
            channel: "Tech With Tim",
            link: "https://www.youtube.com/playlist?list=PLzMcBGfZo4-nyLTlSRBvo0zjSnCnqjHYQ",
          },
        ],
      },
      "Internet of Things (IoT)": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/e/e7/Internet_of_Things.png",
        playlists: [
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=6wD4V0rvlDI",
          },
          {
            channel: "Simplilearn",
            link: "https://www.youtube.com/watch?v=G5t9Ssc1DTM",
          },
          {
            channel: "edureka!",
            link: "https://www.youtube.com/playlist?list=PL9ooVrP1hQOFRriYt3rJde7p4cpe_MSh7",
          },
          {
            channel: "TechGig",
            link: "https://www.youtube.com/playlist?list=PLK7VIJFUioUeJ6zjMCjRmh4JQtuI9q9Pa",
          },
          {
            channel: "ProgrammingKnowledge",
            link: "https://www.youtube.com/playlist?list=PLS1QulWo1RIYjKzv04pIhDU5Qqr3-v3td",
          },
        ],
      },
      "Web Development": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg",
        playlists: [
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=nu_pCVPKzTk",
          },
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9ag1UuG1oJ9ZJts7vpHQ5uN",
          },
          {
            channel: "Traversy Media",
            link: "https://www.youtube.com/playlist?list=PLillGF-RfqbZ2ybcoD2OaabW2P7Ws8CWu",
          },
          {
            channel: "Programming with Mosh",
            link: "https://www.youtube.com/playlist?list=PLTjRvDozrdlyjm_n3a8EwzlhY8fZ1pPZM",
          },
          {
            channel: "The Net Ninja",
            link: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp",
          },
        ],
      },
      "Full Stack Development": {
        image:
          "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg",
        playlists: [
          {
            channel: "freeCodeCamp.org",
            link: "https://www.youtube.com/watch?v=nu_pCVPKzTk",
          },
          {
            channel: "CodeWithHarry",
            link: "https://www.youtube.com/playlist?list=PLu0W_9lII9aiWVaPu8QX8oCG1nGfKxGZA",
          },
          {
            channel: "The Net Ninja",
            link: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9goXbgTDQ0n_4TBzOO0ocPR",
          },
          {
            channel: "Traversy Media",
            link: "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX",
          },
          {
            channel: "edureka!",
            link: "https://www.youtube.com/playlist?list=PL9ooVrP1hQOEo6HXrW5bH1l7JxYp3E-7c",
          },
        ],
      },
    }),
    []
  );

  const topicNames = Object.keys(catalog);

  const toggleTopic = (name) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  // Decide how many playlists to show per topic based on hours
  const playlistsPerTopic = useMemo(() => {
    if (hours === "Less than 5") return 3;
    if (hours === "5–10") return 4;
    if (hours === "10–20") return 5;
    if (hours === "More than 20") return 5;
    return 5; // default
  }, [hours]);

  const isReady =
    level && hours && Array.isArray(selectedTopics) && selectedTopics.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Learning Hub</h1>
          <p className="text-gray-600 mt-2">
            Personalize your learning plan and get curated playlists instantly.
          </p>
        </div>

        {/* Steps / Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
            <span
              className={`px-4 py-2 rounded-lg font-semibold ${
                step === 1 ? "bg-purple-600 text-white" : "text-gray-600"
              }`}
            >
              1. Questionnaire
            </span>
            <span
              className={`px-4 py-2 rounded-lg font-semibold ${
                step === 2 ? "bg-blue-600 text-white" : "text-gray-600"
              }`}
            >
              2. Recommendations
            </span>
          </div>
        </div>

        {/* STEP 1: Questionnaire */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Coding Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold hover:shadow transition ${
                      level === lvl
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to learn? (Select multiple)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicNames.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center gap-3 p-3 rounded-xl border hover:shadow transition ${
                      selectedTopics.includes(topic)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    <img
                      src={catalog[topic].image}
                      alt={topic}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-semibold">{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Hours You Can Spend
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Less than 5", "5–10", "10–20", "More than 20"].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHours(h)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold hover:shadow transition ${
                      hours === h
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-white"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Tip: You can adjust these later from the top of the page.
              </p>
              <button
                onClick={() => isReady && setStep(2)}
                disabled={!isReady}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  isReady
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Show My Recommendations
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Recommendations */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Controls bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                  Level: {level}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  Hours: {hours}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  Topics: {selectedTopics.length}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Edit Preferences
                </button>
              </div>
            </div>

            {/* Topic cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTopics.map((topic) => {
                const data = catalog[topic];
                const shown = data.playlists.slice(0, playlistsPerTopic);
                return (
                  <div
                    key={topic}
                    className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={data.image}
                        alt={topic}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {topic}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Recommended for {level} • showing {shown.length}{" "}
                          playlist{shown.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {shown.map((p, i) => (
                        <li key={i}>
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 group"
                          >
                            <span className="text-indigo-600 group-hover:underline font-medium">
                              {p.channel}
                            </span>
                            <span className="text-xs text-gray-400">
                              Open ↗
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Empty state fallback */}
            {selectedTopics.length === 0 && (
              <div className="bg-white rounded-2xl shadow p-8 text-center">
                <p className="text-gray-700 mb-4">
                  No topics selected yet. Go back and pick at least one topic.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Choose Topics
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
