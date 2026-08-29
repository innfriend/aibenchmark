import React, { useState } from 'react';
import { Code2, Terminal, Play, Check, Copy, Server, Globe, ShieldCheck, Zap } from 'lucide-react';

interface ApiReferenceViewProps {
  model: string;
}

export const ApiReferenceView: React.FC<ApiReferenceViewProps> = ({ model }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('generateContent');
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        contents: [{ parts: [{ text: 'Explain the difference between TCP and UDP.' }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      },
      null,
      2
    )
  );

  const [apiResponse, setApiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      id: 'generateContent',
      method: 'POST',
      path: `/v1beta/models/${model}:generateContent`,
      description: 'Generates a response from Gemini based on multimodal parts and generation configs.',
    },
    {
      id: 'streamGenerateContent',
      method: 'POST',
      path: `/v1beta/models/${model}:streamGenerateContent`,
      description: 'Streams chunks of generated text back to client over Server-Sent Events (SSE).',
    },
    {
      id: 'embedContent',
      method: 'POST',
      path: `/v1beta/models/gemini-embedding-2-preview:embedContent`,
      description: 'Generates high-density vector embeddings from input text content.',
    },
    {
      id: 'listModels',
      method: 'GET',
      path: `/v1beta/models`,
      description: 'Lists all available foundation models, capabilities, and token rate limits.',
    },
  ];

  const handleTestEndpoint = async () => {
    setIsLoading(true);
    setApiResponse('');

    try {
      if (selectedEndpoint === 'listModels') {
        const res = await fetch('/api/models');
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        const parsed = JSON.parse(testPayload);
        const promptText = parsed.contents?.[0]?.parts?.[0]?.text || 'Hello';
        const res = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            model,
            temperature: parsed.generationConfig?.temperature || 0.7,
          }),
        });
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiResponse || testPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-[#0A0A0A]">
      {/* Endpoints List & Request Config (Left Split) */}
      <div className="flex-1 flex flex-col border-r border-[#222222] overflow-y-auto p-4 sm:p-6 space-y-5">
        <div className="bg-[#0F0F0F] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Google AI Studio REST API Reference</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Standard REST endpoints for integrating Gemini models into web servers, mobile clients, and microservices.
          </p>
        </div>

        {/* Endpoints Selection */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#777777] uppercase tracking-widest block">
            API Endpoints
          </span>
          <div className="space-y-1.5">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedEndpoint === ep.id
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                    : 'bg-[#0F0F0F] border-[#222222] text-[#AAAAAA] hover:bg-[#151515] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      ep.method === 'POST'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono text-[#DDDDDD]">{ep.path}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Request Payload Editor */}
        <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#777777] uppercase tracking-widest">
              JSON Request Body
            </span>
            <span className="text-xs text-[#666666] font-mono">Content-Type: application/json</span>
          </div>

          <textarea
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            rows={7}
            className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleTestEndpoint}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing HTTP Request...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Response Terminal (Right Split) */}
      <div className="w-full lg:w-[480px] flex flex-col bg-[#0A0A0A] p-4 sm:p-6 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#222222]">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-[#E0E0E0] uppercase tracking-wider">HTTP Response (200 OK)</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#151515] hover:bg-[#222222] text-[#AAAAAA] hover:text-white text-xs rounded-lg border border-[#333333] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Response Box */}
        <div className="flex-1 bg-[#050505] border border-[#222222] rounded-xl p-4 overflow-y-auto font-mono text-xs text-emerald-400 mt-4 leading-relaxed">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#666666] gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-xs">Awaiting server response...</span>
            </div>
          ) : apiResponse ? (
            <pre className="whitespace-pre-wrap">
              <code>{apiResponse}</code>
            </pre>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#555555] text-center">
              Click &quot;Send Request&quot; to test the live API response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
