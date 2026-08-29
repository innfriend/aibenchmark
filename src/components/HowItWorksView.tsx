import React from 'react';
import { Upload, GitMerge, Cpu, Download, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Model Ingestion & Graph Parsing',
      desc: 'Upload standard weights in ONNX, PyTorch, Safetensors, or TFLite format. CorePick extracts operator layers, tensor dimensions, FLOPs, and parameter distributions automatically.',
      codeSnippet: '$ corepick inspect --model yolov8x.onnx --verbose',
    },
    {
      number: '02',
      icon: GitMerge,
      title: 'Operator Roofline & Fusion Optimization',
      desc: 'The compiler identifies memory bandwidth saturation and applies automatic layer fusion rules (Conv+BN+SiLU, Multi-Head Attention caches, and fused LayerNorm).',
      codeSnippet: 'Applying rule: PointWiseFusion (42 layers collapsed)',
    },
    {
      number: '03',
      icon: Cpu,
      title: 'Hardware-in-the-Loop Benchmarking',
      desc: 'Simulate or benchmark directly on connected device clusters across NVIDIA GPUs, Qualcomm NPUs, Intel AMX, and Apple Silicon across customizable batch sweeps.',
      codeSnippet: 'Benchmarking on 6 target device clusters (10,000 warmups)',
    },
    {
      number: '04',
      icon: Download,
      title: 'Deployment Code & Container Export',
      desc: 'Export production-ready C++ / Python wrappers, ONNX Runtime execution provider configs, Dockerfiles, and Kubernetes GPU manifests with a single click.',
      codeSnippet: '$ docker run -d --gpus all -p 8080:8080 corepick-engine:1.0',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#07090E] text-slate-100 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Step-by-Step Workflow
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            How CorePick Accelerates Your Inference Pipeline
          </h1>
          <p className="text-slate-400 text-sm">
            From raw neural network weights to verified sub-millisecond production inference in four streamlined steps.
          </p>
        </div>

        {/* Workflow Timeline */}
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-extrabold font-mono text-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-bold text-white font-mono">{step.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                  <div className="p-3 bg-[#07090E] rounded-xl border border-[#1E293B] font-mono text-xs text-emerald-400">
                    <code>{step.codeSnippet}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-cyan-950 to-emerald-950 border border-cyan-800/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">Try with a pre-loaded model preset</h3>
            <p className="text-xs text-slate-300">Run YOLOv8, LLaMA-3, or Whisper benchmarks in less than 30 seconds.</p>
          </div>
          <button
            onClick={() => onNavigate('app-analyze')}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-[#07090E] font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            Launch Wizard
          </button>
        </div>
      </div>
    </div>
  );
};
