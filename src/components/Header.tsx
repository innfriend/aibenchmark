import React, { useState } from 'react';
import { 
  Sparkles, 
  Code2, 
  Settings, 
  Sliders, 
  Layers, 
  FileCode2, 
  Wrench, 
  Compass, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Boxes,
  Key
} from 'lucide-react';
import { ModelInfo } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  models: ModelInfo[];
  hasApiKey: boolean;
  onOpenGetCode: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  models,
  hasApiKey,
  onOpenGetCode,
  onOpenSettings,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  const tabs = [
    { id: 'playground', label: 'Playground', icon: Sliders },
    { id: 'arena', label: 'Model Arena', icon: Boxes },
    { id: 'schema', label: 'Structured JSON', icon: FileCode2 },
    { id: 'tools', label: 'Agent & Tools', icon: Wrench },
    { id: 'templates', label: 'Prompt Library', icon: Compass },
    { id: 'embeddings', label: 'Embeddings', icon: Layers },
    { id: 'api-docs', label: 'API Reference', icon: Code2 },
  ];

  return (
    <header className="border-b border-[#222222] bg-[#0F0F0F] sticky top-0 z-40">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#222222]">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white text-base">Google AI Studio</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1A1A1A] text-indigo-400 border border-[#333333]">
                  Platform
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-[#222222] hidden sm:block" />

          {/* Project Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 text-xs text-[#AAAAAA] hover:text-white bg-[#1A1A1A] hover:bg-[#222222] px-2.5 py-1.5 rounded-md border border-[#333333] transition-colors"
            >
              <span className="text-[#777777]">Project:</span>
              <span className="font-mono font-medium text-[#E0E0E0]">gen-lang-client-0203671459</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
            </button>

            {projectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-[#0F0F0F] border border-[#333333] rounded-lg shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase tracking-widest text-[#555555] font-bold px-2 py-1">
                  Active Cloud Project
                </div>
                <div className="p-2 rounded-md bg-[#1A1A1A] border border-[#333333] text-xs text-indigo-300 font-mono flex items-center justify-between">
                  <span>gen-lang-client-0203671459</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="mt-2 pt-2 border-t border-[#222222] text-[11px] text-[#777777] px-2 flex items-center justify-between">
                  <span>Region: asia-southeast1</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Model Selector & Actions */}
        <div className="flex items-center gap-3">
          {/* Model Switcher */}
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222222] text-white px-3 py-1.5 rounded-md border border-[#333333] text-xs font-medium transition-all shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{currentModel?.name}</span>
              {currentModel?.badge && (
                <span className="hidden lg:inline-block text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {currentModel.badge}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[#777777] ml-1" />
            </button>

            {modelDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#0F0F0F] border border-[#333333] rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase tracking-widest text-[#555555] font-bold px-2.5 py-1.5">
                  Select Gemini Model
                </div>
                <div className="space-y-1 mt-1">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                        selectedModel === m.id
                          ? 'bg-[#1A1A1A] border border-indigo-500/40 text-white'
                          : 'hover:bg-[#151515] text-[#AAAAAA]'
                      }`}
                    >
                      <div className="mt-0.5">
                        <Cpu className={`w-4 h-4 ${selectedModel === m.id ? 'text-indigo-400' : 'text-[#777777]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{m.name}</span>
                          {m.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#222222] text-[#999999] border border-[#333333]">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#777777] truncate mt-0.5">{m.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#555555] font-mono">
                          <span>Context: {m.contextWindow}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A1A1A] border border-[#333333] text-xs">
            {hasApiKey ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-emerald-400 text-xs font-medium">API Tier: Pro</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="text-amber-300 text-xs font-medium">API Tier: Sandbox</span>
              </>
            )}
          </div>

          {/* Get Code Button */}
          <button
            onClick={onOpenGetCode}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Get Code</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-[#999999] hover:text-white hover:bg-[#1A1A1A] rounded-md border border-transparent hover:border-[#333333] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-6 px-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#999999] hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-[#777777]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
