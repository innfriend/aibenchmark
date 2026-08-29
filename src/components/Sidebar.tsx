import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Zap, 
  GitCompare, 
  Cpu, 
  BarChart3, 
  Terminal, 
  FileText, 
  Server, 
  Network,
  Sliders,
  Code2,
  SlidersHorizontal,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    {
      group: 'OPTIMIZATION WORKSPACE',
      items: [
        { id: 'app-dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
        { id: 'app-models', label: 'Models & Ingestion', icon: Layers },
        { id: 'app-analyze', label: 'Profiler Wizard', icon: Zap, highlight: true },
        { id: 'app-results', label: 'Results & Pareto', icon: GitCompare },
        { id: 'app-inspector', label: 'Graph & Roofline', icon: Network, badge: 'New' },
        { id: 'app-sandbox', label: 'Hardware Sandbox', icon: Sliders, badge: 'New' },
        { id: 'app-fleet', label: 'Hardware Fleet Matrix', icon: Cpu },
      ]
    },
    {
      group: 'BENCHMARKS & DEPLOYMENT',
      items: [
        { id: 'app-deploy', label: 'Deploy & Stream Sim', icon: Code2, badge: 'New' },
        { id: 'app-compiler', label: 'Compiler Tuning & Diag', icon: SlidersHorizontal, badge: 'New' },
        { id: 'app-benchmarks', label: 'Verified Benchmarks', icon: BarChart3 },
        { id: 'app-cli', label: 'CLI & Local Agent', icon: Terminal },
        { id: 'app-reports', label: 'Reports & Export', icon: FileText },
        { id: 'app-admin', label: 'Fleet Telemetry', icon: Server },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#07090E] border-r border-[#1E293B] flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        {/* Navigation Groups */}
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              {group.group}
            </span>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                        : item.highlight
                        ? 'bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50 border border-emerald-800/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#131B2E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Engine Status */}
      <div className="pt-4 border-t border-[#1E293B] space-y-2">
        <div className="flex items-center justify-between px-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">Daemon Active</span>
          </div>
          <span className="bg-[#131B2E] px-1.5 py-0.5 rounded border border-[#27354F] text-cyan-300">v2.5.4</span>
        </div>
      </div>
    </aside>
  );
};
