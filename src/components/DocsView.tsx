import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen, Code2, Cpu, ArrowRight } from 'lucide-react';

interface DocsViewProps {
  onNavigate: (view: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({ onNavigate }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    {
      id: 'quickstart',
      title: 'Quickstart & CLI Agent Installation',
      desc: 'Install the CorePick command-line daemon to profile neural models directly on your local GPU / NPU hardware.',
      code: `# Install the CorePick CLI Agent
curl -sSL https://corepick.ai/install.sh | bash

# Authenticate your terminal
corepick login --token cp_live_99214488

# Profile a local ONNX model
corepick profile ./models/yolov8x.onnx --target=rtx4090,h100,qnn --precision=int8

# Export optimized TensorRT engine
corepick export ./models/yolov8x.onnx --runtime=tensorrt --output=./dist/`,
    },
    {
      id: 'rest-api',
      title: 'CorePick REST API Reference',
      desc: 'Trigger programmatic profiling jobs, retrieve Pareto optimal models, and stream live kernel benchmarks via JSON APIs.',
      code: `# POST /api/jobs/create
curl -X POST https://api.corepick.ai/v1/jobs/create \\
  -H "Authorization: Bearer cp_live_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "modelId": "yolov8x-det",
    "objective": "lowest_latency",
    "targetPrecisions": ["FP16", "INT8"],
    "targetHardwareIds": ["nvidia-rtx-4090", "qualcomm-snapdragon-x-elite"]
  }'`,
    },
    {
      id: 'python-sdk',
      title: 'Python SDK Integration (`corepick-py`)',
      desc: 'Embed automated hardware profiling directly inside your PyTorch training and fine-tuning scripts.',
      code: `import torch
import corepick

model = MyVisionTransformer().cuda()
input_sample = torch.randn(1, 3, 224, 224, device='cuda')

# Automated Roofline & Quantization Audit
report = corepick.audit(
    model, 
    sample_input=input_sample, 
    target_hardware=["nvidia-rtx-4090", "nvidia-h100-sxm"],
    precisions=["FP16", "INT8"]
)

print(f"Optimal Device: {report.best_hardware.name}")
print(f"Latency: {report.best_latency_ms} ms | Cost: {report.cost_per_million}")`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#07090E] text-slate-100 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-[#0D1322] border border-[#1E293B] p-6 sm:p-8 rounded-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Documentation & CLI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            CorePick Documentation & Integration Guides
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Everything you need to integrate hardware-in-the-loop profiling into your MLOps CI/CD pipelines, local workstation terminals, and cloud inference clusters.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.id} className="bg-[#0D1322] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{sec.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{sec.desc}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(sec.code, sec.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131B2E] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono rounded-lg border border-[#27354F] transition-colors cursor-pointer"
                >
                  {copiedSection === sec.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#07090E] border border-[#1E293B] rounded-xl p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-cyan-300 leading-relaxed">
                  <code>{sec.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
