import React, { useState, useEffect } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StepInput, StepPreview, StepSelect } from './components/StepComponents';
import { DashboardPreview } from './components/DashboardPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { parseMetricsLocal } from './utils/metricParser';
import { generateDashboardPlan, generateFinalDashboard } from './services/geminiService';
import { ParsedMetric, DashboardPlan, AIResponse, CategoryPlan } from './types';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [rawMetrics, setRawMetrics] = useState<string>('');
  const [parsedMetrics, setParsedMetrics] = useState<ParsedMetric[]>([]);
  const [dashboardPlan, setDashboardPlan] = useState<DashboardPlan | null>(null);
  const [selectedPanelIds, setSelectedPanelIds] = useState<Set<string>>(new Set());
  const [finalDashboard, setFinalDashboard] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const goToStep = (step: number) => {
      setError(null);
      setCurrentStep(step);
  };

  // Step 1 -> 2
  const handleInputNext = () => {
    try {
      const parsed = parseMetricsLocal(rawMetrics);
      if (parsed.length === 0) throw new Error("No metrics found. Please check your input.");
      setParsedMetrics(parsed);
      goToStep(2);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Step 2 -> 3 (Analysis)
  const handleAnalyze = async () => {
    goToStep(3);
    try {
      const plan = await generateDashboardPlan(rawMetrics);
      setDashboardPlan(plan);
      
      // Auto-select all panels initially
      const allIds = new Set<string>();
      plan.categories.forEach(c => c.panels.forEach(p => allIds.add(p.id)));
      setSelectedPanelIds(allIds);
      
      goToStep(4);
    } catch (e: any) {
      setError(e.message || "AI Analysis failed.");
      goToStep(2); // Go back to preview on fail
    }
  };

  // Step 4 Selection Logic
  const togglePanel = (id: string) => {
    const next = new Set(selectedPanelIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPanelIds(next);
  };

  const toggleRow = (ids: string[], selected: boolean) => {
    const next = new Set(selectedPanelIds);
    ids.forEach(id => {
        if (selected) next.add(id);
        else next.delete(id);
    });
    setSelectedPanelIds(next);
  };

  // Step 4 -> 5 (Generate)
  const handleGenerateFinal = async () => {
    if (!dashboardPlan) return;
    goToStep(5);
    
    try {
      // Filter the plan based on selection
      const filteredPlan: DashboardPlan = {
        ...dashboardPlan,
        categories: dashboardPlan.categories.map(cat => ({
            ...cat,
            panels: cat.panels.filter(p => selectedPanelIds.has(p.id))
        })).filter(cat => cat.panels.length > 0)
      };

      const result = await generateFinalDashboard(rawMetrics, filteredPlan);
      setFinalDashboard(result);
      goToStep(6);
    } catch (e: any) {
      setError(e.message || "Generation failed.");
      goToStep(4);
    }
  };

  const handleStartOver = () => {
    setRawMetrics('');
    setParsedMetrics([]);
    setDashboardPlan(null);
    setFinalDashboard(null);
    goToStep(1);
  };

  // Render Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepInput value={rawMetrics} onChange={setRawMetrics} onNext={handleInputNext} />;
      case 2:
        return <StepPreview metrics={parsedMetrics} onBack={() => goToStep(1)} onNext={handleAnalyze} />;
      case 3:
        return <LoadingScreen stepName="AI Analysis" message="Identifying metrics, groupings, and visualization types..." />;
      case 4:
        return dashboardPlan && (
           <StepSelect 
             plan={dashboardPlan} 
             selectedIds={selectedPanelIds} 
             onToggle={togglePanel} 
             onToggleAllRow={toggleRow}
             onBack={() => goToStep(2)}
             onGenerate={handleGenerateFinal}
           />
        );
      case 5:
        return <LoadingScreen stepName="Generating Dashboard" message="Writing PromQL queries and configuring panels..." />;
      case 6:
        return (
            <div className="h-full flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                    <button onClick={handleStartOver} className="text-sm text-slate-500 hover:text-primary-600 font-medium">
                        ← Start Over
                    </button>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        Success! Dashboard generated.
                    </span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <DashboardPreview data={finalDashboard} />
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-50 p-2 rounded-lg">
              <Activity className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Metrics to Grafana
              </h1>
            </div>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            Powered by Gemini 3.0 Pro
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <StepIndicator currentStep={currentStep} />
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="flex-1 min-h-0">
            {renderStepContent()}
        </div>
      </main>
    </div>
  );
};

export default App;