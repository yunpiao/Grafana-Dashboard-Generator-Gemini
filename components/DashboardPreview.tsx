import React from 'react';
import { AIResponse } from '../types';
import { PanelPreview } from './PanelPreview';
import { LayoutDashboard, Download, Copy, Check } from 'lucide-react';
import { buildGrafanaDashboardJson } from '../services/grafanaBuilder';

interface DashboardPreviewProps {
  data: AIResponse | null;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ data }) => {
  const [copied, setCopied] = React.useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center h-full text-center text-slate-400">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <LayoutDashboard size={48} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Dashboard Generated Yet</h3>
        <p className="max-w-xs text-sm">
          Paste your metrics on the left and click Generate to see the AI magic happen.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    const json = buildGrafanaDashboardJson(data);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafana-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const json = buildGrafanaDashboardJson(data);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{data.dashboardTitle}</h2>
          <p className="text-xs text-slate-500 truncate max-w-md">{data.dashboardDescription}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors shadow-sm"
          >
            <Download size={14} />
            Download JSON
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-8">
        {data.categories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.panels.map((panel, pIdx) => (
                <div 
                  key={pIdx} 
                  className={
                    // Spanning logic for visual preview
                    (panel.type === 'stat' || panel.type === 'gauge') 
                      ? "col-span-1" 
                      : "col-span-1 md:col-span-2"
                  }
                >
                  <PanelPreview panel={panel} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
