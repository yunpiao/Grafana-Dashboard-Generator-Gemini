import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StepInput } from './components/StepComponents';
import { PlanEditor } from './components/PlanEditor';
import { DashboardPreview } from './components/DashboardPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { generateDashboardPlan, generateFinalDashboard } from './services/geminiService';
import { DashboardPlan, AIResponse } from './types';
import { Activity } from 'lucide-react';
import { isSampleData, SAMPLE_DASHBOARD_PLAN, SAMPLE_DASHBOARD_RESULT } from './constants';

const App: React.FC = () => {
  // State - New 4-step flow: Input -> Plan Edit -> Generate -> Preview
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [rawMetrics, setRawMetrics] = useState<string>('');
  const [dashboardPlan, setDashboardPlan] = useState<DashboardPlan | null>(null);
  const [finalDashboard, setFinalDashboard] = useState<AIResponse | null>(null);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Helper to append logs
  const addLog = (msg: string) => setLoadingLogs(prev => [...prev, msg]);

  // Step 1 -> Step 2: Generate Plan
  const handleGeneratePlan = async () => {
    if (!rawMetrics.trim()) return;
    
    setError(null);
    setIsGeneratingPlan(true);

    try {
      // Check if using sample data - skip AI call for quick validation
      const usingSample = isSampleData(rawMetrics);
      
      if (usingSample) {
        await new Promise(r => setTimeout(r, 500));
        setDashboardPlan(SAMPLE_DASHBOARD_PLAN);
        setCurrentStep(2); // Go to Plan Edit
        setIsGeneratingPlan(false);
        return;
      }

      // Real AI Call to generate plan
      const plan: DashboardPlan = await generateDashboardPlan(rawMetrics);
      setDashboardPlan(plan);
      setCurrentStep(2); // Go to Plan Edit
      
    } catch (e: any) {
      setError(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Step 2 -> Step 3 -> Step 4: Confirm Plan and Generate Final Dashboard
  const handleConfirmPlan = async () => {
    if (!dashboardPlan) return;
    
    setError(null);
    setCurrentStep(3); // Go to Loading
    setLoadingLogs(['Generating PromQL queries...', 'Building panel configurations...']);

    try {
      const usingSample = isSampleData(rawMetrics);
      
      if (usingSample) {
        addLog('[DEMO MODE] Using cached result...');
        await new Promise(r => setTimeout(r, 600));
        addLog('Done! Rendering dashboard...');
        await new Promise(r => setTimeout(r, 400));
        
        setFinalDashboard(SAMPLE_DASHBOARD_RESULT);
        setCurrentStep(4); // Go to Preview
        return;
      }

      addLog('Analyzing metrics structure...');
      await new Promise(r => setTimeout(r, 500));
      
      addLog(`Processing ${dashboardPlan.categories.reduce((acc, c) => acc + c.panels.length, 0)} panels...`);
      
      const result = await generateFinalDashboard(rawMetrics, dashboardPlan);
      
      addLog('Finalizing Grafana JSON...');
      addLog('Done!');
      
      await new Promise(r => setTimeout(r, 300));
      
      setFinalDashboard(result);
      setCurrentStep(4); // Go to Preview

    } catch (e: any) {
      setError(e.message || "Generation failed. Please try again.");
      setCurrentStep(2); // Go back to Plan Edit
      setLoadingLogs([]);
    }
  };

  const handleBackToPlan = () => {
    setCurrentStep(2);
    setLoadingLogs([]);
  };

  const handleBackToInput = () => {
    setCurrentStep(1);
    setDashboardPlan(null);
  };

  const handleStartOver = () => {
    setRawMetrics('');
    setDashboardPlan(null);
    setFinalDashboard(null);
    setLoadingLogs([]);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 p-2 rounded-lg">
              <Activity className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Metrics to Grafana
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {currentStep > 1 && (
                <button onClick={handleStartOver} className="text-sm text-slate-500 hover:text-primary-600 font-medium px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                    Start Over
                </button>
             )}
             <div className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full hidden sm:block">
                Gemini 3.0 Pro
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="max-w-7xl mx-auto px-6 w-full shrink-0">
             <StepIndicator currentStep={currentStep} totalSteps={4} />
        </div>
        
        {error && (
          <div className="max-w-7xl mx-auto px-6 w-full mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-pulse">
                <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 pb-6 flex flex-col">
            {/* Step 1: Input Metrics */}
            {currentStep === 1 && (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StepInput 
                        value={rawMetrics} 
                        onValueChange={setRawMetrics}
                        onGenerate={handleGeneratePlan} 
                    />
                    {isGeneratingPlan && (
                      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-4">
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-slate-700 font-medium">Generating plan...</span>
                        </div>
                      </div>
                    )}
                </div>
            )}

            {/* Step 2: Edit Plan */}
            {currentStep === 2 && dashboardPlan && (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PlanEditor 
                        plan={dashboardPlan}
                        onPlanChange={setDashboardPlan}
                        onConfirm={handleConfirmPlan}
                        onBack={handleBackToInput}
                    />
                </div>
            )}

            {/* Step 3: Generating */}
            {currentStep === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                    <LoadingScreen logs={loadingLogs} />
                </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && finalDashboard && (
                <div className="flex-1 min-h-0 border border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <DashboardPreview data={finalDashboard} />
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;