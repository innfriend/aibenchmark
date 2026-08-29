import React, { useState } from 'react';
import { Compass, Search, Tag, ArrowUpRight, Sparkles, Filter, Code2, Brain, Eye, FileJson, PenTool, Bot } from 'lucide-react';
import { PromptTemplate } from '../types';
import { PROMPT_TEMPLATES } from '../data/templates';

interface PromptGalleryViewProps {
  onLoadTemplate: (template: PromptTemplate) => void;
}

export const PromptGalleryView: React.FC<PromptGalleryViewProps> = ({ onLoadTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Coding', 'Reasoning', 'Structured Data', 'Agent Tools', 'Multimodal', 'Writing'];

  const filteredTemplates = PROMPT_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coding':
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Reasoning':
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      case 'Multimodal':
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Structured Data':
        return <FileJson className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Agent Tools':
        return <Bot className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <PenTool className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="bg-[#0F0F0F] border border-[#222222] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Prompt Template Library & Recipes</h2>
            </div>
            <p className="text-xs text-[#888888]">
              Curated production-ready system instructions, few-shot examples, and model configurations for Google AI Studio.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by tag, task..."
              className="w-full bg-[#050505] border border-[#222222] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[#151515] hover:bg-[#222222] text-[#888888] hover:text-white border border-[#222222]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-[#0F0F0F] hover:bg-[#151515] border border-[#222222] hover:border-[#333333] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#CCCCCC] bg-[#1A1A1A] px-2.5 py-1 rounded-lg border border-[#333333]">
                    {getCategoryIcon(template.category)}
                    <span>{template.category}</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {template.model}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-[#888888] mt-1.5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Prompt Preview Snippet */}
                <div className="bg-[#050505] border border-[#222222] rounded-xl p-3 text-[11px] font-mono text-[#777777] line-clamp-3 leading-relaxed">
                  {template.prompt}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] bg-[#1A1A1A] text-[#888888] px-2 py-0.5 rounded-md border border-[#2B2B2B]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-[#222222] flex items-center justify-between">
                <span className="text-[10px] text-[#666666] font-mono">
                  Temp: {template.temperature}
                </span>
                <button
                  onClick={() => onLoadTemplate(template)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all cursor-pointer"
                >
                  <span>Open in Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
