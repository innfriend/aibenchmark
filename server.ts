import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy GoogleGenAI client
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

// Model Catalog
const MODEL_CATALOG = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Latest & Recommended',
    category: 'General & Multimodal',
    contextWindow: '1,048,576 tokens',
    maxOutputTokens: 8192,
    description: 'High-speed, hybrid reasoning model for agentic workflows, coding, and general tasks.',
    supportsThinking: true,
    supportsTools: true,
    supportsJson: true,
    supportsMultimodal: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'Deep Reasoning',
    category: 'Reasoning & Coding',
    contextWindow: '2,097,152 tokens',
    maxOutputTokens: 8192,
    description: 'State-of-the-art model for complex STEM problems, large codebase analysis, and deep reasoning.',
    supportsThinking: true,
    supportsTools: true,
    supportsJson: true,
    supportsMultimodal: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: 'Cost Efficient',
    category: 'High Throughput',
    contextWindow: '1,048,576 tokens',
    maxOutputTokens: 8192,
    description: 'Ultra-low latency, budget-friendly model for high-frequency text processing and classification.',
    supportsThinking: false,
    supportsTools: true,
    supportsJson: true,
    supportsMultimodal: false,
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Gemini 3.1 Flash Image',
    badge: 'Visual Synthesis',
    category: 'Image Generation',
    contextWindow: '32,768 tokens',
    maxOutputTokens: 4096,
    description: 'Specialized model for high-fidelity image generation, visual editing, and aspect ratio controls.',
    supportsThinking: false,
    supportsTools: false,
    supportsJson: false,
    supportsMultimodal: true,
  },
  {
    id: 'gemini-embedding-2-preview',
    name: 'Gemini Text Embedding 2',
    badge: 'Vector Embeddings',
    category: 'Embeddings & RAG',
    contextWindow: '8,192 tokens',
    maxOutputTokens: 768,
    description: 'Generates 768/1536-dimensional semantic vector embeddings for similarity search and RAG.',
    supportsThinking: false,
    supportsTools: false,
    supportsJson: false,
    supportsMultimodal: false,
  },
];

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Models Catalog API
app.get('/api/models', (req: Request, res: Response) => {
  res.json({
    models: MODEL_CATALOG,
    defaultModel: 'gemini-3.7-flash',
  });
});

// Generate Content Endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      prompt,
      model = 'gemini-3.7-flash',
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      topK = 40,
      thinkingLevel,
      responseMimeType,
      responseSchema,
      tools,
      images = [],
    } = req.body;

    if (!prompt && images.length === 0) {
      return res.status(400).json({ error: 'Prompt or media is required' });
    }

    const ai = getGenAI();

    if (!ai) {
      // Simulate intelligent AI Studio response for sandbox preview
      const latencyMs = Math.floor(Math.random() * 300) + 200;
      let simulatedText = `[AI Studio Preview Response - Model: ${model}]\n\n` +
        `Here is the generated output for your prompt:\n\n` +
        `> **Prompt**: "${prompt}"\n\n` +
        `### Key Highlights & Solution\n` +
        `1. **Optimized Execution**: System instruction applied successfully.\n` +
        `2. **Context Evaluated**: Parameters processed with Temperature: ${temperature}, Top-P: ${topP}, Top-K: ${topK}.\n` +
        `3. **Agent Capability**: Ready for multi-turn workflows, tool executions, and API deployments.\n\n` +
        `\`\`\`json\n` +
        JSON.stringify({
          status: "success",
          model,
          promptTokens: Math.floor((prompt?.length || 20) / 4),
          responseTokens: 142,
          latencyMs,
          note: "Add your GEMINI_API_KEY in Settings > Secrets to make live cloud calls!"
        }, null, 2) +
        `\n\`\`\``;

      if (responseMimeType === 'application/json') {
        simulatedText = JSON.stringify({
          result: "Simulated structured response",
          query: prompt,
          model,
          timestamp: new Date().toISOString(),
          parameters: { temperature, topP, topK }
        }, null, 2);
      }

      return res.json({
        text: simulatedText,
        model,
        latencyMs,
        usage: {
          promptTokens: Math.floor((prompt?.length || 20) / 4),
          candidatesTokens: 160,
          totalTokens: Math.floor((prompt?.length || 20) / 4) + 160,
        },
        simulated: true,
      });
    }

    // Prepare contents payload
    const parts: any[] = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.data && img.mimeType) {
          parts.push({
            inlineData: {
              data: img.data.replace(/^data:[^;]+;base64,/, ''),
              mimeType: img.mimeType,
            },
          });
        }
      }
    }

    if (prompt) {
      parts.push({ text: prompt });
    }

    const config: any = {
      temperature: Number(temperature),
      topP: Number(topP),
      topK: Number(topK),
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (responseMimeType) {
      config.responseMimeType = responseMimeType;
    }

    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    if (tools && tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.7-flash',
      contents: parts.length === 1 && parts[0].text ? parts[0].text : { parts },
      config,
    });

    const latencyMs = Date.now() - startTime;
    const text = response.text || '';
    const functionCalls = response.functionCalls || [];

    res.json({
      text,
      functionCalls,
      model,
      latencyMs,
      usage: response.usageMetadata || {
        promptTokens: Math.floor((prompt?.length || 20) / 4),
        candidatesTokens: Math.floor(text.length / 4),
        totalTokens: Math.floor((prompt?.length || 20) / 4) + Math.floor(text.length / 4),
      },
      simulated: false,
    });
  } catch (error: any) {
    console.error('Gemini Generate API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response',
      details: error.toString(),
    });
  }
});

// Multi-turn Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      messages = [],
      model = 'gemini-3.7-flash',
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      searchGrounding = false,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';
      const latencyMs = Math.floor(Math.random() * 250) + 150;
      return res.json({
        message: {
          role: 'model',
          content: `I received your message: "${lastUserMsg}". I am configured with model **${model}**.\n\nTo enable live responses, please connect your Gemini API key in the AI Studio Settings.`,
        },
        latencyMs,
        simulated: true,
      });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      temperature: Number(temperature),
      topP: Number(topP),
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const latencyMs = Date.now() - startTime;
    const text = response.text || '';

    res.json({
      message: {
        role: 'model',
        content: text,
      },
      latencyMs,
      usage: response.usageMetadata,
      simulated: false,
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to chat',
    });
  }
});

// Model Arena / Comparison Endpoint
app.post('/api/gemini/compare', async (req: Request, res: Response) => {
  try {
    const { prompt, modelA = 'gemini-3.7-flash', modelB = 'gemini-3.1-pro-preview', systemInstruction, temperature = 0.7 } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        modelA: {
          model: modelA,
          text: `[${modelA}] Focused, high-speed response for: "${prompt}". Highly optimized for latency and direct problem resolution.`,
          latencyMs: 310,
          tokens: 85,
        },
        modelB: {
          model: modelB,
          text: `[${modelB}] Deeply reasoned, comprehensive analysis for: "${prompt}". Includes step-by-step mathematical proof and algorithmic verification.`,
          latencyMs: 640,
          tokens: 180,
        },
        simulated: true,
      });
    }

    const runModel = async (modelId: string) => {
      const t0 = Date.now();
      try {
        const resp = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            temperature: Number(temperature),
            systemInstruction: systemInstruction || undefined,
          },
        });
        return {
          model: modelId,
          text: resp.text || '',
          latencyMs: Date.now() - t0,
          usage: resp.usageMetadata,
        };
      } catch (err: any) {
        return {
          model: modelId,
          error: err.message,
          latencyMs: Date.now() - t0,
        };
      }
    };

    const [resA, resB] = await Promise.all([runModel(modelA), runModel(modelB)]);

    res.json({
      modelA: resA,
      modelB: resB,
      simulated: false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Embeddings Endpoint
app.post('/api/gemini/embeddings', async (req: Request, res: Response) => {
  try {
    const { text, model = 'gemini-embedding-2-preview' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const ai = getGenAI();
    if (!ai) {
      const dummyVector = Array.from({ length: 64 }, () => Number((Math.random() * 2 - 1).toFixed(4)));
      return res.json({
        vector: dummyVector,
        dimensions: 768,
        preview: dummyVector.slice(0, 8),
        simulated: true,
      });
    }

    const response = await ai.models.embedContent({
      model,
      contents: text,
    });

    const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values || [];

    res.json({
      vector: values,
      dimensions: values.length || 768,
      simulated: false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware for Development or Static serving for Production
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
    console.log(`Google AI Studio Developer Platform server listening on port ${PORT}`);
  });
}

startServer();
