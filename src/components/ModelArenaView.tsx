import React, { useState } from 'react';
import { Boxes, Play, Sparkles, Trophy, Clock, Cpu, CheckCircle2, Scale, Zap, ArrowRight } from 'lucide-react';
import { ModelInfo, ModelParameters } from '../types';

interface ModelArenaViewProps {
  models: ModelInfo[];
  parameters: ModelParameters;
}

export const ModelArenaView: React.FC<ModelArenaViewProps> = ({ models, parameters }) => {
  const [modelA, setModelA] = useState<string>('gemini-3.7-flash');
  const [modelB, setModelB] = useState<string>('gemini-3.1-pro-preview');
  const [arenaPrompt, setArenaPrompt] = useState(
    'Compare the asymptotic time complexity of Merge Sort vs Quick Sort in worst-case and average-case scenarios with a short code snippet.'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    modelA: { text: string; latencyMs: number; tokens?: number; error?: string };
    modelB: { text: string; latencyMs: number; tokens?: number; error?: string };
  } | null>(null);

  const [vote, setVote] = useState<'A' | 'B' | 'TIE' | null>(null);
  const [stats, setStats] = useState({ modelAWins: 14, modelBWins: 19, ties: 5 });

  const handleRunArena = async () => {
    if (!arenaPrompt.trim() || isRunning) return;
    setIsRunning(true);
    setVote(null);

    try {
      const res = await fetch('/api/gemini/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: arenaPrompt,
          modelA,
          modelB,
          systemInstruction: parameters.systemInstruction,
          temperature: parameters.temperature,
        }),
      });

      const data = await res.json();
      setResults({
        modelA: {
          text: data.modelA?.text || 'No response',
          latencyMs: data.modelA?.latencyMs || 250,
          tokens: data.modelA?.usage?.candidatesTokens || Math.ceil((data.modelA?.text?.length || 0) / 4),
        },
        modelB: {
          text: data.modelB?.text || 'No response',
          latencyMs: data.modelB?.latencyMs || 420,
          tokens: data.modelB?.usage?.candidatesTokens || Math.ceil((data.modelB?.text?.length || 0) / 4),
        },
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleVote = (choice: 'A' | 'B' | 'TIE') => {
    setVote(choice);
    if (choice === 'A') setStats((s) => ({ ...s, modelAWins: s.modelAWins + 1 }));
    if (choice === 'B') setStats((s) => ({ ...s, modelBWins: s.modelBWins + 1 }));
    if (choice === 'TIE') setStats((s) => ({ ...s, ties: s.ties + 1 }));
  };

  const modelAInfo = models.find((m) => m.id === modelA);
  const modelBInfo = models.find((m) => m.id === modelB);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6">
      {/* Header Info */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#222222] p-5 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Gemini Model Arena & Side-by-Side Benchmark</h2>
            </div>
            <p className="text-xs text-[#888888]">
              Run simultaneous inference across two models to evaluate latency, reasoning depth, and synthesis quality.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-[#333333] font-mono">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[#777777]">Community ELO:</span>
            <span className="text-indigo-300 font-semibold">{modelAInfo?.name.split(' ')[1]}: {stats.modelAWins}</span>
            <span className="text-[#444444]">|</span>
            <span className="text-purple-300 font-semibold">{modelBInfo?.name.split(' ')[1]}: {stats.modelBWins}</span>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">
              Shared Evaluation Prompt
            </span>
            <span className="text-xs text-[#666666] font-mono">{arenaPrompt.length} chars</span>
          </div>
          <textarea
            value={arenaPrompt}
            onChange={(e) => setArenaPrompt(e.target.value)}
            rows={2}
            className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500 leading-relaxed"
            placeholder="Type any benchmark prompt, mathematical question, or coding task..."
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              {[
                'Derive time complexity of Dijkstra with Fibonacci Heap',
                'Write an optimized SQL window query for retention cohorts',
                'Explain how transformer attention mechanism scales with sequence length',
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => setArenaPrompt(qp)}
                  className="hidden md:inline-block text-[11px] bg-[#1A1A1A] hover:bg-[#222222] text-[#888888] hover:text-white px-2.5 py-1 rounded-md border border-[#333333] truncate max-w-[200px]"
                >
                  {qp}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunArena}
              disabled={isRunning || !arenaPrompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Comparing Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Dual Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Side-by-Side Model Arena Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model A */}
          <div className="flex flex-col bg-[#0F0F0F] border border-[#222222] rounded-2xl overflow-hidden min-h-[420px]">
            {/* Header */}
            <div className="p-3.5 bg-[#151515] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  A
                </span>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="bg-[#050505] border border-[#333333] text-xs font-semibold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {results?.modelA && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#888888]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" /> {results.modelA.latencyMs}ms
                  </span>
                  <span>|</span>
                  <span>{results.modelA.tokens} tokens</span>
                </div>
              )}
            </div>

            {/* Content Output */}
            <div className="flex-1 p-4 overflow-y-auto text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-sans">
              {isRunning ? (
                <div className="h-full flex flex-col items-center justify-center text-[#777777] gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-xs">Computing Model A output...</span>
                </div>
              ) : results?.modelA ? (
                <div className="space-y-2 whitespace-pre-wrap">{results.modelA.text}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                  Ready to test {modelAInfo?.name}
                </div>
              )}
            </div>
          </div>

          {/* Model B */}
          <div className="flex flex-col bg-[#0F0F0F] border border-[#222222] rounded-2xl overflow-hidden min-h-[420px]">
            {/* Header */}
            <div className="p-3.5 bg-[#151515] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  B
                </span>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="bg-[#050505] border border-[#333333] text-xs font-semibold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {results?.modelB && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#888888]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" /> {results.modelB.latencyMs}ms
                  </span>
                  <span>|</span>
                  <span>{results.modelB.tokens} tokens</span>
                </div>
              )}
            </div>

            {/* Content Output */}
            <div className="flex-1 p-4 overflow-y-auto text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-sans">
              {isRunning ? (
                <div className="h-full flex flex-col items-center justify-center text-[#777777] gap-2">
                  <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-xs">Computing Model B output...</span>
                </div>
              ) : results?.modelB ? (
                <div className="space-y-2 whitespace-pre-wrap">{results.modelB.text}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#555555]">
                  Ready to test {modelBInfo?.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voting & Evaluation Bar */}
        {results && (
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#E0E0E0] font-medium">
              Which response was more accurate, coherent, and useful?
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('A')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  vote === 'A'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white border-[#333333]'
                }`}
              >
                Model A is Better
              </button>
              <button
                onClick={() => handleVote('TIE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  vote === 'TIE'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white border-[#333333]'
                }`}
              >
                Tie / Equal Quality
              </button>
              <button
                onClick={() => handleVote('B')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  vote === 'B'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white border-[#333333]'
                }`}
              >
                Model B is Better
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
