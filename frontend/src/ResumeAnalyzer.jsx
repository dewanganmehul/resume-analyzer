import { useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !job.trim()) {
      alert("Please upload a resume and enter job description");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", job);

    try {
      const res = await axios.post(
        "https://resume-analyzer-iz5a.onrender.com/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while analyzing!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 transition hover:shadow-blue-200">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow">
          Resume Analyzer
        </h1>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            rows="5"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste job description here..."
            onChange={(e) => setJob(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 text-white text-lg font-semibold rounded-lg shadow-md transition 
            ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"}`}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
        {result && (
          <div className="mt-10 space-y-8 animate-fadeIn">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Match Score
              </h2>
              <div className="w-44 h-44">
                <CircularProgressbar
                  value={result.match}
                  text={`${result.match}%`}
                  styles={buildStyles({
                    pathColor: result.match > 70 ? "#16a34a" : "#f59e0b",
                    textColor: "#1f2937",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-inner">
              <h2 className="text-xl font-bold mb-3 text-blue-700">
                Suggestions
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {result.suggestions?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-xl shadow-inner">
              <h2 className="text-xl font-bold mb-3 text-red-700">
                Missing Skills
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {result.missingSkills?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
