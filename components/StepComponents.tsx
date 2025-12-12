import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_METRICS } from '../constants';
import { ParsedMetric } from '../types';
import { parseMetricsLocal } from '../utils/metricParser';
import { 
  Play, FileText, Upload,
  Hash, Tag, BarChart3, Activity, Gauge, Timer, ChevronRight,
  Check, Square, CheckSquare
} from 'lucide-react';

// --- Step 1: Input with Auto-Parse Preview ---
interface StepInputProps {
  value: string;
  onValueChange: (val: string) => void;
  onGenerate: () => void;
}

export const StepInput: React.FC<StepInputProps> = ({ value, onValueChange, onGenerate }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const lineCount = value.split('\n').filter(l => l.trim().length > 0).length;

  // Auto-parse metrics when value changes
  const parsedMetrics = useMemo(() => {
    if (!value.trim()) return [];
    return parseMetricsLocal(value);
  }, [value]);

  // Auto-select all metrics when parsed metrics change
  useEffect(() => {
    if (parsedMetrics.length > 0) {
      setSelectedMetrics(new Set(parsedMetrics.map(m => m.name)));
    }
  }, [parsedMetrics]);

  const toggleMetric = (name: string) => {
    const next = new Set(selectedMetrics);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedMetrics(next);
  };

  const toggleTypeAll = (metrics: ParsedMetric[]) => {
    const names = metrics.map(m => m.name);
    const allSelected = names.every(n => selectedMetrics.has(n));
    const next = new Set(selectedMetrics);
    if (allSelected) {
      names.forEach(n => next.delete(n));
    } else {
      names.forEach(n => next.add(n));
    }
    setSelectedMetrics(next);
  };

  const selectAll = () => setSelectedMetrics(new Set(parsedMetrics.map(m => m.name)));
  const selectNone = () => setSelectedMetrics(new Set());

  // Group by type for display
  const metricsByType = useMemo(() => {
    const grouped: Record<string, ParsedMetric[]> = {};
    parsedMetrics.forEach(m => {
      const type = m.type || 'unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(m);
    });
    return grouped;
  }, [parsedMetrics]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'counter': return Activity;
      case 'gauge': return Gauge;
      case 'histogram': return BarChart3;
      case 'summary': return Timer;
      default: return Hash;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'counter': return 'text-blue-600 bg-blue-50';
      case 'gauge': return 'text-green-600 bg-green-50';
      case 'histogram': return 'text-orange-600 bg-orange-50';
      case 'summary': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onValueChange(text);
    };
    reader.readAsText(file);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full max-w-7xl mx-auto">
        
        {/* Left Column: Metrics Input */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] lg:min-h-0">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all hover:bg-slate-50 whitespace-nowrap ${activeTab === 'text' ? 'border-primary-500 text-primary-700 bg-white' : 'border-transparent text-slate-500'}`}
                >
                    <FileText size={16} /> Paste Text
                </button>
                <button 
                    onClick={() => setActiveTab('file')}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all hover:bg-slate-50 whitespace-nowrap ${activeTab === 'file' ? 'border-primary-500 text-primary-700 bg-white' : 'border-transparent text-slate-500'}`}
                >
                    <Upload size={16} /> Upload File
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-0 flex flex-col">
                {activeTab === 'text' && (
                    <div className="relative flex-1 flex flex-col p-4 min-h-[300px]">
                        <textarea
                            className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-700 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all z-0"
                            placeholder={value.length === 0 ? "" : "# Paste your Prometheus /metrics output here..."}
                            value={value}
                            onChange={(e) => onValueChange(e.target.value)}
                        />
                        
                        {/* Center Overlay for Empty State */}
                        {value.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100">
                                    <p className="text-sm text-slate-500 font-medium mb-4">Paste your Prometheus metrics above</p>
                                    <button
                                        onClick={() => onValueChange(SAMPLE_METRICS)}
                                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-lg shadow hover:from-primary-700 hover:to-primary-600 transition-all"
                                    >
                                        Load Node Exporter Sample
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-200 shadow-sm pointer-events-none z-10">
                            {lineCount} lines
                        </div>
                    </div>
                )}

                {activeTab === 'file' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 m-4 rounded-xl bg-slate-50 min-h-[300px]">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">Upload Metrics File</h3>
                        <p className="text-sm text-slate-400 mb-6">Supported formats: .txt, .prom</p>
                        <label className="bg-white border border-slate-300 hover:border-primary-500 hover:text-primary-600 text-slate-700 font-medium py-2 px-6 rounded-lg cursor-pointer transition-all shadow-sm">
                            <input type="file" className="hidden" accept=".txt,.prom" onChange={handleFileUpload} />
                            Choose File
                        </label>
                    </div>
                )}

            </div>
        </div>

        {/* Right Column: Parsed Metrics Preview */}
        <div className="flex flex-col gap-4">
            {parsedMetrics.length > 0 ? (
              <>
                {/* Metrics Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Hash size={16} className="text-primary-500" />
                    Parsed Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-primary-600">{selectedMetrics.size}</div>
                      <div className="text-xs text-slate-500">Selected</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-slate-800">{parsedMetrics.length}</div>
                      <div className="text-xs text-slate-500">Total</div>
                    </div>
                  </div>
                  {/* Select All / None */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={selectAll}
                      className="flex-1 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={selectNone}
                      className="flex-1 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded transition-colors"
                    >
                      Select None
                    </button>
                  </div>
                </div>

                {/* Metrics by Type */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col min-h-[200px]">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase">By Type</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {(Object.entries(metricsByType) as [string, ParsedMetric[]][]).map(([type, metrics]) => {
                      const Icon = getTypeIcon(type);
                      const colorClass = getTypeColor(type);
                      const selectedInType = metrics.filter(m => selectedMetrics.has(m.name)).length;
                      const allSelectedInType = selectedInType === metrics.length;
                      return (
                        <details key={type} className="group">
                          <summary className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50 ${colorClass.split(' ')[1]}`}>
                            <ChevronRight size={14} className="text-slate-400 group-open:rotate-90 transition-transform" />
                            <Icon size={14} className={colorClass.split(' ')[0]} />
                            <span className="text-xs font-medium text-slate-700 flex-1">{type}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedInType === metrics.length ? 'bg-primary-100 text-primary-600' : 'text-slate-400'}`}>
                              {selectedInType}/{metrics.length}
                            </span>
                          </summary>
                          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-2">
                            {/* Type Select All */}
                            <button
                              onClick={(e) => { e.preventDefault(); toggleTypeAll(metrics); }}
                              className="text-[10px] text-primary-600 hover:text-primary-700 font-medium py-1"
                            >
                              {allSelectedInType ? 'Deselect all' : 'Select all'} {type}
                            </button>
                            {/* Metric Items */}
                            {metrics.map((m, i) => {
                              const isSelected = selectedMetrics.has(m.name);
                              return (
                                <label 
                                  key={i} 
                                  className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                                  title={m.help || m.name}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleMetric(m.name)}
                                    className="w-3 h-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-700' : 'text-slate-500'}`}>
                                    {m.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={onGenerate}
                  disabled={selectedMetrics.size === 0}
                  className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${
                    selectedMetrics.size === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/30 transform hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  <Play size={20} fill="currentColor" />
                  Generate Plan ({selectedMetrics.size} metrics)
                </button>
              </>
            ) : (
              /* Hero-style Empty State */
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                {/* Gemini Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4 relative z-10">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                  </span>
                  Gemini 3 Pro Ready
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 relative z-10">
                  <Activity size={28} className="text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Ready to Analyze</h3>
                <p className="text-sm text-slate-500 max-w-xs mb-4 relative z-10">
                  Paste your Prometheus metrics on the left. AI will auto-detect types and suggest optimal visualizations.
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-2 text-xs relative z-10">
                  <span className="px-2 py-1 bg-white/80 rounded-full text-slate-600 border border-slate-100">Auto-parse</span>
                  <span className="px-2 py-1 bg-white/80 rounded-full text-slate-600 border border-slate-100">Smart PromQL</span>
                  <span className="px-2 py-1 bg-white/80 rounded-full text-slate-600 border border-slate-100">One-click Export</span>
                </div>
              </div>
            )}
        </div>
    </div>
  );
};