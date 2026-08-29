import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Play, Sparkles, Terminal, CheckCircle2, ArrowRight, Code2, Cpu } from 'lucide-react';
import { CustomToolDeclaration } from '../types';
import { SAMPLE_TOOLS } from '../data/templates';

interface ToolBuilderViewProps {
  model: string;
}

export const ToolBuilderView: React.FC<ToolBuilderViewProps> = ({ model }) => {
  const [tools, setTools] = useState<CustomToolDeclaration[]>(SAMPLE_TOOLS);
  const [selectedToolId, setSelectedToolId] = useState<string>(SAMPLE_TOOLS[0].id);
  const [testPrompt, setTestPrompt] = useState<string>(
    'Look up customer ID 9821 in our database and check their current outstanding balance.'
  );
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchLogs, setDispatchLogs] = useState<
    { step: string; content: string; type: 'user' | 'model' | 'tool' | 'final' }[]
  >([]);

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const handleAddTool = () => {
    const newTool: CustomToolDeclaration = {
      id: `tool-${Date.now()}`,
      name: `customTool_${tools.length + 1}`,
      description: 'Executes a custom agent function and returns computed data.',
      parameters: [
        { name: 'query', type: 'STRING', description: 'The search query or argument', required: true },
      ],
      mockResponse: '{"status": "success", "result": "Sample execution output"}',
    };
    setTools([...tools, newTool]);
    setSelectedToolId(newTool.id);
  };

  const handleUpdateSelectedTool = (updates: Partial<CustomToolDeclaration>) => {
    setTools(tools.map((t) => (t.id === selectedToolId ? { ...t, ...updates } : t)));
  };

  const handleAddParameter = () => {
    if (!selectedTool) return;
    const newParams = [
      ...selectedTool.parameters,
      { name: `param_${selectedTool.parameters.length + 1}`, type: 'STRING' as const, description: '', required: true },
    ];
    handleUpdateSelectedTool({ parameters: newParams });
  };

  const handleRemoveParameter = (idx: number) => {
    if (!selectedTool) return;
    const newParams = selectedTool.parameters.filter((_, i) => i !== idx);
    handleUpdateSelectedTool({ parameters: newParams });
  };

  const handleUpdateParameter = (idx: number, updates: any) => {
    if (!selectedTool) return;
    const newParams = selectedTool.parameters.map((p, i) => (i === idx ? { ...p, ...updates } : p));
    handleUpdateSelectedTool({ parameters: newParams });
  };

  // Convert custom tools into standard GenAI FunctionDeclaration format
  const getToolDeclarations = () => {
    return tools.map((t) => {
      const propMap: Record<string, any> = {};
      const required: string[] = [];

      t.parameters.forEach((p) => {
        if (p.name.trim()) {
          propMap[p.name] = {
            type: p.type,
            description: p.description,
          };
          if (p.required) required.push(p.name);
        }
      });

      return {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'OBJECT',
          properties: propMap,
          required,
        },
      };
    });
  };

  const handleRunAgentWorkflow = async () => {
    if (!testPrompt.trim() || isDispatching) return;
    setIsDispatching(true);
    setDispatchLogs([]);

    const newLogs: typeof dispatchLogs = [
      { step: '1. User Request', content: testPrompt, type: 'user' },
    ];
    setDispatchLogs([...newLogs]);

    try {
      const toolDeclarations = getToolDeclarations();
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          model,
          tools: [{ functionDeclarations: toolDeclarations }],
          temperature: 0.2,
        }),
      });

      const data = await res.json();
      const calls = data.functionCalls || [];

      if (calls.length > 0) {
        const calledTool = calls[0];
        newLogs.push({
          step: '2. Gemini Function Call Decision',
          content: `Invoked Tool: ${calledTool.name}\nArguments: ${JSON.stringify(calledTool.args || {}, null, 2)}`,
          type: 'model',
        });
        setDispatchLogs([...newLogs]);

        // Find mock response
        const matchingTool = tools.find((t) => t.name === calledTool.name);
        const mockReturn = matchingTool?.mockResponse || '{"status": "ok", "data": "Executed tool successfully"}';

        newLogs.push({
          step: '3. Tool Execution Return',
          content: mockReturn,
          type: 'tool',
        });
        setDispatchLogs([...newLogs]);

        // Final synthesis
        newLogs.push({
          step: '4. Final Agent Response Synthesis',
          content: `Based on the execution of ${calledTool.name}, the customer records have been retrieved and evaluated successfully.`,
          type: 'final',
        });
        setDispatchLogs([...newLogs]);
      } else {
        newLogs.push({
          step: '2. Direct Model Output',
          content: data.text || 'No tools were required for this prompt.',
          type: 'final',
        });
        setDispatchLogs([...newLogs]);
      }
    } catch (err: any) {
      newLogs.push({
        step: 'Error',
        content: err.message,
        type: 'final',
      });
      setDispatchLogs([...newLogs]);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-[#0A0A0A]">
      {/* Tool List & Definition (Left Split) */}
      <div className="flex-1 flex flex-col border-r border-[#222222] overflow-y-auto p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between bg-[#0F0F0F] p-4 rounded-2xl border border-[#222222]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Agent & Function Calling Studio</h2>
            </div>
            <p className="text-xs text-[#888888]">
              Define tools and function declarations for Gemini autonomous agent decision making.
            </p>
          </div>

          <button
            onClick={handleAddTool}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tool</span>
          </button>
        </div>

        {/* Tools Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedToolId(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                selectedToolId === t.id
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-[#151515] text-[#888888] border-[#222222] hover:text-white'
              }`}
            >
              {t.name}()
            </button>
          ))}
        </div>

        {/* Selected Tool Form */}
        {selectedTool && (
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#777777] block mb-1">Function Name</label>
                <input
                  type="text"
                  value={selectedTool.name}
                  onChange={(e) => handleUpdateSelectedTool({ name: e.target.value })}
                  className="w-full bg-[#050505] border border-[#222222] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#777777] block mb-1">Description (for Gemini routing)</label>
                <input
                  type="text"
                  value={selectedTool.description}
                  onChange={(e) => handleUpdateSelectedTool({ description: e.target.value })}
                  className="w-full bg-[#050505] border border-[#222222] rounded-xl px-3 py-2 text-xs text-[#E0E0E0] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-2 pt-2 border-t border-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">
                  Parameters ({selectedTool.parameters.length})
                </span>
                <button
                  onClick={handleAddParameter}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Param
                </button>
              </div>

              {selectedTool.parameters.map((param, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-[#050505] border border-[#222222] p-2.5 rounded-xl flex items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => handleUpdateParameter(pIdx, { name: e.target.value })}
                    placeholder="name"
                    className="w-28 bg-[#151515] border border-[#333333] rounded px-2 py-1 font-mono text-white"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => handleUpdateParameter(pIdx, { type: e.target.value })}
                    className="w-24 bg-[#151515] border border-[#333333] rounded px-2 py-1 text-white"
                  >
                    <option value="STRING">STRING</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="OBJECT">OBJECT</option>
                  </select>
                  <input
                    type="text"
                    value={param.description}
                    onChange={(e) => handleUpdateParameter(pIdx, { description: e.target.value })}
                    placeholder="Description..."
                    className="flex-1 bg-[#151515] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0]"
                  />
                  <button
                    onClick={() => handleRemoveParameter(pIdx)}
                    className="text-[#666666] hover:text-red-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mock Response */}
            <div className="pt-2 border-t border-[#222222]">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#777777] block mb-1">
                Simulated Execution Result (JSON)
              </label>
              <textarea
                value={selectedTool.mockResponse || ''}
                onChange={(e) => handleUpdateSelectedTool({ mockResponse: e.target.value })}
                rows={2}
                className="w-full bg-[#050505] border border-[#222222] rounded-xl p-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Test Agent Dispatcher Input */}
        <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777] block">
            Test Agent Request
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="e.g. Check current weather in Chicago or query database..."
              className="flex-1 bg-[#050505] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRunAgentWorkflow}
              disabled={isDispatching || !testPrompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isDispatching ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Dispatch Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Execution Trace (Right Split) */}
      <div className="w-full lg:w-[460px] flex flex-col bg-[#0A0A0A] p-4 sm:p-6 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#222222]">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-[#E0E0E0] uppercase tracking-wider">Agent Dispatch Trace</span>
          </div>
        </div>

        {/* Trace List */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-4">
          {dispatchLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#555555] space-y-2">
              <Cpu className="w-8 h-8 text-[#444444]" />
              <p className="text-xs">Dispatch an agent request to watch tool calling resolution in real-time.</p>
            </div>
          ) : (
            dispatchLogs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  log.type === 'user'
                    ? 'bg-[#151515] border-[#222222] text-[#CCCCCC]'
                    : log.type === 'model'
                    ? 'bg-[#1E1B4B]/30 border-indigo-800/40 text-indigo-200'
                    : log.type === 'tool'
                    ? 'bg-[#064E3B]/30 border-emerald-800/40 text-emerald-200 font-mono'
                    : 'bg-[#2E1065]/30 border-purple-800/40 text-purple-100'
                }`}
              >
                <div className="font-semibold text-[10px] uppercase tracking-wider opacity-80">{log.step}</div>
                <pre className="whitespace-pre-wrap font-sans text-xs">{log.content}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
