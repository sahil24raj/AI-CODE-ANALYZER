import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, ShieldAlert, Cpu, Activity, LayoutDashboard, ListVideo } from 'lucide-react';

function App() {
  const [code, setCode] = useState('// Write your Python code here\n\ndef add(a, b):\n    return a + b\n');
  const [language, setLanguage] = useState('python');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'walkthrough'
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setResults(null);
    setActiveTab('overview');
    setActiveLineIndex(0);
    setIsPlaying(false);
    
    // Clear decorations
    if (editorRef.current && decorationsRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }

    try {
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
      const errorMsg = err.response?.data?.detail || err.message || 'An error occurred during analysis.';
      setError(`Error: ${errorMsg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Update Monaco decorations based on activeLineIndex
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || activeTab !== 'walkthrough' || !results?.line_by_line_explanation) {
       if (editorRef.current && decorationsRef.current) {
           decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
       }
       return;
    }

    const explanation = results.line_by_line_explanation[activeLineIndex];
    if (explanation) {
      const lineNum = explanation.line_number;
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monacoRef.current.Range(lineNum, 1, lineNum, 1),
            options: {
              isWholeLine: true,
              className: 'bg-[#66FCF1]/20 border-l-4 border-[#66FCF1]',
            }
          }
        ]
      );
      editorRef.current.revealLineInCenter(lineNum);
    }
  }, [activeLineIndex, activeTab, results]);

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (isPlaying && results?.line_by_line_explanation) {
      interval = setInterval(() => {
        setActiveLineIndex((prev) => {
          if (prev < results.line_by_line_explanation.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 4000); // 4 seconds per line
    }
    return () => clearInterval(interval);
  }, [isPlaying, results]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-red-400 bg-red-400/10 border-red-400/30';
  };

  return (
    <div className="min-h-screen p-8 font-sans" style={{ backgroundColor: '#0B0C10', color: '#C5C6C7' }}>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Side: Editor */}
        <div className="rounded-xl overflow-hidden border-2 border-[#1F2833] flex flex-col h-[750px] shadow-2xl relative">
          <div className="bg-[#1F2833] px-4 py-3 flex items-center justify-between">
            <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="font-mono text-sm text-[#66FCF1] absolute left-1/2 transform -translate-x-1/2">main.py</span>
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
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              padding: { top: 16 },
              smoothScrolling: true,
            }}
          />
        </div>

        {/* Right Side: Dashboard Panel */}
        <div className="bg-[#1F2833]/30 border border-[#1F2833] rounded-xl flex flex-col h-[750px] shadow-2xl overflow-hidden">
          {!results ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Activity className="w-16 h-16 opacity-30 animate-pulse text-[#66FCF1]" />
              <p className="text-xl">Waiting for code submission...</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[#1F2833] bg-[#0B0C10]/50">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'overview' ? 'text-[#66FCF1] border-b-2 border-[#66FCF1] bg-[#1F2833]/50' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => setActiveTab('walkthrough')}
                  className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'walkthrough' ? 'text-[#66FCF1] border-b-2 border-[#66FCF1] bg-[#1F2833]/50' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <ListVideo size={18} /> Walkthrough
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' ? (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 flex flex-col"
                    >
                      <div className="bg-[#0B0C10] border border-[#45A29E]/50 p-4 rounded-lg flex flex-col items-center justify-center w-full shadow-lg shadow-[#45A29E]/10">
                         <h3 className="text-gray-400 text-sm uppercase tracking-wider">Visual Complexity</h3>
                         <span className="text-4xl font-black text-rose-500 mt-2">{results.visual_complexity}</span>
                      </div>

                      <h3 className="text-xl font-bold border-b border-[#1F2833] pb-2 text-[#C5C6C7]">Analysis Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard title="Code Quality" score={results.quality_score} colorClass={getScoreColor(results.quality_score)} />
                        <MetricCard title="Security" score={results.security_score} colorClass={getScoreColor(results.security_score)} />
                        <MetricCard title="Efficiency" score={results.efficiency_score} colorClass={getScoreColor(results.efficiency_score)} />
                        <MetricCard title="Testing" score={results.testing_score} colorClass={getScoreColor(results.testing_score)} />
                      </div>

                      <div className="bg-[#0B0C10] p-5 rounded-lg border border-[#1F2833] shadow-md">
                        <h3 className="text-[#66FCF1] font-bold mb-3 flex items-center gap-2">
                          <ShieldAlert size={20} />
                          AI Security & Logic Audit
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{results.feedback}</p>
                      </div>

                      <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-5">
                        <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                          ✨ 100/100 Auto-Refactored Version
                        </h3>
                        <pre className="bg-[#0B0C10] p-4 rounded text-sm text-gray-300 overflow-x-auto font-mono">
                          {results.refactored_code}
                        </pre>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="walkthrough"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col h-full"
                    >
                        <div className="flex justify-between items-center bg-[#0B0C10] p-4 rounded-xl border border-[#45A29E]/30 mb-6">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setActiveLineIndex(Math.max(0, activeLineIndex - 1))}
                                    disabled={activeLineIndex === 0}
                                    className="p-2 bg-[#1F2833] rounded hover:bg-[#45A29E] hover:text-[#0B0C10] disabled:opacity-50 transition"
                                >
                                    <SkipBack size={20} />
                                </button>
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="px-6 py-2 bg-[#66FCF1] text-[#0B0C10] font-bold rounded flex items-center gap-2 hover:bg-[#45A29E] transition shadow-lg shadow-[#66FCF1]/20"
                                >
                                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    {isPlaying ? 'Pause' : 'Auto-Play'}
                                </button>
                                <button 
                                    onClick={() => setActiveLineIndex(Math.min((results.line_by_line_explanation?.length || 1) - 1, activeLineIndex + 1))}
                                    disabled={activeLineIndex === (results.line_by_line_explanation?.length || 1) - 1}
                                    className="p-2 bg-[#1F2833] rounded hover:bg-[#45A29E] hover:text-[#0B0C10] disabled:opacity-50 transition"
                                >
                                    <SkipForward size={20} />
                                </button>
                            </div>
                            <div className="text-sm text-gray-400 font-mono">
                                Step {activeLineIndex + 1} / {results.line_by_line_explanation?.length || 0}
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <AnimatePresence mode="wait">
                                {results.line_by_line_explanation && results.line_by_line_explanation[activeLineIndex] && (
                                    <motion.div
                                        key={activeLineIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-[#0B0C10] border-l-4 border-[#66FCF1] p-6 rounded-r-xl shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-4 text-[#45A29E]">
                                            <Cpu size={24} />
                                            <span className="font-bold tracking-wider uppercase text-sm">Line {results.line_by_line_explanation[activeLineIndex].line_number} Analysis</span>
                                        </div>
                                        
                                        <div className="bg-[#1F2833] p-4 rounded font-mono text-[#66FCF1] mb-6 overflow-x-auto text-sm border border-[#45A29E]/20">
                                            {results.line_by_line_explanation[activeLineIndex].code}
                                        </div>
                                        
                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            {results.line_by_line_explanation[activeLineIndex].explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ title, score, colorClass }) => (
  <div className={`p-4 rounded-lg border flex flex-col items-center justify-center shadow-lg ${colorClass}`}>
    <span className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">{title}</span>
    <span className="text-3xl font-black">{score}/100</span>
  </div>
);

export default App;
