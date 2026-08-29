import React, { useState } from 'react';
import { FileJson, Plus, Trash2, Play, Copy, Check, Sparkles, Layers, ArrowRight, Code2 } from 'lucide-react';
import { SchemaProperty } from '../types';

interface SchemaBuilderViewProps {
  model: string;
}

const PRESET_SCHEMAS: { name: string; description: string; samplePrompt: string; properties: SchemaProperty[] }[] = [
  {
    name: 'Customer Lead Extractor',
    description: 'Extracts buyer contact, company profile, target budget, and estimated timeline.',
    samplePrompt: 'Received email from Dr. Marcus Vance, VP of Engineering at Quantix Bio. They want to integrate Gemini 3.7 into their molecular simulation pipeline with a $150,000 budget, kicking off in November 2025.',
    properties: [
      { id: '1', name: 'contactName', type: 'STRING', description: 'Full name of the primary lead contact', required: true },
      { id: '2', name: 'company', type: 'STRING', description: 'Organization or company name', required: true },
      { id: '3', name: 'estimatedBudget', type: 'NUMBER', description: 'Target budget in USD', required: true },
      { id: '4', name: 'urgencyTier', type: 'STRING', description: 'High, Medium, or Low urgency', required: true },
      { id: '5', name: 'keyRequirements', type: 'ARRAY', description: 'List of specific functional capabilities required', required: false, itemType: 'STRING' },
    ],
  },
  {
    name: 'Clinical Health Diagnostic',
    description: 'Parses medical consultations into symptoms, diagnoses, medications, and next steps.',
    samplePrompt: 'Patient complaints: persistent dry cough for 3 weeks, mild wheezing upon exertion, and chest tightness. History of seasonal allergies. Diagnosed with mild reactive airway disease. Prescribed Albuterol inhaler 2 puffs every 4-6 hours PRN and Fluticasone nasal spray 50mcg daily.',
    properties: [
      { id: '1', name: 'symptoms', type: 'ARRAY', description: 'List of reported patient symptoms', required: true, itemType: 'STRING' },
      { id: '2', name: 'primaryDiagnosis', type: 'STRING', description: 'Formal clinical diagnosis', required: true },
      { id: '3', name: 'medications', type: 'ARRAY', description: 'Prescribed drugs and dosage instructions', required: true, itemType: 'STRING' },
      { id: '4', name: 'followUpDays', type: 'INTEGER', description: 'Recommended follow-up in days', required: false },
    ],
  },
  {
    name: 'E-commerce Product Cataloger',
    description: 'Structures product listings with category, specifications, pricing, and tag arrays.',
    samplePrompt: 'HyperSonic Pro 900 Noise-Cancelling Wireless Headphones with 40-hour battery life, active spatial audio, USB-C fast charging, Bluetooth 5.4, and premium memory foam ear cushions. Retails at $299.99 with 2-year manufacturer warranty.',
    properties: [
      { id: '1', name: 'productTitle', type: 'STRING', description: 'Official clean product name', required: true },
      { id: '2', name: 'category', type: 'STRING', description: 'Primary retail category', required: true },
      { id: '3', name: 'priceUSD', type: 'NUMBER', description: 'MSRP price in USD', required: true },
      { id: '4', name: 'batteryLifeHours', type: 'INTEGER', description: 'Rated battery life in hours', required: false },
      { id: '5', name: 'features', type: 'ARRAY', description: 'Top product specifications', required: true, itemType: 'STRING' },
    ],
  },
];

export const SchemaBuilderView: React.FC<SchemaBuilderViewProps> = ({ model }) => {
  const [properties, setProperties] = useState<SchemaProperty[]>(PRESET_SCHEMAS[0].properties);
  const [testPrompt, setTestPrompt] = useState<string>(PRESET_SCHEMAS[0].samplePrompt);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const addProperty = () => {
    const newProp: SchemaProperty = {
      id: Math.random().toString(36).substring(2, 9),
      name: `field_${properties.length + 1}`,
      type: 'STRING',
      description: '',
      required: true,
    };
    setProperties([...properties, newProp]);
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const updateProperty = (id: string, updates: Partial<SchemaProperty>) => {
    setProperties(properties.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const loadPreset = (preset: typeof PRESET_SCHEMAS[0]) => {
    setProperties(preset.properties);
    setTestPrompt(preset.samplePrompt);
    setJsonOutput('');
  };

  // Convert schema properties to Type.* object schema format
  const getCompiledSchema = () => {
    const propsMap: Record<string, any> = {};
    const requiredFields: string[] = [];

    properties.forEach((p) => {
      if (p.name.trim()) {
        if (p.type === 'ARRAY') {
          propsMap[p.name] = {
            type: 'ARRAY',
            items: { type: p.itemType || 'STRING' },
            description: p.description,
          };
        } else {
          propsMap[p.name] = {
            type: p.type,
            description: p.description,
          };
        }
        if (p.required) requiredFields.push(p.name);
      }
    });

    return {
      type: 'OBJECT',
      properties: propsMap,
      required: requiredFields,
    };
  };

  const handleRunExtraction = async () => {
    if (!testPrompt.trim() || isRunning) return;
    setIsRunning(true);
    setJsonOutput('');

    try {
      const compiledSchema = getCompiledSchema();
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          model,
          responseMimeType: 'application/json',
          responseSchema: compiledSchema,
          temperature: 0.1,
        }),
      });

      const data = await res.json();
      setJsonOutput(data.text || JSON.stringify(data, null, 2));
    } catch (err: any) {
      setJsonOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput || JSON.stringify(getCompiledSchema(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-[#0A0A0A]">
      {/* Schema Editor (Left Split) */}
      <div className="flex-1 flex flex-col border-r border-[#222222] overflow-y-auto p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F0F0F] p-4 rounded-2xl border border-[#222222]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Structured JSON Schema Studio</h2>
            </div>
            <p className="text-xs text-[#888888]">
              Enforce deterministic, type-safe JSON schema output compliant with Gemini responseSchema.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#666666] mr-1">Presets:</span>
            {PRESET_SCHEMAS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(preset)}
                className="text-xs bg-[#1A1A1A] hover:bg-[#222222] text-[#AAAAAA] hover:text-white px-2.5 py-1 rounded-lg border border-[#333333] transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">
              Output Schema Properties ({properties.length})
            </span>
            <button
              onClick={addProperty}
              className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-2">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#0F0F0F] border border-[#222222] p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
              >
                {/* Field Name */}
                <div className="w-full sm:w-44">
                  <label className="text-[10px] text-[#666666] block mb-0.5 font-medium">Field Name</label>
                  <input
                    type="text"
                    value={prop.name}
                    onChange={(e) => updateProperty(prop.id, { name: e.target.value })}
                    className="w-full bg-[#050505] border border-[#222222] rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="propertyName"
                  />
                </div>

                {/* Type */}
                <div className="w-full sm:w-32">
                  <label className="text-[10px] text-[#666666] block mb-0.5 font-medium">Type</label>
                  <select
                    value={prop.type}
                    onChange={(e) => updateProperty(prop.id, { type: e.target.value as any })}
                    className="w-full bg-[#050505] border border-[#222222] rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STRING">STRING</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="INTEGER">INTEGER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="ARRAY">ARRAY</option>
                    <option value="OBJECT">OBJECT</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-[#666666] block mb-0.5 font-medium">Description for Gemini</label>
                  <input
                    type="text"
                    value={prop.description}
                    onChange={(e) => updateProperty(prop.id, { description: e.target.value })}
                    className="w-full bg-[#050505] border border-[#222222] rounded-md px-2.5 py-1.5 text-[#E0E0E0] focus:outline-none focus:border-indigo-500"
                    placeholder="Instructions for field extraction..."
                  />
                </div>

                {/* Required Toggle & Delete */}
                <div className="flex items-center gap-3 pt-4 sm:pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#888888]">
                    <input
                      type="checkbox"
                      checked={prop.required}
                      onChange={(e) => updateProperty(prop.id, { required: e.target.checked })}
                      className="accent-indigo-500 rounded"
                    />
                    <span className="text-[11px]">Required</span>
                  </label>

                  <button
                    onClick={() => removeProperty(prop.id)}
                    className="text-[#666666] hover:text-red-400 p-1 transition-colors cursor-pointer"
                    title="Delete field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test Input */}
        <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#777777] block">
            Test Input Text
          </span>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            rows={3}
            className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500 leading-relaxed"
            placeholder="Paste raw unstructured text to test schema extraction..."
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunExtraction}
              disabled={isRunning || !testPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting JSON...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Extract Structured Output</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* JSON Schema & Response Output (Right Split) */}
      <div className="w-full lg:w-[480px] flex flex-col bg-[#0A0A0A] p-4 sm:p-6 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#222222]">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-[#E0E0E0] uppercase tracking-wider">
              {jsonOutput ? 'Extracted JSON Result' : 'Compiled Schema Definition'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#151515] hover:bg-[#222222] text-[#AAAAAA] hover:text-white text-xs rounded-lg border border-[#333333] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="flex-1 bg-[#050505] border border-[#222222] rounded-xl p-4 overflow-y-auto font-mono text-xs text-indigo-300 mt-4 leading-relaxed">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-[#777777] gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs">Extracting validated JSON...</span>
            </div>
          ) : jsonOutput ? (
            <pre className="whitespace-pre-wrap">
              <code>{jsonOutput}</code>
            </pre>
          ) : (
            <pre className="text-[#888888] whitespace-pre-wrap">
              <code>{JSON.stringify(getCompiledSchema(), null, 2)}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
