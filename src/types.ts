export type HardwareType = 'GPU' | 'CPU' | 'NPU' | 'ACCELERATOR' | 'EDGE_SOC';
export type HardwareVendor = 'NVIDIA' | 'Intel' | 'AMD' | 'Qualcomm' | 'Apple' | 'ARM' | 'Google';
export type RuntimeEngine = 'TensorRT' | 'ONNX Runtime' | 'OpenVINO' | 'QNN' | 'CoreML' | 'ROCm' | 'vLLM' | 'TFLite' | 'TorchScript';
export type PrecisionType = 'FP32' | 'FP16' | 'BF16' | 'INT8' | 'INT4';
export type OptimizationObjective = 'lowest_latency' | 'highest_throughput' | 'lowest_power' | 'lowest_cost' | 'balanced';
export type ModelCategory = 'Vision' | 'NLP / LLM' | 'Speech & Audio' | 'Multimodal' | 'Generative / Diffusion';
export type ModelFramework = 'ONNX' | 'PyTorch' | 'Safetensors' | 'TensorFlow' | 'TFLite' | 'GGUF';

export interface HardwareSpec {
  id: string;
  name: string;
  vendor: HardwareVendor;
  type: HardwareType;
  architecture: string;
  processNode: string; // e.g. "4nm TSMC", "Intel 4"
  memoryGb: number;
  memoryType: string; // "HBM3e", "GDDR6X", "LPDDR5X", "Unified"
  memoryBandwidthGBs: number;
  tdpWatts: number;
  fp32Tflops: number;
  fp16Tflops: number;
  int8Tops: number;
  int4Tops?: number;
  hourlyCloudCostUsd?: number;
  supportedRuntimes: RuntimeEngine[];
  formFactor: 'Data Center' | 'Workstation / PCIe' | 'Edge / Embedded' | 'Mobile SoC' | 'Cloud TPU';
  description: string;
}

export interface ModelArchitecture {
  id: string;
  name: string;
  slug: string;
  category: ModelCategory;
  framework: ModelFramework;
  version: string;
  parameterCountM: number; // In millions
  parameterCountFormatted: string; // e.g. "8.03 B" or "43.7 M"
  modelSizeBytesMb: number;
  contextLengthOrResolution: string; // e.g. "8192 tokens" or "640x640"
  totalFlopsGflops: number;
  inputShape: string;
  outputShape: string;
  layersCount: number;
  topOperators: { name: string; count: number; percentageTime: number }[];
  fusionOpportunities: {
    pattern: string;
    description: string;
    speedupPct: number;
    memorySavingsMb: number;
  }[];
  description: string;
  recommendedHardware: string[];
  tags: string[];
}

export interface FlamegraphNode {
  id: string;
  name: string;
  operatorType: string;
  durationUs: number;
  durationMs: number;
  percentTotal: number;
  memoryBandwidthGBs: number;
  arithmeticIntensityFlopsPerByte: number;
  isBottleneck: boolean;
  bottleneckReason?: string;
  suggestedOptimization?: string;
  children?: FlamegraphNode[];
}

export interface GraphOperatorNode {
  id: string;
  name: string;
  opType: string;
  inputShapes: string[];
  outputShape: string;
  durationMs: number;
  flopsGflops: number;
  memoryBandwidthGBs: number;
  arithmeticIntensity: number; // FLOPs/byte
  quantizationSensitivityScore: number; // 0 (resilient) to 10 (highly sensitive)
  precisionSupport: PrecisionType[];
  recommendedPrecision: PrecisionType;
  isBottleneck: boolean;
  bottleneckCategory?: 'Memory Bandwidth' | 'Compute Ceiling' | 'Host-Device Transfer' | 'Kernel Launch Overhead';
  fusedWith?: string[];
  attributes?: Record<string, string | number | boolean>;
}

export interface RooflineKernelData {
  name: string;
  opType: string;
  arithmeticIntensity: number; // FLOPs / Byte (X axis)
  performanceTflops: number; // Attainable TFLOPs/s (Y axis)
  timePct: number;
  isMemoryBound: boolean;
}

export interface QuantizationSensitivityLayer {
  layerName: string;
  opType: string;
  fp32PerpOrMap: number;
  fp16PerpOrMap: number;
  int8PerpOrMap: number;
  int4PerpOrMap: number;
  snrLossDb: number; // Signal to noise degradation
  weightSizeMbFp16: number;
  weightSizeMbInt8: number;
  weightSizeMbInt4: number;
  recommendedPrecision: PrecisionType;
  rationale: string;
}

export interface HardwareComparisonMetric {
  hardwareId: string;
  hardwareName: string;
  vendor: HardwareVendor;
  latencyMs: number;
  throughputFps: number;
  tokensPerSec?: number;
  powerWatts: number;
  efficiencyFpsPerWatt: number;
  memoryUsedMb: number;
  monthlyCostUsd: number;
  tcoPerMillionInferences: number;
  ttftMs: number; // Time to first token
  itlMs: number; // Inter-token latency
  fitScore: number; // 0 - 100
}

export interface HardwareConstraintFilter {
  maxMonthlyBudgetUsd: number;
  minThroughput: number;
  maxLatencyMs: number;
  maxPowerWatts: number;
  formFactor: string;
  workloadType: 'Vision / Batch' | 'LLM / Token Streaming' | 'Audio / Realtime' | 'Edge Embedded';
}

export interface CompilerOptimizationFlags {
  trtOptimizationLevel: number; // 0 - 5
  trtWorkspaceSizeGb: number;
  enableFp8TransformerEngine: boolean;
  enableFlashAttention2: boolean;
  enableKernelAutoTuning: boolean;
  enableCudnnHeuristics: boolean;
  enableIoBinding: boolean;
  cpuNumaNodeBinding: boolean;
  cpuAvx512Vnni: boolean;
  qnnHtpBurstMode: boolean;
  onnxGraphOptLevel: 'Disable' | 'Basic' | 'Extended' | 'All';
}

export interface OperatorDiagnosticWarning {
  id: string;
  opName: string;
  opType: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  targetHardware: string;
  issue: string;
  suggestedFix: string;
  autoFixAvailable: boolean;
}

export interface BatchSweepPoint {
  batchSize: number;
  throughputFps: number;
  latencyMs: number;
  p99LatencyMs: number;
  gpuMemoryMb: number;
  powerWatts: number;
  gpuUtilizationPct: number;
  efficiencyFpsPerWatt: number;
}

export interface BenchmarkResult {
  hardwareId: string;
  hardwareName: string;
  vendor: HardwareVendor;
  hardwareType: HardwareType;
  runtimeEngine: RuntimeEngine;
  precision: PrecisionType;
  batchSize: number;
  latencyMs: number;
  p99LatencyMs: number;
  throughputFps: number;
  powerConsumptionWatts: number;
  memoryUsedMb: number;
  costPerMillionInferencesUsd: number;
  efficiencyScore: number; // 0-100 normalized score
  isParetoOptimal: boolean;
  notes?: string;
}

export interface OptimizationJob {
  id: string;
  modelId: string;
  modelName: string;
  modelCategory: ModelCategory;
  createdAt: string;
  status: 'completed' | 'benchmarking' | 'analyzing' | 'queued' | 'failed';
  objective: OptimizationObjective;
  targetPrecisions: PrecisionType[];
  targetHardwareIds: string[];
  selectedBaselineHardwareId: string;
  results: BenchmarkResult[];
  flamegraph: FlamegraphNode[];
  batchSweepData: Record<string, BatchSweepPoint[]>; // hardwareId -> sweep data
  aiInsights?: {
    summary: string;
    topBottleneck: string;
    recommendedDevice: string;
    estimatedCostSavingsPct: number;
    recommendedRuntime: string;
    tuningFlags: string[];
  };
}

export interface CloudInstanceComparison {
  provider: 'AWS' | 'GCP' | 'Azure' | 'On-Premises';
  instanceType: string;
  hardware: string;
  hourlyPriceUsd: number;
  monthlyCostAtFullLoadUsd: number;
  costPerMillionInferencesUsd: number;
  maxThroughputFps: number;
  tcoBreakEvenMonths?: number;
}

export interface DeploymentCodeSnippet {
  language: 'python' | 'cpp' | 'docker' | 'kubernetes' | 'cli';
  runtime: RuntimeEngine;
  title: string;
  filename: string;
  code: string;
  description: string;
}

export interface NavigationTab {
  id: string;
  name: string;
  path: string;
  iconName: string;
  badge?: string;
  group: 'public' | 'app' | 'admin';
}
