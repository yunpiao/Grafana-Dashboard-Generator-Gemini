import React from 'react';
import { GeneratedPanel, PanelType } from '../types';
import { 
  LineChart, Line, ResponsiveContainer, AreaChart, Area, 
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, Cell
} from 'recharts';
import { Info, MoreVertical } from 'lucide-react';

interface PanelPreviewProps {
  panel: GeneratedPanel;
}

// Generate realistic-looking metric data
const generateMockData = (type: string) => {
  const data = [];
  let value = 50;
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    // Random walk
    const change = (Math.random() - 0.5) * 20;
    value = Math.max(10, Math.min(100, value + change));
    
    // Add spikes for realism
    if (Math.random() > 0.9) value += 30;

    data.push({
      time: new Date(now.getTime() - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.floor(value),
      value2: Math.floor(value * 0.6) // Second series for visual density
    });
  }
  return data;
};

// Generate histogram bucket data
const generateHistogramData = () => {
  const buckets = ['0.005', '0.01', '0.025', '0.05', '0.1', '0.25', '0.5', '1', '+Inf'];
  return buckets.map((le, idx) => ({
    bucket: le,
    count: Math.floor(Math.random() * 500 + 100 * (9 - idx)), // Decreasing counts
  }));
};

// Generate heatmap data (time x bucket matrix) with a "hot spot"
const generateHeatmapData = () => {
  const rows = 10; // buckets
  const cols = 20; // time points
  const data: number[][] = [];
  
  // Create a distribution center that moves slightly over time
  let centerRow = 4;
  
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      // Drift the center
      centerRow += (Math.random() - 0.5) * 0.5;
      
      // Distance from center (Gaussian-ish profile)
      const dist = Math.abs(r - centerRow);
      const baseVal = Math.max(0, 100 * Math.exp(-dist * dist / 2));
      
      // Add noise
      const val = Math.floor(baseVal * (0.8 + Math.random() * 0.4));
      row.push(val > 5 ? val : 0); // Cutoff low noise
    }
    data.push(row);
  }
  // Reverse to put high buckets (larger le) at top usually, 
  // but Grafana heatmap Y-axis usually puts small values at bottom.
  // Let's assume row 0 is small latency, row N is high latency.
  return data.reverse(); 
};

// Heatmap color scale (Opacity based on global max)
const getHeatColor = (value: number, max: number) => {
  if (value === 0) return 'transparent';
  const ratio = Math.pow(value / max, 0.7); // Slight curve to make mid-values visible
  // Grafana classic heatmap orange scheme
  return `rgba(255, 152, 48, ${ratio})`; 
};

// Grafana-like colors (Light Theme)
const COLORS = {
  green: '#73BF69',
  yellow: '#FADE2A',
  blue: '#5794F2',
  orange: '#FF9830',
  red: '#F2495C',
  grid: '#E7E7E9', // Light grey grid
  text: '#4F5766'  // Slate text
};

export const PanelPreview: React.FC<PanelPreviewProps> = ({ panel }) => {
  const isStat = panel.type === PanelType.Stat || panel.type === PanelType.Gauge;
  const isHeatmap = panel.type === PanelType.Heatmap;
  const isHistogram = panel.type === PanelType.Histogram;
  
  const data = React.useMemo(() => generateMockData(panel.type), [panel.type]);
  const histogramData = React.useMemo(() => generateHistogramData(), []);
  const heatmapData = React.useMemo(() => generateHeatmapData(), []);
  
  // Calculate global max for heatmap normalization
  const heatmapMax = React.useMemo(() => {
    let max = 0;
    heatmapData.forEach(row => row.forEach(val => max = Math.max(max, val)));
    return max || 1;
  }, [heatmapData]);

  const isBoolUnit = (panel.unit || '').toLowerCase() === 'bool';
  const statSeries = React.useMemo(() => {
    if (!isBoolUnit) return data;
    return data.map(d => ({ ...d, value: d.value > 50 ? 1 : 0 }));
  }, [data, isBoolUnit]);
  const lastValue = statSeries[statSeries.length - 1].value;

  // Set fixed height based on panel type
  const heightClass = isStat ? 'h-[120px]' : 'h-[240px]';
  const displayValue = isBoolUnit ? (lastValue ? 'True' : 'False') : lastValue;
  const displayUnit = isBoolUnit ? '' : (panel.unit || 'value');

  // Custom Tooltip to look like Grafana's
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
              <span className="font-mono font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Legend: left-aligned, auto-wrap, contained within panel
  const CustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div 
        className="text-[9px] text-slate-500 flex flex-wrap items-start gap-x-3 gap-y-0.5 pl-10 pr-2"
        style={{ maxHeight: 24, overflow: 'hidden', lineHeight: '11px' }}
      >
        {payload.map((entry: any, idx: number) => (
          <span key={idx} className="inline-flex items-center gap-0.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="truncate max-w-[140px]">{entry.value}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col ${heightClass} hover:shadow-md transition-shadow duration-200`}>
      {/* Grafana-style Header */}
      <div className="flex justify-between items-center px-3 py-1 bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 group cursor-pointer h-8 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <h4 className="font-medium text-[13px] text-slate-700 truncate flex items-center gap-1.5" title={panel.title}>
            {panel.title}
            <Info size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={14} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex-1 w-full relative p-2 min-h-0">
        {isStat ? (
          // Stat Panel
          <div className="h-full flex flex-col items-center justify-center relative">
            <div className="flex items-baseline gap-1">
              <span 
                className="text-4xl font-semibold tracking-tight leading-none"
                style={{ color: isBoolUnit ? '#73BF69' : (lastValue > 80 ? '#F2495C' : '#73BF69') }} // Bool always green
              >
                {displayValue}
              </span>
              {displayUnit && (
                <span className="text-sm text-slate-500 font-medium">{displayUnit}</span>
              )}
            </div>
            
            {/* Sparkline background */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-10">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <Area type="monotone" dataKey="value" stroke="none" fill={COLORS.green} />
                </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        ) : isHeatmap ? (
          // Heatmap Panel
          <div className="h-full flex flex-col">
            <div className="flex-1 grid gap-[1px] p-1" style={{ gridTemplateRows: `repeat(${heatmapData.length}, 1fr)` }}>
              {heatmapData.map((row, rowIdx) => {
                return (
                  <div key={rowIdx} className="flex gap-[1px]">
                    {row.map((val, colIdx) => (
                      <div
                        key={colIdx}
                        className="flex-1 rounded-sm transition-colors"
                        style={{ backgroundColor: getHeatColor(val, heatmapMax) }}
                        title={`Bucket ${rowIdx + 1}, Time ${colIdx + 1}: ${val}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 px-1 pt-1">
              <span>0.005s</span>
              <span>0.1s</span>
              <span>1s</span>
              <span>+Inf</span>
            </div>
          </div>
        ) : isHistogram ? (
          // Histogram Panel (Bar Chart)
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
              <XAxis 
                dataKey="bucket" 
                tick={{ fontSize: 9, fill: COLORS.text }} 
                tickLine={false}
                axisLine={{ stroke: COLORS.grid }}
                label={{ value: 'le (seconds)', position: 'insideBottom', offset: -5, fontSize: 9, fill: COLORS.text }}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: COLORS.text }} 
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Count']}
                contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: 'none', borderRadius: 4, color: '#fff' }}
              />
              <Bar dataKey="count" fill={COLORS.blue} opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Timeseries Panel
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.yellow} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS.yellow} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke={COLORS.grid} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: COLORS.text }} 
                tickLine={false}
                axisLine={{ stroke: COLORS.grid }}
                minTickGap={30}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: COLORS.text }} 
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                align="left"
                iconType="rect"
                iconSize={9}
                wrapperStyle={{ 
                  width: '100%',
                  paddingTop: 2,
                  overflowX: 'auto',
                  overflowY: 'hidden'
                }}
                content={<CustomLegend />}
              />
              <Area 
                type="monotone" 
                name={panel.metrics && panel.metrics[0] ? panel.metrics[0] : "metric_value"}
                dataKey="value" 
                stroke={COLORS.green} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                name={panel.metrics && panel.metrics[1] ? panel.metrics[1] : (panel.metrics && panel.metrics[0] ? `${panel.metrics[0]}_avg` : "metric_average")}
                dataKey="value2" 
                stroke={COLORS.yellow} 
                fillOpacity={1} 
                fill="url(#colorValue2)" 
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};