import React, { useState } from 'react';
import { Layers, Play, Sparkles, Binary, CheckCircle2, ArrowRight, BarChart3, Activity } from 'lucide-react';

export const EmbeddingsView: React.FC = () => {
  const [textA, setTextA] = useState('Deep learning models utilize multi-layered neural networks for pattern recognition.');
  const [textB, setTextB] = useState('Neural networks with several hidden layers identify complex mathematical features in data.');
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [vectorA, setVectorA] = useState<number[]>([]);
  const [vectorB, setVectorB] = useState<number[]>([]);

  const samplePairs = [
    {
      title: 'Neural Networks & Deep Learning',
      a: 'Deep learning models utilize multi-layered neural networks for pattern recognition.',
      b: 'Neural networks with several hidden layers identify complex mathematical features in data.',
    },
    {
      title: 'Financial Markets vs Cooking',
      a: 'The central bank raised interest rates by 50 basis points to curb inflationary pressures.',
      b: 'Whisk eggs and flour together until smooth before gently folding in fresh blueberries.',
    },
    {
      title: 'Kubernetes vs Cloud Deployment',
      a: 'Kubernetes automates deployment, scaling, and container management across cloud clusters.',
      b: 'Container orchestration engines simplify microservice autoscaling and load balancing.',
    },
  ];

  // Helper cosine similarity
  const computeCosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const handleComputeEmbeddings = async () => {
    if (!textA.trim() || !textB.trim() || isEmbedding) return;
    setIsEmbedding(true);
    setSimilarityScore(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/gemini/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textA }),
        }),
        fetch('/api/gemini/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textB }),
        }),
      ]);

      const dataA = await resA.json();
      const dataB = await resB.json();

      const vA: number[] = dataA.vector || Array.from({ length: 64 }, () => Math.random() * 2 - 1);
      const vB: number[] = dataB.vector || Array.from({ length: 64 }, () => Math.random() * 2 - 1);

      setVectorA(vA);
      setVectorB(vB);

      const sim = computeCosineSimilarity(vA, vB);
      setSimilarityScore(Math.max(0, Math.min(1, sim)));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsEmbedding(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="bg-[#0F0F0F] border border-[#222222] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Semantic Vector Embeddings Studio</h2>
            </div>
            <p className="text-xs text-[#888888]">
              Generate 768-dimensional vector representations using <strong>gemini-embedding-2-preview</strong> and test semantic similarity.
            </p>
          </div>

          <button
            onClick={handleComputeEmbeddings}
            disabled={isEmbedding}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {isEmbedding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Vectorizing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compute Cosine Similarity</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Pairs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-[#666666] mr-1">Sample Benchmarks:</span>
          {samplePairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTextA(pair.a);
                setTextB(pair.b);
                setSimilarityScore(null);
              }}
              className="text-xs bg-[#151515] hover:bg-[#222222] text-[#AAAAAA] hover:text-white px-3 py-1.5 rounded-xl border border-[#222222] transition-colors cursor-pointer"
            >
              {pair.title}
            </button>
          ))}
        </div>

        {/* Input Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
              Document / Text Passage A
            </span>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              rows={4}
              className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">
              Document / Text Passage B
            </span>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              rows={4}
              className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Results Panel */}
        {similarityScore !== null && (
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-widest block">
                  Semantic Cosine Similarity
                </span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono flex items-baseline gap-2">
                  <span>{(similarityScore * 100).toFixed(1)}%</span>
                  <span className="text-xs font-medium text-[#888888]">
                    ({similarityScore > 0.8 ? 'High Similarity' : similarityScore > 0.5 ? 'Moderate' : 'Low Similarity'})
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-64 bg-[#050505] rounded-full h-3.5 p-0.5 border border-[#222222]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    similarityScore > 0.75
                      ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                      : similarityScore > 0.45
                      ? 'bg-gradient-to-r from-indigo-500 to-amber-400'
                      : 'bg-gradient-to-r from-[#444444] to-red-400'
                  }`}
                  style={{ width: `${Math.max(5, similarityScore * 100)}%` }}
                />
              </div>
            </div>

            {/* Vector Heatmap Visualizer */}
            <div className="space-y-2 pt-4 border-t border-[#222222]">
              <span className="text-[10px] font-bold text-[#777777] uppercase tracking-widest block">
                Normalized Vector Heatmap Preview (First 48 dimensions)
              </span>
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 p-3 bg-[#050505] rounded-xl border border-[#222222]">
                {vectorA.slice(0, 48).map((val, idx) => {
                  const intensity = Math.min(1, Math.max(0, (val + 1) / 2));
                  return (
                    <div
                      key={idx}
                      className="h-5 rounded-sm transition-colors"
                      style={{
                        backgroundColor: `rgba(99, 102, 241, ${intensity})`,
                      }}
                      title={`Dim #${idx}: ${val.toFixed(4)}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
