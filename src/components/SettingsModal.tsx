import React from 'react';
import { X, Shield, Key, Sliders, Info, ExternalLink, CheckCircle } from 'lucide-react';
import { ModelParameters } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  parameters: ModelParameters;
  onUpdateParameters: (params: Partial<ModelParameters>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  hasApiKey,
  parameters,
  onUpdateParameters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222] bg-[#151515]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Platform Settings & Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* API Key Status */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#222222] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Google Cloud / AI Studio Credentials</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                hasApiKey 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {hasApiKey ? 'Connected via Secrets' : 'Preview Sandbox Mode'}
              </span>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed">
              API Keys in Google AI Studio are injected automatically via the backend runtime. To modify or attach a live paid API key, use the <strong>Settings &gt; Secrets</strong> menu in the AI Studio header.
            </p>
          </div>

          {/* Safety Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">Safety & Content Moderation Thresholds</h4>
            </div>
            <p className="text-xs text-[#888888]">
              Adjust safety filter blocking sensitivity for safety evaluation categories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Harassment', key: 'harassment' },
                { label: 'Hate Speech', key: 'hateSpeech' },
                { label: 'Sexually Explicit', key: 'sexual' },
                { label: 'Dangerous Content', key: 'dangerous' },
              ].map((category) => (
                <div key={category.key} className="p-3 bg-[#151515] rounded-xl border border-[#222222]">
                  <span className="text-xs font-medium text-[#CCCCCC] block mb-1.5">{category.label}</span>
                  <select
                    value={parameters.safetySettings?.[category.key as keyof typeof parameters.safetySettings] || 'BLOCK_MEDIUM'}
                    onChange={(e) => {
                      const updatedSafety = {
                        ...(parameters.safetySettings || {
                          harassment: 'BLOCK_MEDIUM',
                          hateSpeech: 'BLOCK_MEDIUM',
                          sexual: 'BLOCK_MEDIUM',
                          dangerous: 'BLOCK_MEDIUM',
                        }),
                        [category.key]: e.target.value,
                      };
                      onUpdateParameters({ safetySettings: updatedSafety as any });
                    }}
                    className="w-full bg-[#050505] border border-[#333333] rounded-lg text-xs text-[#DDDDDD] px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BLOCK_NONE">Block None</option>
                    <option value="BLOCK_LOW">Block Low & Above</option>
                    <option value="BLOCK_MEDIUM">Block Medium & Above</option>
                    <option value="BLOCK_HIGH">Block High Only</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry & Headers */}
          <div className="p-4 rounded-xl bg-[#050505] border border-[#222222] space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#888888]" />
              <span className="text-xs font-semibold text-[#CCCCCC]">Telemetry & User Agent Compliance</span>
            </div>
            <p className="text-xs text-[#888888]">
              All server-side requests are formatted with standard <code className="text-indigo-300 font-mono text-[11px]">User-Agent: aistudio-build</code> headers for official Google Cloud telemetry tracking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#222222] bg-[#151515] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
