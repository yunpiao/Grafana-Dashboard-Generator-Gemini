import React, { useState } from 'react';
import { SAMPLE_METRICS } from '../constants';
import { Play, FileText, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

// --- Step 1: Input & Context ---
interface StepInputProps {
  value: string;
  context: string;
  onValueChange: (val: string) => void;
  onContextChange: (val: string) => void;
  onGenerate: () => void;
}

export const StepInput: React.FC<StepInputProps> = ({ value, context, onValueChange, onContextChange, onGenerate }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'url'>('text');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const lineCount = value.split('\n').filter(l => l.trim().length > 0).length;

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

  const handleUrlFetch = async () => {
    if (!urlInput) return;
    setUrlError('');
    try {
        const res = await fetch(urlInput);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const text = await res.text();
        onValueChange(text);
        setActiveTab('text');
    } catch (e) {
        setUrlError("Could not fetch URL directly (likely CORS). Please copy/paste the content manually.");
    }
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
                <button 
                    onClick={() => setActiveTab('url')}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all hover:bg-slate-50 whitespace-nowrap ${activeTab === 'url' ? 'border-primary-500 text-primary-700 bg-white' : 'border-transparent text-slate-500'}`}
                >
                    <LinkIcon size={16} /> Fetch URL
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
                        
                        {/* Center Overlay for Empty State - Visible on all devices */}
                        {value.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="text-center p-6 pointer-events-auto bg-white/50 backdrop-blur-sm rounded-xl">
                                    <p className="text-sm text-slate-500 mb-3 font-medium">Paste your metrics above, or</p>
                                    <button
                                        onClick={() => onValueChange(SAMPLE_METRICS)}
                                        className="bg-white text-slate-600 font-semibold px-5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-primary-600 transition-colors text-sm flex items-center gap-2 mx-auto"
                                    >
                                        <FileText size={16} />
                                        Load Sample Data
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

                {activeTab === 'url' && (
                    <div className="flex-1 flex flex-col p-8 min-h-[300px]">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Metrics Endpoint URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="url" 
                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="https://example.com/metrics"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                            />
                            <button 
                                onClick={handleUrlFetch}
                                className="bg-slate-800 text-white px-6 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                            >
                                Fetch
                            </button>
                        </div>
                        {urlError && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-amber-800">{urlError}</p>
                            </div>
                        )}
                        <p className="mt-6 text-xs text-slate-400">
                            Note: Fetching from external URLs requires the endpoint to support CORS (Cross-Origin Resource Sharing). If fetch fails, please copy the text manually.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Context & Action */}
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[200px]">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Instructions (Optional)</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Tell the AI what to focus on. e.g., "This is a JVM app, focus on Garbage Collection" or "Use the RED method."
                </p>
                <textarea
                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[120px]"
                    placeholder="E.g., Group panels by service name, focus on 99th percentile latency..."
                    value={context}
                    onChange={(e) => onContextChange(e.target.value)}
                />
            </div>

            <button
                onClick={onGenerate}
                disabled={!value.trim()}
                className={`
                    w-full py-5 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3
                    ${!value.trim() 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/30 transform hover:-translate-y-0.5 active:translate-y-0'
                    }
                `}
            >
                <Play size={24} fill="currentColor" />
                Start Generation
            </button>
        </div>
    </div>
  );
};