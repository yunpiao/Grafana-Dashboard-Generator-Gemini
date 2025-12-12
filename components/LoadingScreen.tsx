import React, { useEffect, useState } from 'react';
import { Loader2, Terminal } from 'lucide-react';

interface LoadingScreenProps {
  logs: string[];
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ logs }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] max-w-2xl mx-auto">
      <div className="relative mb-10">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 size={32} className="text-primary-600 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">
        AI is working{dots}
      </h3>
      <p className="text-slate-500 mb-8">This may take up to 1 minute.</p>

      {/* Terminal Log View */}
      <div className="w-full bg-slate-900 rounded-lg p-4 font-mono text-sm shadow-xl border border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
            <Terminal size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">generator_logs</span>
        </div>
        <div className="flex flex-col gap-2 h-48 overflow-y-auto">
            {logs.map((log, i) => (
                <div key={i} className={`
                    ${i === logs.length - 1 ? 'text-green-400 font-bold' : 'text-slate-400'}
                    transition-all duration-300
                `}>
                    <span className="opacity-50 mr-2">{'>'}</span>
                    {log}
                </div>
            ))}
            <div className="animate-pulse text-primary-500">
                <span className="opacity-50 mr-2">{'>'}</span>
                _
            </div>
        </div>
      </div>
    </div>
  );
};