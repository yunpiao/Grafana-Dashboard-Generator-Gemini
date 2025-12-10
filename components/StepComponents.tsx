import React from 'react';
import { SAMPLE_METRICS } from '../constants';
import { ParsedMetric, DashboardPlan, PanelPlan } from '../types';
import { Play, ArrowLeft, CheckCircle, Circle, BarChart2, Activity, Hash, Tag, Brain } from 'lucide-react';

// --- Step 1: Input ---
interface StepInputProps {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}
export const StepInput: React.FC<StepInputProps> = ({ value, onChange, onNext }) => {
  const lineCount = value.split('\n').filter(l => l.trim().length > 0).length;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Step 1: Metric Input</h2>
           <p className="text-slate-500 text-sm">Paste your Prometheus metrics output below.</p>
        </div>
        <button
          onClick={() => onChange(SAMPLE_METRICS)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline bg-primary-50 px-3 py-1.5 rounded-md"
        >
          Load Sample Data
        </button>
      </div>
      
      <div className="relative flex-1 mb-6">
        <textarea
          className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder="# Paste your /metrics here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-500 border border-slate-200">
          {lineCount} lines
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!value.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <span>Next: Preview Metrics</span>
          <Play size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Step 2: Preview Parsed ---
interface StepPreviewProps {
  metrics: ParsedMetric[];
  onBack: () => void;
  onNext: () => void;
}
export const StepPreview: React.FC<StepPreviewProps> = ({ metrics, onBack, onNext }) => {
  const typeCounts = metrics.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-w-5xl mx-auto overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Step 2: Metric Analysis</h2>
          <div className="flex gap-4 mt-2 text-sm text-slate-600">
             <span className="flex items-center gap-1"><Hash size={14}/> {metrics.length} Metrics</span>
             <span className="flex items-center gap-1"><Tag size={14}/> {Object.keys(typeCounts).length} Types</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
            Back
          </button>
          <button onClick={onNext} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2">
            <Brain size={18} />
            <span>Analyze with AI</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mono text-sm font-semibold text-slate-800 break-all">{m.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium
                  ${m.type === 'counter' ? 'bg-blue-100 text-blue-700' : 
                    m.type === 'gauge' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {m.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2" title={m.help}>{m.help || 'No help text provided'}</p>
              {m.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.labels.map(l => (
                    <span key={l} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Step 4: Select Panels ---
interface StepSelectProps {
  plan: DashboardPlan;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAllRow: (ids: string[], selected: boolean) => void;
  onBack: () => void;
  onGenerate: () => void;
}
export const StepSelect: React.FC<StepSelectProps> = ({ plan, selectedIds, onToggle, onToggleAllRow, onBack, onGenerate }) => {
  const totalPanels = plan.categories.reduce((acc, cat) => acc + cat.panels.length, 0);
  const selectedCount = selectedIds.size;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-w-6xl mx-auto overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Step 4: Select Panels</h2>
          <p className="text-sm text-slate-500">
            AI proposed <span className="font-semibold text-slate-900">{totalPanels}</span> panels. 
            Selected: <span className="font-semibold text-primary-600">{selectedCount}</span>
          </p>
        </div>
        <div className="flex gap-3">
            <button onClick={onBack} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Back</button>
            <button 
              onClick={onGenerate}
              disabled={selectedCount === 0}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2"
            >
              <Play size={18} />
              <span>Generate Dashboard</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-8">
        {plan.categories.map((category, catIdx) => {
            const catPanelIds = category.panels.map(p => p.id);
            const allSelected = catPanelIds.every(id => selectedIds.has(id));
            
            return (
                <div key={catIdx} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                        <button 
                            onClick={() => onToggleAllRow(catPanelIds, !allSelected)}
                            className={`p-1 rounded hover:bg-slate-200 ${allSelected ? 'text-primary-600' : 'text-slate-400'}`}
                        >
                             {allSelected ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                        <h3 className="text-lg font-semibold text-slate-700">{category.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {category.panels.map((panel) => {
                            const isSelected = selectedIds.has(panel.id);
                            return (
                                <div 
                                    key={panel.id}
                                    onClick={() => onToggle(panel.id)}
                                    className={`
                                        cursor-pointer relative group rounded-lg border-2 p-4 transition-all
                                        ${isSelected ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}
                                    `}
                                >
                                    <div className="absolute top-3 right-3 text-primary-600">
                                        {isSelected ? <CheckCircle size={20} fill="currentColor" className="text-white" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                                    </div>
                                    
                                    <div className="pr-8">
                                        <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{panel.title}</h4>
                                        <span className="inline-block text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mb-2">
                                            {panel.type}
                                        </span>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{panel.description}</p>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-slate-100/50">
                                        <div className="flex flex-wrap gap-1">
                                            {panel.metrics.slice(0, 2).map(m => (
                                                <span key={m} className="text-[10px] font-mono bg-white border border-slate-200 px-1 rounded text-slate-600 truncate max-w-full">
                                                    {m}
                                                </span>
                                            ))}
                                            {panel.metrics.length > 2 && (
                                                <span className="text-[10px] text-slate-400 px-1">+{panel.metrics.length - 2}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
