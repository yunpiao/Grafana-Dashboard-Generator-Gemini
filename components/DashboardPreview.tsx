import React, { useState, useEffect } from 'react';
import { AIResponse, PanelType, GeneratedPanel } from '../types';
import { PanelPreview } from './PanelPreview';
import { buildGrafanaDashboardJson } from '../services/grafanaBuilder';
import { 
  Download, Copy, Check, LayoutDashboard, Settings2, 
  ChevronRight, ChevronDown, CheckCircle, Circle, Eye, EyeOff
} from 'lucide-react';

interface DashboardPreviewProps {
  data: AIResponse | null;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [activePanels, setActivePanels] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(true);

  // Initialize active panels when data loads
  useEffect(() => {
    if (data) {
      const allIndices = new Set<number>();
      let globalIdx = 0;
      data.categories.forEach(cat => {
          setExpandedCategories(prev => new Set(prev).add(cat.name));
          cat.panels.forEach(() => {
              allIndices.add(globalIdx++);
          });
      });
      setActivePanels(allIndices);
    }
  }, [data]);

  if (!data) return null;

  // Filter Data for Export
  const getFilteredData = (): AIResponse => {
    let globalIdx = 0;
    return {
        ...data,
        categories: data.categories.map(cat => ({
            ...cat,
            panels: cat.panels.filter(() => activePanels.has(globalIdx++))
        })).filter(cat => cat.panels.length > 0)
    };
  };

  const handleDownload = () => {
    const json = buildGrafanaDashboardJson(getFilteredData());
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
    const json = buildGrafanaDashboardJson(getFilteredData());
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePanel = (idx: number) => {
    const next = new Set(activePanels);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setActivePanels(next);
  };

  const toggleCategory = (catName: string) => {
    const next = new Set(expandedCategories);
    if (next.has(catName)) next.delete(catName);
    else next.add(catName);
    setExpandedCategories(next);
  };

  // Helper to keep track of global index for mapping sidebar to main view
  let sidebarGlobalIdx = 0;
  let mainGlobalIdx = 0;

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden border-t border-slate-200">
      
      {/* Sidebar: Fine-tuning */}
      <div className={`
        bg-white border-r border-slate-200 flex flex-col transition-all duration-300
        ${showSidebar ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}
      `}>
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Settings2 size={16} /> Panel Visibility
            </h3>
            <span className="text-xs text-slate-400">{activePanels.size} active</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {data.categories.map((cat, i) => {
                const isExpanded = expandedCategories.has(cat.name);
                return (
                    <div key={i} className="rounded-lg border border-slate-100 bg-white overflow-hidden">
                        <button 
                            onClick={() => toggleCategory(cat.name)}
                            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                        >
                            <span className="font-semibold text-xs text-slate-700 uppercase tracking-wide truncate pr-2">{cat.name}</span>
                            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        </button>
                        
                        {isExpanded && (
                            <div className="p-2 space-y-1">
                                {cat.panels.map((panel, j) => {
                                    const currentIdx = sidebarGlobalIdx++;
                                    const isActive = activePanels.has(currentIdx);
                                    return (
                                        <div 
                                            key={j} 
                                            onClick={() => togglePanel(currentIdx)}
                                            className={`
                                                flex items-center gap-3 p-2 rounded cursor-pointer text-sm group transition-all
                                                ${isActive ? 'bg-blue-50/50 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}
                                            `}
                                        >
                                            <div className={`${isActive ? 'text-primary-600' : 'text-slate-300'}`}>
                                                {isActive ? <CheckCircle size={16} /> : <Circle size={16} />}
                                            </div>
                                            <span className={`truncate ${!isActive && 'line-through opacity-60'}`}>{panel.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {!isExpanded && (
                            // Increment counter even if hidden to maintain sync
                            (() => { sidebarGlobalIdx += cat.panels.length; return null; })()
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    title="Toggle Sidebar"
                >
                    <Settings2 size={18} />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">{data.dashboardTitle}</h2>
                    <p className="text-xs text-slate-500">{data.dashboardDescription}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all"
                >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm rounded-lg transition-all"
                >
                    <Download size={16} />
                    Download JSON
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
            {data.categories.map((category, catIdx) => {
                // Check if any panels in this category are active
                const categoryStartIdx = mainGlobalIdx;
                const activePanelsInCategory = category.panels.filter((_, idx) => activePanels.has(categoryStartIdx + idx));
                
                // Sort panels: Stat/Gauge first
                const sortedPanelsWithIndices = category.panels.map((p, i) => ({...p, originalIdx: categoryStartIdx + i}))
                    .filter(p => activePanels.has(p.originalIdx))
                    .sort((a, b) => {
                        const getPriority = (type: PanelType) => (type === PanelType.Stat || type === PanelType.Gauge) ? 1 : 2;
                        return getPriority(a.type) - getPriority(b.type);
                    });
                
                mainGlobalIdx += category.panels.length;

                if (activePanelsInCategory.length === 0) return null;

                return (
                    <div key={catIdx} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200">
                            <LayoutDashboard size={14} />
                            {category.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sortedPanelsWithIndices.map((panel, pIdx) => {
                                const isStat = panel.type === PanelType.Stat || panel.type === PanelType.Gauge;
                                return (
                                    <div 
                                        key={panel.originalIdx} 
                                        className={isStat ? "col-span-1" : "col-span-1 md:col-span-2"}
                                    >
                                        <PanelPreview panel={panel} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            
            {/* Empty State if everything unchecked */}
            {activePanels.size === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <EyeOff size={48} className="mb-4 opacity-50" />
                    <p>All panels hidden. Enable them in the sidebar.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};