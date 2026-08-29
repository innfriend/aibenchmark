import React from 'react';
import { 
  Zap, 
  Activity, 
  Cpu, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Play, 
  Plus, 
  ChevronRight,
  Server,
  Network,
  Sliders,
  Code2,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { MODEL_CATALOG, SAMPLE_OPTIMIZATION_JOBS, HARDWARE_CATALOG } from '../data/mockData';
import { OptimizationJob } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onSelectJob: (job: OptimizationJob) => void;
  onOpenWizardWithModel: (modelId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectJob,
  onOpenWizardWithModel,
}) => {
  const recentJobs = SAMPLE_OPTIMIZATION_JOBS;

  return (
    <div className="flex-1 flex flex-col bg-[#07090E] text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Welcome & KPI Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            Optimization Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inference profiling, compiler telemetry, and Pareto hardware matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('app-analyze')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#07090E] text-xs font-extrabold shadow-lg shadow-cyan-500/20 cursor-pointer transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Profiling Job</span>
          </button>
        </div>
      </div>

      {/* Advanced Engineering Suites Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('app-inspector')}
          className="bg-gradient-to-br from-[#0D1322] to-[#131B2E] border border-cyan-900/40 hover:border-cyan-400/80 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center border border-cyan-800/40 group-hover:bg-cyan-500 group-hover:text-[#07090E] transition-colors">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
              Interactive
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
              Graph & Roofline
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Layer bottleneck heatmaps, operational intensity & quantization sensitivity.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('app-sandbox')}
          className="bg-gradient-to-br from-[#0D1322] to-[#131B2E] border border-indigo-900/40 hover:border-indigo-400/80 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center border border-indigo-800/40 group-hover:bg-indigo-500 group-hover:text-[#07090E] transition-colors">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              Recommender
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-white group-hover:text-indigo-300 transition-colors">
              Hardware Sandbox
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Side-by-side delta benchmarks & SLA constraint-driven silicon matcher.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('app-deploy')}
          className="bg-gradient-to-br from-[#0D1322] to-[#131B2E] border border-emerald-900/40 hover:border-emerald-400/80 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800/40 group-hover:bg-emerald-500 group-hover:text-[#07090E] transition-colors">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              Simulator
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
              Deploy & Stream Sim
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Triton/vLLM exporters with real-time live token streaming speed tester.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('app-compiler')}
          className="bg-gradient-to-br from-[#0D1322] to-[#131B2E] border border-amber-900/40 hover:border-amber-400/80 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center border border-amber-800/40 group-hover:bg-amber-500 group-hover:text-[#07090E] transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              Diagnostics
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-white group-hover:text-amber-300 transition-colors">
              Compiler Flags & Diag
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Custom ONNX upload, TRT kernel tuning, and hardware fallback scanner.
            </p>
          </div>
        </div>
      </div>

      {/* Knowledge Base Featured Callout Banner */}
      <div 
        onClick={() => onNavigate('knowledge-base')}
        className="bg-gradient-to-r from-cyan-950/60 via-[#0D1322] to-indigo-950/60 border border-cyan-800/40 hover:border-cyan-400/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.01] group shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500 group-hover:text-[#07090E] transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                AI Inference & Hardware Knowledge Base
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                SEO Technical Guides
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Read peer-reviewed guides on AWQ vs GPTQ quantization, Roofline arithmetic intensity, PagedAttention, and 2026 GPU TCO economics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold flex-shrink-0 group-hover:translate-x-1 transition-transform">
          <span>Explore Knowledge Hub</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Models Profiled</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">482</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14 this week across 6 teams</span>
          </div>
        </div>

        <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Avg. Latency Drop</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">-68.4%</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Via TensorRT & QNN Fusions</span>
          </div>
        </div>

        <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Estimated Cloud Saved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">$34,850</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Projected this month</span>
          </div>
        </div>

        <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Device Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300">32 Nodes</div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>H100, RTX 4090, Snapdragon X</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Model Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono">Quick Launch Model Profiler</h3>
            <p className="text-xs text-slate-400">Choose a pre-profiled foundation architecture to test compiler optimizations.</p>
          </div>
          <button
            onClick={() => onNavigate('app-models')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Models</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODEL_CATALOG.slice(0, 3).map((model) => (
            <div
              key={model.id}
              className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-5 space-y-4 hover:border-cyan-500/50 transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                    {model.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2 font-mono group-hover:text-cyan-300 transition-colors">
                    {model.name}
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#131B2E] px-2 py-1 rounded-lg">
                  {model.parameterCountFormatted}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {model.description}
              </p>

              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{model.totalFlopsGflops} GFLOPs</span>
                <button
                  onClick={() => onOpenWizardWithModel(model.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-[#07090E] font-bold text-xs rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Profile Model</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Optimization Jobs Table */}
      <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-mono">Recent Optimization Runs</h3>
            <p className="text-xs text-slate-400">Click any run to view the interactive Pareto frontier and kernel flamegraph.</p>
          </div>
          <button
            onClick={() => onNavigate('app-results')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Results View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#07090E] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="py-3 px-4">Job ID & Model</th>
                <th className="py-3 px-4">Target Objective</th>
                <th className="py-3 px-4">Precisions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Best Hardware</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
              {recentJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="hover:bg-[#131B2E] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {job.modelName}
                    </div>
                    <div className="text-[10px] text-slate-500">{job.id}</div>
                  </td>
                  <td className="py-3 px-4 uppercase text-[11px] text-cyan-400 font-semibold">
                    {job.objective.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {job.targetPrecisions.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-[#1A2338] text-slate-300 text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{job.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {job.results[0]?.hardwareName || 'NVIDIA RTX 4090'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-800/60 transition-colors">
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
