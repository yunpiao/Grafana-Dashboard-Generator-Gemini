import React from 'react';
import { GeneratedPanel, PanelType } from '../types';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PanelPreviewProps {
  panel: GeneratedPanel;
}

// Mock data for visualizations
const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: Math.floor(Math.random() * 100) + 20
}));

export const PanelPreview: React.FC<PanelPreviewProps> = ({ panel }) => {
  const isStat = panel.type === PanelType.Stat || panel.type === PanelType.Gauge;
  
  return (
    <div className={`bg-slate-900 rounded-lg p-4 border border-slate-700 flex flex-col ${isStat ? 'h-32' : 'h-64'}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-slate-100 font-medium text-sm truncate pr-2" title={panel.title}>
          {panel.title}
        </h4>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
          {panel.type}
        </span>
      </div>
      
      <div className="flex-1 w-full relative overflow-hidden">
        {isStat ? (
          <div className="h-full flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-400">
              {Math.floor(Math.random() * 1000)}
            </span>
            <span className="text-xs text-slate-400 mt-1">{panel.unit}</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#60a5fa" 
                fill="#3b82f6" 
                fillOpacity={0.1} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-slate-800">
        <code className="block text-[10px] text-slate-500 font-mono truncate" title={panel.promql}>
          {panel.promql}
        </code>
      </div>
    </div>
  );
};
