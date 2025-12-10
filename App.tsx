import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StepInput } from './components/StepComponents';
import { DashboardPreview } from './components/DashboardPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { generateDashboardPlan, generateFinalDashboard } from './services/geminiService';
import { DashboardPlan, AIResponse } from './types';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [rawMetrics, setRawMetrics] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  
  const [finalDashboard, setFinalDashboard] = useState<AIResponse | null>(null);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to append logs
  const addLog = (msg: string) => setLoadingLogs(prev => [...prev, msg]);

  // Main Generator Logic (One-Click Flow)
  const handleGenerateFullFlow = async () => {
    if (!rawMetrics.trim()) return;
    
    setError(null);
    setCurrentStep(2); // Go to Processing
    setLoadingLogs(['Initializing AI session...', 'Analyzing raw metrics structure...']);

    try {
      // 1. Generate Plan
      addLog('Identifying metric types and labels...');
      await new Promise(r => setTimeout(r, 800)); // UX delay for readability
      
      addLog('Designing dashboard layout (Rows & Categories)...');
      if (userContext) addLog(`Applying user context: "${userContext}"...`);

      const plan: DashboardPlan = await generateDashboardPlan(rawMetrics, userContext);
      
      addLog(`Plan created: ${plan.categories.length} categories, ${plan.categories.reduce((acc, c) => acc + c.panels.length, 0)} panels found.`);
      addLog('Generating PromQL queries for all panels...');

      // 2. Generate Final JSON (Auto-select all)
      const result = await generateFinalDashboard(rawMetrics, plan);
      
      addLog('Finalizing Grafana JSON structure...');
      addLog('Done! Rendering dashboard...');
      
      await new Promise(r => setTimeout(r, 500)); // Brief pause at 100%
      
      setFinalDashboard(result);
      setCurrentStep(3); // Go to Result

    } catch (e: any) {
      setError(e.message || "Generation failed. Please try again.");
      setCurrentStep(1); // Go back to input
      setLoadingLogs([]);
    }
  };

  const handleStartOver = () => {
    setRawMetrics('');
    setUserContext('');
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
             {currentStep === 3 && (
                <button onClick={handleStartOver} className="text-sm text-slate-500 hover:text-primary-600 font-medium px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                    Start New Dashboard
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
             <StepIndicator currentStep={currentStep} />
        </div>
        
        {error && (
          <div className="max-w-7xl mx-auto px-6 w-full mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-pulse">
                <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 pb-6 flex flex-col">
            {currentStep === 1 && (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StepInput 
                        value={rawMetrics} 
                        context={userContext}
                        onValueChange={setRawMetrics}
                        onContextChange={setUserContext}
                        onGenerate={handleGenerateFullFlow} 
                    />
                </div>
            )}

            {currentStep === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                    <LoadingScreen logs={loadingLogs} />
                </div>
            )}

            {currentStep === 3 && finalDashboard && (
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