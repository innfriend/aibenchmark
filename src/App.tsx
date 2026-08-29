/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlaygroundView } from './components/PlaygroundView';
import { ModelArenaView } from './components/ModelArenaView';
import { SchemaBuilderView } from './components/SchemaBuilderView';
import { ToolBuilderView } from './components/ToolBuilderView';
import { PromptGalleryView } from './components/PromptGalleryView';
import { EmbeddingsView } from './components/EmbeddingsView';
import { ApiReferenceView } from './components/ApiReferenceView';
import { GetCodeModal } from './components/GetCodeModal';
import { SettingsModal } from './components/SettingsModal';
import { ModelInfo, ModelParameters, PromptTemplate } from './types';
import { INITIAL_MODELS } from './data/templates';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
  const [models, setModels] = useState<ModelInfo[]>(INITIAL_MODELS);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isGetCodeOpen, setIsGetCodeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [parameters, setParameters] = useState<ModelParameters>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    systemInstruction: '',
    responseMimeType: 'text/plain',
  });

  const [activePrompt, setActivePrompt] = useState<string>('');

  // Check health and available models on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch(() => {});

    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          setModels(data.models);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateParameters = (updates: Partial<ModelParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  };

  const handleLoadTemplate = (template: PromptTemplate) => {
    setSelectedModel(template.model);
    setParameters((prev) => ({
      ...prev,
      systemInstruction: template.systemInstruction,
      temperature: template.temperature,
      topP: template.topP,
      responseMimeType: template.responseMimeType || 'text/plain',
    }));
    setActivePrompt(template.prompt);
    setActiveTab('playground');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Platform Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
        hasApiKey={hasApiKey}
        onOpenGetCode={() => setIsGetCodeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Active Workspace View */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeTab === 'playground' && (
          <PlaygroundView
            model={selectedModel}
            models={models}
            parameters={parameters}
            onUpdateParameters={handleUpdateParameters}
            onOpenGetCode={() => setIsGetCodeOpen(true)}
          />
        )}

        {activeTab === 'arena' && (
          <ModelArenaView models={models} parameters={parameters} />
        )}

        {activeTab === 'schema' && (
          <SchemaBuilderView model={selectedModel} />
        )}

        {activeTab === 'tools' && (
          <ToolBuilderView model={selectedModel} />
        )}

        {activeTab === 'templates' && (
          <PromptGalleryView onLoadTemplate={handleLoadTemplate} />
        )}

        {activeTab === 'embeddings' && (
          <EmbeddingsView />
        )}

        {activeTab === 'api-docs' && (
          <ApiReferenceView model={selectedModel} />
        )}
      </main>

      {/* Modals */}
      <GetCodeModal
        isOpen={isGetCodeOpen}
        onClose={() => setIsGetCodeOpen(false)}
        model={selectedModel}
        parameters={parameters}
        prompt={activePrompt}
        systemInstruction={parameters.systemInstruction}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hasApiKey={hasApiKey}
        parameters={parameters}
        onUpdateParameters={handleUpdateParameters}
      />
    </div>
  );
}
