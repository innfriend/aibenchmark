import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon,
  FileText,
  Upload,
  Trash2,
  Copy,
  Check,
  Zap,
  Clock,
  Coins,
  BrainCircuit,
  MessageSquare,
  Code2,
  FileJson,
  Maximize2,
  RotateCcw,
  Bot,
  User,
  Send,
  AlertCircle
} from 'lucide-react';
import { ModelInfo, ModelParameters, MediaAttachment, ChatMessage } from '../types';

interface PlaygroundViewProps {
  model: string;
  models: ModelInfo[];
  parameters: ModelParameters;
  onUpdateParameters: (params: Partial<ModelParameters>) => void;
  onOpenGetCode: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  model,
  models,
  parameters,
  onUpdateParameters,
  onOpenGetCode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [systemInstruction, setSystemInstruction] = useState(parameters.systemInstruction || '');
  const [showSystemInstruction, setShowSystemInstruction] = useState(false);
  const [showParamsPanel, setShowParamsPanel] = useState(true);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [mode, setMode] = useState<'single' | 'chat'>('single');

  // Single mode state
  const [isLoading, setIsLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState('');
  const [telemetry, setTelemetry] = useState<{
    latencyMs: number;
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    simulated: boolean;
  } | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'markdown' | 'json' | 'raw' | 'thinking'>('markdown');
  const [copied, setCopied] = useState(false);

  // Chat mode state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentModelInfo = models.find((m) => m.id === model) || models[0];

  // Quick prompt presets
  const quickPrompts = [
    { label: 'Quantum Computing in 3 Bullet Points', text: 'Explain the core principles of quantum computing in 3 concise bullet points for a high school student.' },
    { label: 'TypeScript Cache Middleware', text: 'Write a production-grade in-memory LRU cache class in TypeScript with generic type support and TTL expiry.' },
    { label: 'Customer Lead JSON Extractor', text: 'Extract company name, lead contact, estimated budget, and priority tier from this email: "Hi, I am Sarah Jenkins from Apex Logistics. We want to deploy an enterprise AI pipeline with roughly $85k budget for Q4."' },
    { label: 'Bug Audit & Refactor', text: 'Audit this JavaScript snippet for memory leaks and race conditions:\n\nasync function fetchUserData(ids) {\n  let results = [];\n  ids.forEach(async (id) => {\n    let res = await fetch(`/api/user/${id}`);\n    results.push(await res.json());\n  });\n  return results;\n}' },
  ];

  // Handle file uploads (image / text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        const newAttachment: MediaAttachment = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? base64Data : undefined,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Run Single Prompt
  const handleRun = async () => {
    if ((!prompt.trim() && attachments.length === 0) || isLoading) return;

    setIsLoading(true);
    setResponseOutput('');
    setTelemetry(null);

    try {
      const payload = {
        prompt,
        model,
        systemInstruction: systemInstruction || undefined,
        temperature: parameters.temperature,
        topP: parameters.topP,
        topK: parameters.topK,
        responseMimeType: parameters.responseMimeType,
        images: attachments.map((a) => ({
          data: a.data,
          mimeType: a.mimeType,
        })),
      };

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponseOutput(data.text || '');
      setTelemetry({
        latencyMs: data.latencyMs || 0,
        promptTokens: data.usage?.promptTokens || Math.ceil(prompt.length / 4),
        candidatesTokens: data.usage?.candidatesTokens || Math.ceil((data.text?.length || 0) / 4),
        totalTokens: data.usage?.totalTokens || (data.usage?.promptTokens || 0) + (data.usage?.candidatesTokens || 0),
        simulated: !!data.simulated,
      });

      if (parameters.responseMimeType === 'application/json' || data.text.trim().startsWith('{')) {
        setActiveOutputTab('json');
      }
    } catch (err: any) {
      setResponseOutput(`Error executing model request: ${err.message || err.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Chat Message
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model,
          systemInstruction: systemInstruction || undefined,
          temperature: parameters.temperature,
          topP: parameters.topP,
        }),
      });

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: data.message?.content || data.text || 'No response',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: data.latencyMs,
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut Ctrl/Cmd + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'single') {
        handleRun();
      } else {
        handleSendChat();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-[#0A0A0A]">
      {/* Main Workspace (Left/Center) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#222222] overflow-hidden">
        {/* Top Controls Bar */}
        <div className="px-4 py-2.5 border-b border-[#222222] bg-[#0F0F0F] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-[#1A1A1A] p-0.5 rounded-lg border border-[#333333] text-xs">
              <button
                onClick={() => setMode('single')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  mode === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#888888] hover:text-white'
                }`}
              >
                Prompt Studio
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  mode === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#888888] hover:text-white'
                }`}
              >
                Multi-Turn Chat
              </button>
            </div>

            {/* Toggle System Instruction */}
            <button
              onClick={() => setShowSystemInstruction(!showSystemInstruction)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                showSystemInstruction || systemInstruction
                  ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/40'
                  : 'bg-[#1A1A1A] text-[#888888] border-[#333333] hover:text-white'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>System Prompt {systemInstruction ? '(Set)' : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParamsPanel(!showParamsPanel)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors lg:hidden ${
                showParamsPanel ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-[#1A1A1A] text-[#888888] border-[#333333]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Params</span>
            </button>

            <button
              onClick={onOpenGetCode}
              className="flex items-center gap-1 text-xs text-[#888888] hover:text-white px-2 py-1 rounded hover:bg-[#1A1A1A]"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export SDK Code</span>
            </button>
          </div>
        </div>

        {/* Collapsible System Instruction Panel */}
        {showSystemInstruction && (
          <div className="p-4 bg-[#0F0F0F] border-b border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                System Instruction / Persona Directive
              </span>
              <button
                onClick={() => setSystemInstruction('')}
                className="text-[11px] text-[#777777] hover:text-white"
              >
                Clear
              </button>
            </div>
            <textarea
              value={systemInstruction}
              onChange={(e) => {
                setSystemInstruction(e.target.value);
                onUpdateParameters({ systemInstruction: e.target.value });
              }}
              placeholder="e.g. You are a senior software architect specializing in distributed systems and TypeScript..."
              rows={2}
              className="w-full bg-[#050505] border border-[#333333] rounded-lg p-2.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Workspace Content */}
        {mode === 'single' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Prompt Editor (Left Split) */}
            <div className="flex-1 flex flex-col p-4 border-r border-[#222222] overflow-y-auto bg-[#0A0A0A]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">
                  User Prompt & Multimodal Input
                </span>
                <div className="flex items-center gap-3 text-xs text-[#666666]">
                  <span>~{Math.ceil(prompt.length / 4) + attachments.length * 258} tokens</span>
                  <span>{prompt.length} chars</span>
                </div>
              </div>

              {/* Text Area Container */}
              <div className="flex-1 relative flex flex-col bg-[#0F0F0F] border border-[#222222] rounded-xl p-3 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all min-h-[160px]">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your prompt here... Use (Cmd/Ctrl + Enter) to run"
                  className="flex-1 w-full bg-transparent text-sm text-white placeholder-[#555555] resize-none focus:outline-none leading-relaxed"
                />

                {/* Media Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#222222] mt-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative group flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] px-2.5 py-1.5 rounded-lg text-xs"
                      >
                        {att.previewUrl ? (
                          <img src={att.previewUrl} alt={att.name} className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-[#E0E0E0] max-w-[120px] truncate">{att.name}</span>
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="text-[#777777] hover:text-red-400 p-0.5 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt Controls & Preset Chips */}
              <div className="mt-3 space-y-3">
                {/* Upload & Quick Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.txt,.pdf,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-[#AAAAAA] hover:text-white bg-[#1A1A1A] hover:bg-[#222222] px-2.5 py-1.5 rounded-md border border-[#333333] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Attach Media / Image</span>
                    </button>
                    {prompt && (
                      <button
                        onClick={() => setPrompt('')}
                        className="text-xs text-[#777777] hover:text-[#AAAAAA] px-2 py-1.5"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Run Button */}
                  <button
                    onClick={handleRun}
                    disabled={isLoading || (!prompt.trim() && attachments.length === 0)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isLoading
                        ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/20 active:scale-98'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Prompt (⌘↵)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Chips */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#555555] mb-1.5">
                    Starter Prompt Presets
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(qp.text)}
                        className="text-left text-xs bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white px-2.5 py-1 rounded-md border border-[#333333] transition-colors"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Inspector (Right Split) */}
            <div className="flex-1 flex flex-col bg-[#0A0A0A] p-4 overflow-hidden">
              {/* Output Header */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">
                    Model Response
                  </span>
                  {telemetry && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {telemetry.latencyMs}ms
                    </span>
                  )}
                </div>

                {/* View Tabs & Copy */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-[#1A1A1A] p-0.5 rounded-lg border border-[#333333] text-xs">
                    <button
                      onClick={() => setActiveOutputTab('markdown')}
                      className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                        activeOutputTab === 'markdown' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      onClick={() => setActiveOutputTab('json')}
                      className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                        activeOutputTab === 'json' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setActiveOutputTab('raw')}
                      className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                        activeOutputTab === 'raw' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Raw
                    </button>
                  </div>

                  {responseOutput && (
                    <button
                      onClick={handleCopyOutput}
                      className="p-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white rounded-md border border-[#333333] transition-colors"
                      title="Copy response"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Output Content Area */}
              <div className="flex-1 bg-[#0F0F0F] border border-[#222222] rounded-xl p-4 overflow-y-auto font-sans leading-relaxed text-[#E0E0E0] text-sm">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#777777] gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <span className="text-xs">Generating with {currentModelInfo.name}...</span>
                  </div>
                ) : responseOutput ? (
                  activeOutputTab === 'json' ? (
                    <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap bg-[#050505] p-3 rounded-lg border border-[#222222]">
                      <code>{responseOutput}</code>
                    </pre>
                  ) : activeOutputTab === 'raw' ? (
                    <pre className="font-mono text-xs text-[#AAAAAA] whitespace-pre-wrap">
                      <code>{responseOutput}</code>
                    </pre>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-3">
                      {responseOutput.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('```')) {
                          const codeLines = paragraph.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
                          return (
                            <pre key={pIdx} className="bg-[#050505] border border-[#222222] rounded-lg p-3 text-xs font-mono text-indigo-300 overflow-x-auto my-2">
                              <code>{codeLines}</code>
                            </pre>
                          );
                        }
                        if (paragraph.startsWith('#')) {
                          return <h4 key={pIdx} className="text-sm font-bold text-white mt-3">{paragraph.replace(/^#+\s*/, '')}</h4>;
                        }
                        return <p key={pIdx} className="text-[#CCCCCC] leading-relaxed">{paragraph}</p>;
                      })}
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#555555] gap-2">
                    <Sparkles className="w-8 h-8 text-[#333333]" />
                    <p className="text-xs text-[#777777]">Run a prompt to view the generated model response and token metrics.</p>
                  </div>
                )}
              </div>

              {/* Telemetry Footer */}
              {telemetry && (
                <div className="mt-3 grid grid-cols-4 gap-2 pt-2 border-t border-[#222222] text-[11px] font-mono text-[#888888]">
                  <div className="bg-[#0F0F0F] p-2 rounded-lg border border-[#222222]">
                    <span className="text-[#555555] block text-[10px] uppercase">Latency</span>
                    <span className="text-white font-semibold">{telemetry.latencyMs} ms</span>
                  </div>
                  <div className="bg-[#0F0F0F] p-2 rounded-lg border border-[#222222]">
                    <span className="text-[#555555] block text-[10px] uppercase">Prompt Tokens</span>
                    <span className="text-white font-semibold">{telemetry.promptTokens}</span>
                  </div>
                  <div className="bg-[#0F0F0F] p-2 rounded-lg border border-[#222222]">
                    <span className="text-[#555555] block text-[10px] uppercase">Output Tokens</span>
                    <span className="text-white font-semibold">{telemetry.candidatesTokens}</span>
                  </div>
                  <div className="bg-[#0F0F0F] p-2 rounded-lg border border-[#222222]">
                    <span className="text-[#555555] block text-[10px] uppercase">Total Tokens</span>
                    <span className="text-white font-semibold">{telemetry.totalTokens}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Multi-Turn Chat Mode */
          <div className="flex-1 flex flex-col overflow-hidden p-4 bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#666666] space-y-3">
                  <MessageSquare className="w-10 h-10 text-[#333333]" />
                  <div className="text-center max-w-sm">
                    <p className="text-sm font-semibold text-white">Multi-Turn Conversation Studio</p>
                    <p className="text-xs text-[#777777] mt-1">
                      Test multi-step reasoning, contextual memory, and stateful dialogues with {currentModelInfo.name}.
                    </p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl rounded-xl p-3 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-[#0F0F0F] border border-[#222222] text-[#E0E0E0] rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center justify-between gap-4 mt-2 text-[10px] opacity-70">
                        <span>{msg.timestamp}</span>
                        {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-[#CCCCCC] mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#0F0F0F] border border-[#222222] p-3 rounded-xl rounded-bl-none text-xs text-[#888888] flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <span>Gemini is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="pt-3 border-t border-[#222222] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Send a message to Gemini... (Press Enter)"
                className="flex-1 bg-[#0F0F0F] border border-[#222222] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Parameters Sidebar */}
      {showParamsPanel && (
        <div className="w-full lg:w-72 bg-[#0F0F0F] border-l border-[#222222] p-4 space-y-5 overflow-y-auto text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Model Parameters
            </span>
            <button
              onClick={() =>
                onUpdateParameters({
                  temperature: 0.7,
                  topP: 0.95,
                  topK: 40,
                  maxOutputTokens: 8192,
                  responseMimeType: 'text/plain',
                })
              }
              className="text-[11px] text-[#777777] hover:text-white"
              title="Reset parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-medium text-[#AAAAAA]">Temperature</label>
              <span className="font-mono text-indigo-400 font-semibold">{parameters.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={parameters.temperature}
              onChange={(e) => onUpdateParameters({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-[#1A1A1A] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#666666]">
              <span>Precise (0.0)</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          {/* Top-P Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-medium text-[#AAAAAA]">Top-P (Nucleus)</label>
              <span className="font-mono text-indigo-400 font-semibold">{parameters.topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={parameters.topP}
              onChange={(e) => onUpdateParameters({ topP: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-[#1A1A1A] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Top-K Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-medium text-[#AAAAAA]">Top-K</label>
              <span className="font-mono text-indigo-400 font-semibold">{parameters.topK}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={parameters.topK}
              onChange={(e) => onUpdateParameters({ topK: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 bg-[#1A1A1A] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Output Format (Mime Type) */}
          <div className="space-y-1.5">
            <label className="font-medium text-[#AAAAAA] block">Response Format</label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#050505] p-1 rounded-lg border border-[#222222]">
              <button
                onClick={() => onUpdateParameters({ responseMimeType: 'text/plain' })}
                className={`py-1 rounded text-center font-medium transition-colors cursor-pointer ${
                  parameters.responseMimeType !== 'application/json'
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#777777] hover:text-white'
                }`}
              >
                Text / Markdown
              </button>
              <button
                onClick={() => onUpdateParameters({ responseMimeType: 'application/json' })}
                className={`py-1 rounded text-center font-medium transition-colors cursor-pointer ${
                  parameters.responseMimeType === 'application/json'
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#777777] hover:text-white'
                }`}
              >
                JSON Schema
              </button>
            </div>
          </div>

          {/* Model Capabilities Badges */}
          <div className="pt-3 border-t border-[#222222] space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#555555] block">
              Active Model Specs
            </span>
            <div className="space-y-1.5 text-[11px] text-[#AAAAAA] font-mono">
              <div className="flex justify-between bg-[#050505] p-2 rounded border border-[#222222]">
                <span>Context Window:</span>
                <span className="text-white">{currentModelInfo.contextWindow}</span>
              </div>
              <div className="flex justify-between bg-[#050505] p-2 rounded border border-[#222222]">
                <span>Max Output:</span>
                <span className="text-white">{currentModelInfo.maxOutputTokens} tokens</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
