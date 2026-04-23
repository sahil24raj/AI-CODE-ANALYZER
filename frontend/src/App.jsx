import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function App() {
  const [code, setCode] = useState('// Write your Python code here\n\ndef add(a, b):\n    return a + b\n');
  const [language, setLanguage] = useState('python');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      // Use local backend URL in development, and the Vercel deployed backend route in production
      const endpoint = import.meta.env.DEV 
        ? 'http://127.0.0.1:8000/api/analyze' 
        : '/_/backend/api/analyze';

      const response = await axios.post(endpoint, {
        code,
        language
      });
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-red-400 bg-red-400/10 border-red-400/30';
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0B0C10', color: '#C5C6C7' }}>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#66FCF1] to-[#45A29E]">
            DeepCode AI
          </h1>
          <p className="text-gray-400 mt-2">Intelligent Code Execution & Security Auditor</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className={`px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-[#66FCF1]/20 ${
            analyzing 
              ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
              : 'bg-[#66FCF1] text-[#0B0C10] hover:bg-[#45A29E] hover:scale-105'
          }`}
        >
          {analyzing ? 'Analyzing... ⏳' : 'Analyze Code 🚀'}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Editor */}
        <div className="rounded-xl overflow-hidden border-2 border-[#1F2833] flex flex-col h-[700px] shadow-2xl">
          <div className="bg-[#1F2833] px-4 py-2 flex items-center justify-between">
            <span className="font-mono text-sm text-[#66FCF1]">main.py</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#0B0C10] text-[#C5C6C7] border border-[#45A29E] rounded px-2 py-1 text-sm outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Right Side: Dashboard Panel */}
        <div className="bg-[#1F2833]/50 border border-[#1F2833] rounded-xl p-6 h-[700px] overflow-y-auto">
          {!results ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <svg className="w-16 h-16 opacity-30 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              <p className="text-xl">Waiting for code submission...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom flex flex-col">
              {/* Top Meta Data */}
              <div className="bg-[#0B0C10] border border-[#45A29E] p-4 rounded-lg flex items-center justify-between">
                <div className="flex flex-col items-center justify-center w-full">
                   <h3 className="text-gray-400 text-sm uppercase tracking-wider">Visual Complexity</h3>
                   <span className="text-4xl font-black text-rose-500 mt-2">{results.visual_complexity}</span>
                </div>
              </div>

              {/* Sub-scores metrics */}
              <h3 className="text-xl font-bold border-b border-[#1F2833] pb-2">Analysis Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard title="Code Quality" score={results.quality_score} colorClass={getScoreColor(results.quality_score)} />
                <MetricCard title="Security" score={results.security_score} colorClass={getScoreColor(results.security_score)} />
                <MetricCard title="Efficiency" score={results.efficiency_score} colorClass={getScoreColor(results.efficiency_score)} />
                <MetricCard title="Testing" score={results.testing_score} colorClass={getScoreColor(results.testing_score)} />
              </div>

              {/* Detailed Feedback & Exploits */}
              <div className="bg-[#0B0C10] p-5 rounded-lg border border-[#1F2833]">
                <h3 className="text-[#66FCF1] font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  AI Security & Logic Audit
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{results.feedback}</p>
              </div>

              {/* Auto-Refactored Code */}
              <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-5">
                <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                  ✨ 100/100 Auto-Refactored Version
                </h3>
                <pre className="bg-[#0B0C10] p-4 rounded text-sm text-gray-300 overflow-x-auto font-mono">
                  {results.refactored_code}
                </pre>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ title, score, colorClass }) => (
  <div className={`p-4 rounded-lg border flex flex-col items-center justify-center ${colorClass}`}>
    <span className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">{title}</span>
    <span className="text-3xl font-black">{score}/100</span>
  </div>
);

export default App;
