import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { ModelParameters } from '../types';

interface GetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  parameters: ModelParameters;
  prompt: string;
  systemInstruction?: string;
  tools?: any[];
  responseSchema?: any;
}

export const GetCodeModal: React.FC<GetCodeModalProps> = ({
  isOpen,
  onClose,
  model,
  parameters,
  prompt,
  systemInstruction,
  tools,
  responseSchema,
}) => {
  const [selectedLang, setSelectedLang] = useState<'typescript' | 'python' | 'curl' | 'go'>('typescript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCodeSnippet = () => {
    const cleanPrompt = prompt || 'Explain how neural networks learn in simple terms.';
    const sysInst = systemInstruction || parameters.systemInstruction || '';

    switch (selectedLang) {
      case 'typescript':
        return `import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function main() {
  const response = await ai.models.generateContent({
    model: "${model}",
    contents: ${JSON.stringify(cleanPrompt)},
    config: {
      temperature: ${parameters.temperature},
      topP: ${parameters.topP},
      topK: ${parameters.topK},${sysInst ? `\n      systemInstruction: ${JSON.stringify(sysInst)},` : ''}${parameters.responseMimeType === 'application/json' ? `\n      responseMimeType: "application/json",` : ''}${responseSchema ? `\n      responseSchema: ${JSON.stringify(responseSchema, null, 6)},` : ''}${tools && tools.length ? `\n      tools: ${JSON.stringify(tools, null, 6)},` : ''}
    },
  });

  console.log("Model Output:", response.text);
}

main().catch(console.error);`;

      case 'python':
        return `import os
from google import genai
from google.genai import types

# Initialize client with GEMINI_API_KEY environment variable
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="${model}",
    contents=${JSON.stringify(cleanPrompt)},
    config=types.GenerateContentConfig(
        temperature=${parameters.temperature},
        top_p=${parameters.topP},
        top_k=${parameters.topK},${sysInst ? `\n        system_instruction=${JSON.stringify(sysInst)},` : ''}${parameters.responseMimeType === 'application/json' ? `\n        response_mime_type="application/json",` : ''}
    ),
)

print("Response:", response.text)`;

      case 'curl':
        return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=\${GEMINI_API_KEY}" \\
  -H 'Content-Type: application/json' \\
  -X POST \\
  -d '{
    "contents": [{
      "parts": [{ "text": ${JSON.stringify(cleanPrompt)} }]
    }],
    "generationConfig": {
      "temperature": ${parameters.temperature},
      "topP": ${parameters.topP},
      "topK": ${parameters.topK}${parameters.responseMimeType === 'application/json' ? `,\n      "responseMimeType": "application/json"` : ''}
    }${sysInst ? `,\n    "systemInstruction": { "parts": [{ "text": ${JSON.stringify(sysInst)} }] }` : ''}
  }'`;

      case 'go':
        return `package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		log.Fatalf("Error creating client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("${model}")
	model.SetTemperature(${parameters.temperature})
	model.SetTopP(${parameters.topP})
	model.SetTopK(${parameters.topK})

	resp, err := model.GenerateContent(ctx, genai.Text(${JSON.stringify(cleanPrompt)}))
	if err != nil {
		log.Fatalf("Generate error: %v", err)
	}

	for _, cand := range resp.Candidates {
		for _, part := range cand.Content.Parts {
			fmt.Println(part)
		}
	}
}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222] bg-[#151515]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Get Code & SDK Integration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Language Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex bg-[#151515] p-1 rounded-xl border border-[#222222]">
              {[
                { id: 'typescript', label: 'TypeScript (@google/genai)' },
                { id: 'python', label: 'Python (google-genai)' },
                { id: 'curl', label: 'cURL / REST' },
                { id: 'go', label: 'Go SDK' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedLang === lang.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#CCCCCC] text-xs font-semibold rounded-lg border border-[#333333] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#888888]" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code View Area */}
          <div className="relative rounded-xl bg-[#050505] border border-[#222222] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border-b border-[#222222] text-[11px] text-[#777777] font-mono">
              <span>{selectedLang === 'typescript' ? 'generate.ts' : selectedLang === 'python' ? 'main.py' : selectedLang === 'go' ? 'main.go' : 'request.sh'}</span>
              <span>Model: {model}</span>
            </div>
            <pre className="p-4 text-xs font-mono text-[#CCCCCC] overflow-x-auto max-h-96 leading-relaxed">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          <div className="flex items-center justify-between text-xs text-[#888888] bg-[#121212] p-3 rounded-xl border border-[#222222]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Full-stack ready with server-side SDK standards</span>
            </div>
            <span className="text-[11px] text-[#666666] font-mono">Google GenAI v2.4+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
