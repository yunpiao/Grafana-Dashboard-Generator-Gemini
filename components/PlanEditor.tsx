import React, { useState } from 'react';
import { DashboardPlan, PanelPlan, PanelType } from '../types';
import { 
  BarChart3, Activity, Gauge, Grid3X3, BarChart, FileText,
  ChevronDown, ChevronRight, Trash2, Terminal
} from 'lucide-react';

interface PlanEditorProps {
  plan: DashboardPlan;
  onPlanChange: (plan: DashboardPlan) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const PANEL_TYPES = [
  { value: PanelType.Stat, label: 'Stat', icon: BarChart3, width: 1, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  { value: PanelType.Gauge, label: 'Gauge', icon: Gauge, width: 1, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  { value: PanelType.Timeseries, label: 'Timeseries', icon: Activity, width: 2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: PanelType.Heatmap, label: 'Heatmap', icon: Grid3X3, width: 2, color: 'text-orange-600 bg-orange-50 border-orange-200' }, // Keep Heatmap orange as it's distinctive
  { value: PanelType.Histogram, label: 'Histogram', icon: BarChart, width: 2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
];

const getPanelConfig = (type: PanelType) => {
  return PANEL_TYPES.find(t => t.value === type) || { icon: FileText, width: 1, color: 'text-slate-600 bg-slate-50 border-slate-200' };
};

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onPlanChange, onConfirm, onBack }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(plan.categories.map((_, i) => i))
  );
  const [editingDesc, setEditingDesc] = useState<string | null>(null); // "catIdx-panelIdx" or null

  const toggleCategory = (idx: number) => {
    const next = new Set(expandedCategories);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedCategories(next);
  };

  const updatePanel = (catIdx: number, panelIdx: number, updates: Partial<PanelPlan>) => {
    const newPlan = { ...plan };
    newPlan.categories = plan.categories.map((cat, ci) => {
      if (ci !== catIdx) return cat;
      return {
        ...cat,
        panels: cat.panels.map((p, pi) => pi === panelIdx ? { ...p, ...updates } : p)
      };
    });
    onPlanChange(newPlan);
  };

  const removePanel = (catIdx: number, panelIdx: number) => {
    const newPlan = { ...plan };
    newPlan.categories = plan.categories.map((cat, ci) => {
      if (ci !== catIdx) return cat;
      return {
        ...cat,
        panels: cat.panels.filter((_, pi) => pi !== panelIdx)
      };
    }).filter(cat => cat.panels.length > 0);
    onPlanChange(newPlan);
  };

  const totalPanels = plan.categories.reduce((acc, c) => acc + c.panels.length, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div>
          <h2 className="font-bold text-xl text-slate-800 tracking-tight">{plan.dashboardTitle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs font-medium">
              {plan.categories.length} Categories
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-xs font-medium">
              {totalPanels} Panels
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 flex items-center gap-2"
          >
            Generate Dashboard
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Categories with Grid Layout */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {plan.categories.map((category, catIdx) => {
          const isExpanded = expandedCategories.has(catIdx);
          return (
            <div key={catIdx} className="space-y-4">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(catIdx)}
                className="group flex items-center gap-3 w-full text-left focus:outline-none"
              >
                <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-slate-200 text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                   {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors uppercase tracking-wide">
                  {category.name}
                </h3>
                <div className="h-px bg-slate-200 flex-1 ml-2 group-hover:bg-slate-300 transition-colors" />
              </button>

              {/* Panels Grid - auto-fit for intelligent responsive layout */}
              {isExpanded && (
                <div 
                  className="grid gap-4 animate-in slide-in-from-top-2 duration-300"
                  style={{ gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))` }}
                >
                  {category.panels.map((panel, panelIdx) => {
                    const config = getPanelConfig(panel.type);
                    const Icon = config.icon;

                    return (
                      <div 
                        key={panelIdx} 
                        className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col overflow-hidden"
                      >
                        {/* Panel Content */}
                        <div className="p-4 flex-1 flex flex-col gap-2">
                          
                          {/* Top Row: Icon & Delete */}
                          <div className="flex items-start justify-between">
                            <div className={`p-1.5 rounded-lg ${config.color} bg-opacity-50`}>
                              <Icon size={16} />
                            </div>
                            <button
                              onClick={() => removePanel(catIdx, panelIdx)}
                              className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1 flex-1">
                            <h4 className="font-bold text-sm text-slate-800">{panel.title}</h4>
                            {editingDesc === `${catIdx}-${panelIdx}` ? (
                              <input
                                type="text"
                                value={panel.description}
                                onChange={(e) => updatePanel(catIdx, panelIdx, { description: e.target.value })}
                                onBlur={() => setEditingDesc(null)}
                                autoFocus
                                className="w-full text-xs text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                placeholder="Description"
                              />
                            ) : (
                              <p 
                                onClick={() => setEditingDesc(`${catIdx}-${panelIdx}`)}
                                className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"
                                title="Click to edit"
                              >
                                {panel.description || 'Click to add description'}
                              </p>
                            )}
                          </div>

                        </div>

                        {/* PromQL Section */}
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                          <div className="text-[10px] font-semibold text-amber-600 mb-1">PROMQL</div>
                          <input
                            type="text"
                            value={panel.promql_hint}
                            onChange={(e) => updatePanel(catIdx, panelIdx, { promql_hint: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="rate(metric_name[5m])"
                          />
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
