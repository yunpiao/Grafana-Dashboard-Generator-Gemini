import React from 'react';
import { SAMPLE_METRICS } from '../constants';
import { Play } from 'lucide-react';

interface MetricInputProps {
  value: string;
  onChange: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const MetricInput: React.FC<MetricInputProps> = ({ value, onChange, onGenerate, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Prometheus Metrics</h2>
        <button
          onClick={() => onChange(SAMPLE_METRICS)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          disabled={isLoading}
        >
          Load Sample
        </button>
      </div>
      
      <textarea
        className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all mb-4"
        placeholder="# Paste your /metrics here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      />

      <button
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        className={`
          flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all
          ${isLoading || !value.trim() 
            ? 'bg-slate-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg active:scale-[0.98]'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            <span>Analyzing Metrics...</span>
          </>
        ) : (
          <>
            <Play size={18} fill="currentColor" />
            <span>Generate Dashboard</span>
          </>
        )}
      </button>
    </div>
  );
};
