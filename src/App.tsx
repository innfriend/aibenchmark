import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPageView } from './components/LandingPageView';
import { PlatformView } from './components/PlatformView';
import { HowItWorksView } from './components/HowItWorksView';
import { DocsView } from './components/DocsView';
import { AboutContactView } from './components/AboutContactView';
import { DashboardView } from './components/DashboardView';
import { ModelCatalogView } from './components/ModelCatalogView';
import { ProfilerWizardView } from './components/ProfilerWizardView';
import { OptimizationResultsView } from './components/OptimizationResultsView';
import { HardwareFleetView } from './components/HardwareFleetView';
import { BenchmarksView } from './components/BenchmarksView';
import { CliHubView } from './components/CliHubView';
import { ReportsCenterView } from './components/ReportsCenterView';
import { AdminFleetView } from './components/AdminFleetView';
import { GraphInspectorView } from './components/GraphInspectorView';
import { HardwareSandboxView } from './components/HardwareSandboxView';
import { DeploymentExporterView } from './components/DeploymentExporterView';
import { CustomModelProfiler } from './components/CustomModelProfiler';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { OptimizationJob, ModelArchitecture } from './types';
import { SAMPLE_OPTIMIZATION_JOBS, MODEL_CATALOG } from './data/mockData';

export default function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeJob, setActiveJob] = useState<OptimizationJob>(SAMPLE_OPTIMIZATION_JOBS[0]);
  const [wizardInitialModelId, setWizardInitialModelId] = useState<string>(MODEL_CATALOG[0].id);

  // Helper to determine if we are in the workspace application mode
  const isAppMode = currentView.startsWith('app-');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectJob = (job: OptimizationJob) => {
    setActiveJob(job);
    setCurrentView('app-results');
  };

  const handleOpenWizardWithModel = (modelId: string) => {
    setWizardInitialModelId(modelId);
    setCurrentView('app-analyze');
  };

  const handleJobCompleted = (job: OptimizationJob) => {
    setActiveJob(job);
    setCurrentView('app-results');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Workspace Sidebar (visible in App Views) */}
        {isAppMode && (
          <Sidebar currentView={currentView} onNavigate={handleNavigate} />
        )}

        {/* Dynamic Route View Mount */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {(currentView === 'home' || currentView === 'landing') && <LandingPageView onNavigate={handleNavigate} />}
          {currentView === 'platform' && <PlatformView onNavigate={handleNavigate} />}
          {currentView === 'how-it-works' && <HowItWorksView onNavigate={handleNavigate} />}
          {currentView === 'docs' && <DocsView onNavigate={handleNavigate} />}
          {currentView === 'about' && <AboutContactView onNavigate={handleNavigate} />}
          {currentView === 'benchmarks' && <BenchmarksView onNavigate={handleNavigate} />}
          {currentView === 'knowledge-base' && <KnowledgeBaseView onNavigate={handleNavigate} onOpenWizardWithModel={handleOpenWizardWithModel} />}

          {/* App / Workspace Views */}
          {currentView === 'app-dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onSelectJob={handleSelectJob}
              onOpenWizardWithModel={handleOpenWizardWithModel}
            />
          )}

          {currentView === 'app-models' && (
            <ModelCatalogView
              onOpenWizardWithModel={handleOpenWizardWithModel}
            />
          )}

          {currentView === 'app-analyze' && (
            <ProfilerWizardView
              initialModelId={wizardInitialModelId}
              onJobCompleted={handleJobCompleted}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'app-results' && (
            <OptimizationResultsView
              job={activeJob}
            />
          )}

          {currentView === 'app-inspector' && (
            <GraphInspectorView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-sandbox' && (
            <HardwareSandboxView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-deploy' && (
            <DeploymentExporterView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-compiler' && (
            <CustomModelProfiler onNavigate={handleNavigate} onOpenWizardWithModel={handleOpenWizardWithModel} />
          )}

          {currentView === 'app-knowledge' && (
            <KnowledgeBaseView onNavigate={handleNavigate} onOpenWizardWithModel={handleOpenWizardWithModel} />
          )}

          {currentView === 'app-fleet' && (
            <HardwareFleetView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-benchmarks' && (
            <BenchmarksView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-cli' && (
            <CliHubView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-reports' && (
            <ReportsCenterView onNavigate={handleNavigate} />
          )}

          {currentView === 'app-admin' && (
            <AdminFleetView onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </div>
  );
}
