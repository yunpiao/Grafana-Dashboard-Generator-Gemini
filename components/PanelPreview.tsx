import React from 'react';
import { GeneratedPanel, PanelType } from '../types';
import { 
  LineChart, Line, ResponsiveContainer, AreaChart, Area, 
  CartesianGrid, XAxis, YAxis, Tooltip, Legend 
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

// Grafana-like colors (Light Theme)
const COLORS = {
  green: '#73BF69',
  yellow: '#FADE2A',
  blue: '#5794F2',
  grid: '#E7E7E9', // Light grey grid
  text: '#4F5766'  // Slate text
};

export const PanelPreview: React.FC<PanelPreviewProps> = ({ panel }) => {
  const isStat = panel.type === PanelType.Stat || panel.type === PanelType.Gauge;
  const data = React.useMemo(() => generateMockData(panel.type), [panel.type]);
  const lastValue = data[data.length - 1].value;

  // Set fixed height based on panel type
  const heightClass = isStat ? 'h-[120px]' : 'h-[240px]';

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
                style={{ color: lastValue > 80 ? '#F2495C' : '#73BF69' }} // Red if high, Green otherwise
              >
                {lastValue}
              </span>
              <span className="text-sm text-slate-500 font-medium">{panel.unit || 'value'}</span>
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
                height={20} 
                iconType="rect"
                iconSize={10}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: COLORS.text }}
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