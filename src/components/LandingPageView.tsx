import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Activity, 
  GitCompare, 
  Flame, 
  Terminal, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Server, 
  TrendingUp, 
  Sliders, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { HARDWARE_CATALOG, MODEL_CATALOG } from '../data/mockData';

interface LandingPageViewProps {
  onNavigate: (view: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onNavigate }) => {
  const [selectedHwIndex, setSelectedHwIndex] = useState(0);
  const sampleHws = [
    {
      name: 'NVIDIA RTX 4090 (24GB)',
      vendor: 'NVIDIA',
      type: 'Workstation GPU',
      latencyMs: '2.34 ms',
      throughputFps: '427 FPS',
      powerWatts: '195 W',
      efficiency: '2.19 FPS/W',
      costPerMillion: '$0.48',
      score: 98.2,
      badge: 'Best Cost-Performance',
    },
    {
      name: 'NVIDIA H100 SXM5 (80GB)',
      vendor: 'NVIDIA',
      type: 'Data Center GPU',
      latencyMs: '1.12 ms',
      throughputFps: '892 FPS',
      powerWatts: '340 W',
      efficiency: '2.62 FPS/W',
      costPerMillion: '$1.51',
      score: 94.5,
      badge: 'Maximum Speed',
    },
    {
      name: 'Qualcomm Snapdragon X Elite',
      vendor: 'Qualcomm',
      type: 'Hexagon NPU',
      latencyMs: '8.64 ms',
      throughputFps: '115 FPS',
      powerWatts: '14.5 W',
      efficiency: '7.98 FPS/W',
      costPerMillion: '$0.04',
      score: 96.8,
      badge: 'Supreme Efficiency',
    },
    {
      name: 'Apple M3 Max (128GB Unified)',
      vendor: 'Apple',
      type: 'Unified SoC',
      latencyMs: '5.40 ms',
      throughputFps: '185 FPS',
      powerWatts: '48.0 W',
      efficiency: '3.85 FPS/W',
      costPerMillion: '$0.12',
      score: 89.4,
      badge: 'Local Zero-Cloud',
    },
  ];

  const activeHw = sampleHws[selectedHwIndex];

  return (
    <div className="flex-1 flex flex-col bg-[#07090E] text-slate-100 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Next-Gen Model-to-Hardware Resource Optimization</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight font-mono">
            Maximize Inference Speed. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Minimize Compute Cost.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Analyze neural network graphs, identify memory roofline bottlenecks, benchmark across GPUs, NPUs, and CPUs, and generate native TensorRT, ONNX, and QNN deployment engines.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('app-analyze')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#07090E] font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Run Interactive Profiler</span>
            </button>

            <button
              onClick={() => onNavigate('app-dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#131B2E] hover:bg-[#1C2740] text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-[#27354F] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Demo Workspace</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Trust Metric Chips */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl border-t border-[#1E293B]/80 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">68.4%</div>
              <div className="text-xs text-slate-400">Avg. Latency Reduction</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">30+</div>
              <div className="text-xs text-slate-400">Hardware Targets</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400">10.4M+</div>
              <div className="text-xs text-slate-400">Tokens / Inferences Profiled</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">$1.4M+</div>
              <div className="text-xs text-slate-400">Cloud TCO Saved</div>
            </div>
          </div>
        </div>

        {/* Live Interactive Benchmark Previewer */}
        <div className="mt-12 bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">Live Hardware Optimization Benchmark</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Model: <strong>YOLOv8x (Detection)</strong> • Resolution: 640x640 • Quantization: INT8 TensorRT/QNN
              </p>
            </div>

            {/* Hardware Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
              {sampleHws.map((hw, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedHwIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedHwIndex === idx
                      ? 'bg-cyan-500 text-[#07090E] font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-[#131B2E] text-slate-400 hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  {hw.vendor}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#07090E] border border-[#1E293B] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Inference Latency</span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">{activeHw.latencyMs}</div>
              <span className="text-[11px] text-emerald-400">P99: +12% jitter</span>
            </div>

            <div className="bg-[#07090E] border border-[#1E293B] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Throughput</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">{activeHw.throughputFps}</div>
              <span className="text-[11px] text-slate-400">Batch Size: 1</span>
            </div>

            <div className="bg-[#07090E] border border-[#1E293B] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Energy Efficiency</span>
              <div className="text-2xl font-extrabold font-mono text-indigo-400">{activeHw.efficiency}</div>
              <span className="text-[11px] text-slate-400">Power: {activeHw.powerWatts}</span>
            </div>

            <div className="bg-[#07090E] border border-[#1E293B] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Cost / 1M Inferences</span>
              <div className="text-2xl font-extrabold font-mono text-amber-400">{activeHw.costPerMillion}</div>
              <span className="text-[11px] text-emerald-400">{activeHw.badge}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#1E293B] text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified reproducible run with CorePick Benchmark Harness v2.5</span>
            </div>
            <button
              onClick={() => onNavigate('app-results')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Full Pareto Frontier & Flamegraph</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillar Bento Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">End-To-End Architecture</div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineered for Deep Learning Performance Engineers
          </h2>
          <p className="text-slate-400 text-sm">
            From ONNX graph decomposition to hardware-in-the-loop validation and automated TensorRT/QNN container packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Kernel Flamegraph & Roofline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drill down into microsecond-level execution times per operator. Instantly distinguish between compute-bound GEMMs and memory-bandwidth-bound activations.
            </p>
            <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1">
              <span>Automatic Bottleneck Detection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Dimensional Pareto Frontier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare trade-offs between Latency (ms), Throughput (FPS), Power Consumption (Watts), and Cloud TCO Cost across 30+ enterprise GPUs and edge NPUs.
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span>Pareto-Optimal Matching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">One-Click Code Generation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export production-ready C++ and Python inference engines for TensorRT, ONNX Runtime (CUDA / QNN / OpenVINO), Dockerfiles, and Kubernetes manifests.
            </p>
            <div className="pt-2 text-xs font-mono text-indigo-400 flex items-center gap-1">
              <span>Production Packaging</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950 via-indigo-950 to-emerald-950 border border-cyan-800/50 p-8 sm:p-12 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              Ready to accelerate your inference pipeline?
            </h2>
            <p className="text-slate-300 text-sm">
              Upload your model architecture or select from popular presets to generate optimized engine binaries and hardware recommendations.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('app-analyze')}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-[#07090E] font-extrabold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              Start Free Profiling Job
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="px-6 py-3.5 bg-[#07090E]/80 hover:bg-[#07090E] text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Read Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
