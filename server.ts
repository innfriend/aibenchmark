import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { HARDWARE_CATALOG, MODEL_CATALOG, SAMPLE_OPTIMIZATION_JOBS, CLOUD_TCO_MODELS, SAMPLE_CODE_SNIPPETS } from './src/data/mockData.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory jobs storage seeded with sample jobs
let jobsDatabase = [...SAMPLE_OPTIMIZATION_JOBS];

// Lazy GoogleGenAI client initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// ----------------------------------------------------
// Health & Telemetry
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    appName: 'CorePick - AI Model Hardware & Inference Optimization Platform',
    hasApiKey: hasKey,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// Hardware Catalog API
// ----------------------------------------------------
app.get('/api/hardware', (req: Request, res: Response) => {
  const { vendor, type, search } = req.query;
  let results = [...HARDWARE_CATALOG];

  if (vendor && typeof vendor === 'string' && vendor !== 'all') {
    results = results.filter((h) => h.vendor.toLowerCase() === vendor.toLowerCase());
  }

  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter((h) => h.type.toLowerCase() === type.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.architecture.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
    );
  }

  res.json({ hardware: results, total: results.length });
});

// ----------------------------------------------------
// Models Catalog API
// ----------------------------------------------------
app.get('/api/models', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let results = [...MODEL_CATALOG];

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ models: results, total: results.length });
});

// ----------------------------------------------------
// Optimization Jobs API
// ----------------------------------------------------
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json({ jobs: jobsDatabase });
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = jobsDatabase.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Optimization job not found' });
  }
  res.json({ job });
});

// Create and trigger a new profiling & benchmarking job
app.post('/api/jobs/create', (req: Request, res: Response) => {
  try {
    const {
      modelId,
      objective = 'lowest_latency',
      targetPrecisions = ['FP16', 'INT8'],
      targetHardwareIds = ['nvidia-rtx-4090', 'nvidia-h100-sxm', 'qualcomm-snapdragon-x-elite'],
      baselineHardwareId = 'nvidia-rtx-4090',
    } = req.body;

    const model = MODEL_CATALOG.find((m) => m.id === modelId) || MODEL_CATALOG[0];
    const newJobId = `job-${model.slug}-${Date.now().toString().slice(-4)}`;

    // Generate benchmark results based on selected hardware and model properties
    const generatedResults = targetHardwareIds.map((hwId: string) => {
      const hw = HARDWARE_CATALOG.find((h) => h.id === hwId) || HARDWARE_CATALOG[0];
      const isPrecisionInt8 = targetPrecisions.includes('INT8');
      const precision = isPrecisionInt8 ? 'INT8' : 'FP16';

      // Realistic latency estimation based on model GFLOPs and hardware TFLOPS/TOPS
      const effectiveCompute = precision === 'INT8' ? hw.int8Tops : hw.fp16Tflops;
      const baseLatencyMs = Math.max(0.8, Number(((model.totalFlopsGflops / (effectiveCompute * 1000)) * 1200).toFixed(2)));
      const throughputFps = Number((1000 / baseLatencyMs).toFixed(1));
      const powerWatts = Math.min(hw.tdpWatts, Math.max(15, Math.round(hw.tdpWatts * 0.85)));
      const costPerMillion = Number(((baseLatencyMs * (hw.hourlyCloudCostUsd || 0.5) / 3600)).toFixed(2));
      const memoryUsedMb = Math.round(model.modelSizeBytesMb * (precision === 'INT8' ? 0.55 : 1.05));

      return {
        hardwareId: hw.id,
        hardwareName: hw.name,
        vendor: hw.vendor,
        hardwareType: hw.type,
        runtimeEngine: hw.supportedRuntimes[0] || 'TensorRT',
        precision,
        batchSize: 1,
        latencyMs: baseLatencyMs,
        p99LatencyMs: Number((baseLatencyMs * 1.15).toFixed(2)),
        throughputFps,
        powerConsumptionWatts: powerWatts,
        memoryUsedMb,
        costPerMillionInferencesUsd: costPerMillion,
        efficiencyScore: Math.round(Math.min(99, 100 - (baseLatencyMs * 2))),
        isParetoOptimal: hw.id === 'nvidia-h100-sxm' || hw.id === 'nvidia-rtx-4090' || hw.id === 'qualcomm-snapdragon-x-elite',
      };
    });

    const newJob: any = {
      id: newJobId,
      modelId: model.id,
      modelName: model.name,
      modelCategory: model.category,
      createdAt: new Date().toISOString(),
      status: 'completed',
      objective,
      targetPrecisions,
      targetHardwareIds,
      selectedBaselineHardwareId: baselineHardwareId,
      results: generatedResults,
      flamegraph: SAMPLE_OPTIMIZATION_JOBS[0].flamegraph,
      batchSweepData: SAMPLE_OPTIMIZATION_JOBS[0].batchSweepData,
      aiInsights: {
        summary: `Optimization job completed for ${model.name}. Model achieved maximum throughput across target hardware clusters with ${targetPrecisions.join('/')} precisions.`,
        topBottleneck: model.topOperators[0]?.name ? `${model.topOperators[0].name} kernel memory access` : 'Memory bandwidth roofline saturation',
        recommendedDevice: targetHardwareIds[0] || 'nvidia-rtx-4090',
        estimatedCostSavingsPct: 65.4,
        recommendedRuntime: 'TensorRT / QNN runtime engines with direct INT8 calibration cache',
        tuningFlags: ['--builderOptimizationLevel=5', '--fp16', '--int8', '--workspace=4096MB'],
      },
    };

    jobsDatabase = [newJob, ...jobsDatabase];
    res.json({ job: newJob });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Cloud TCO Models API
// ----------------------------------------------------
app.get('/api/tco-models', (req: Request, res: Response) => {
  res.json({ tcoModels: CLOUD_TCO_MODELS });
});

// ----------------------------------------------------
// AI Optimization Assistant & Insights API (Gemini Powered)
// ----------------------------------------------------
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { modelName, targetHardware, userPrompt, contextData } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are CorePick AI Optimization Engine - an elite deep learning compiler and inference optimization engineer.
You possess deep expertise in CUDA, TensorRT, Triton kernels, ONNX Runtime, OpenVINO, Qualcomm QNN/Hexagon, vLLM, Apple Metal/CoreML, quantization (AWQ, GPTQ, SmoothQuant, INT8 PTQ), and memory bandwidth roofline modeling.
Provide actionable, mathematically rigorous, and production-ready recommendations for model optimization, kernel flamegraph analysis, operator fusions, and hardware selection. Keep advice concise, crisp, and high-impact.`;

    if (!ai) {
      // Smart simulated AI recommendations for local/preview mode
      const latencyMs = Math.floor(Math.random() * 250) + 180;
      const simulatedText = `### CorePick Optimization Analysis for **${modelName || 'Neural Model'}**

#### 1. Hardware-to-Kernel Alignment Analysis
- **Selected Target Cluster**: ${targetHardware || 'NVIDIA Tensor Core & Qualcomm NPU'}
- **Memory Bandwidth vs Compute Bound**: The model shows high arithmetic intensity in dense layers, transitioning to a memory-bandwidth-bound state in normalization and attention projection steps.
- **Roofline Position**: Operating at ~72% of theoretical HBM/GDDR bandwidth saturation.

#### 2. Key Operator Bottlenecks & Fusion Opportunities
- **Fused Layer Recommendation**: Fuse consecutive PointWise operators (\`Conv2D + BatchNorm + SiLU\` or \`QKV GEMM\`) to eliminate global memory roundtrips.
- **Quantization Strategy**: Apply **INT8 Post-Training Quantization (PTQ)** with KL-divergence calibration for Vision backbones, or **INT4 AWQ / Marlin** for LLMs to reduce weight traffic by 75%.
- **Zero-Copy Host I/O**: Ensure pinned page-locked memory buffers (\`cudaMallocHost\`) and asynchronous streams (\`cudaStreamCreateWithFlags\`) are utilized in the runtime harness.

#### 3. Recommended Compiler Flags
\`\`\`bash
# Optimal TensorRT / QNN Build Configuration
trtexec --onnx=${(modelName || 'model').toLowerCase().replace(/\\s+/g, '_')}.onnx \\
  --saveEngine=optimized_engine.plan \\
  --fp16 --int8 \\
  --builderOptimizationLevel=5 \\
  --workspace=4096MB \\
  --profilingVerbosity=detailed
\`\`\`

*(Note: Connect your Gemini API Key in Settings to unlock real-time streaming LLM analysis)*`;

      return res.json({
        text: simulatedText,
        latencyMs,
        simulated: true,
      });
    }

    const promptText = `Analyze optimization targets for model "${modelName || 'AI Model'}" targeting hardware "${targetHardware || 'NVIDIA & NPU Accelerators'}".
User Question: "${userPrompt || 'How do I optimize this architecture for maximum throughput and minimum latency?'}"
Context details: ${JSON.stringify(contextData || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      text: response.text || '',
      latencyMs: Date.now() - startTime,
      simulated: false,
    });
  } catch (error: any) {
    console.error('CorePick AI Advisor Error:', error);
    res.status(500).json({ error: error.message || 'AI Advisor failed' });
  }
});

// ----------------------------------------------------
// AI Code Generation API
// ----------------------------------------------------
app.post('/api/ai/generate-code', async (req: Request, res: Response) => {
  try {
    const { modelName, runtime, precision, language } = req.body;
    const ai = getGenAI();

    if (!ai) {
      const snippets = SAMPLE_CODE_SNIPPETS['yolov8x-det'] || [];
      const match = snippets.find((s) => s.runtime === runtime && s.language === language) || snippets[0];
      return res.json({ code: match?.code || '// Code generated for ' + modelName, simulated: true });
    }

    const prompt = `Write a production-ready, high-performance ${language} deployment code snippet for model "${modelName}" using runtime "${runtime}" with precision "${precision}". Include asynchronous CUDA/NPU stream initialization, buffer management, and error handling.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ code: response.text || '', simulated: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Setup Vite Middleware / Production Server
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CorePick AI Optimization Platform listening on http://localhost:${PORT}`);
  });
}

startServer();
