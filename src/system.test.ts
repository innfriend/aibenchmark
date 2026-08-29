import { describe, it, expect } from 'vitest';
import { HARDWARE_CATALOG, MODEL_CATALOG, SAMPLE_OPTIMIZATION_JOBS } from './data/mockData';
import { KNOWLEDGE_BASE_ARTICLES } from './data/knowledgeBaseData';

describe('CorePick System & Data Integrity Test Suite', () => {
  describe('Hardware Catalog System Tests', () => {
    it('should have a rich fleet of hardware devices', () => {
      expect(HARDWARE_CATALOG.length).toBeGreaterThanOrEqual(10);
    });

    it('should contain all required architectural properties for every hardware target', () => {
      HARDWARE_CATALOG.forEach(hw => {
        expect(hw.id).toBeDefined();
        expect(hw.name).toBeDefined();
        expect(hw.vendor).toBeDefined();
        expect(hw.architecture).toBeDefined();
        expect(hw.fp16Tflops).toBeGreaterThan(0);
        expect(hw.memoryBandwidthGBs).toBeGreaterThan(0);
        expect(hw.memoryGb).toBeGreaterThan(0);
        expect(hw.tdpWatts).toBeGreaterThan(0);
        expect(hw.supportedRuntimes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Model Catalog System Tests', () => {
    it('should contain foundational vision, LLM, and audio models', () => {
      expect(MODEL_CATALOG.length).toBeGreaterThanOrEqual(5);
    });

    it('should have valid parameter counts, layers, and operational intensity bounds', () => {
      MODEL_CATALOG.forEach(model => {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.category).toBeDefined();
        expect(model.parameterCountM).toBeGreaterThan(0);
        expect(model.totalFlopsGflops).toBeGreaterThan(0);
        expect(model.layersCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Knowledge Base & SEO Article System Tests', () => {
    it('should contain comprehensive technical articles', () => {
      expect(KNOWLEDGE_BASE_ARTICLES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have structured metadata for SEO microdata generation', () => {
      KNOWLEDGE_BASE_ARTICLES.forEach(article => {
        expect(article.id).toBeDefined();
        expect(article.title).toBeTruthy();
        expect(article.summary).toBeTruthy();
        expect(article.category).toBeTruthy();
        expect(article.author.name).toBeTruthy();
        expect(article.readingTimeMin).toBeGreaterThan(0);
        expect(article.contentMarkdown.length).toBeGreaterThan(50);
        expect(article.keyTakeaways.length).toBeGreaterThan(0);
        expect(article.faq.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Profiling Job Engine Tests', () => {
    it('should have valid historical profiling jobs with speedups', () => {
      expect(SAMPLE_OPTIMIZATION_JOBS.length).toBeGreaterThan(0);
      SAMPLE_OPTIMIZATION_JOBS.forEach(job => {
        expect(job.id).toBeDefined();
        expect(job.modelName).toBeDefined();
        expect(job.results.length).toBeGreaterThan(0);
        expect(job.flamegraph.length).toBeGreaterThan(0);
      });
    });
  });
});
