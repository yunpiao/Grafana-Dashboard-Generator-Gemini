export enum PanelType {
  Timeseries = 'timeseries',
  Stat = 'stat',
  Gauge = 'gauge',
  Heatmap = 'heatmap',
  Logs = 'logs'
}

// Step 2: Local Parsed Metric
export interface ParsedMetric {
  name: string;
  type: string;
  help: string;
  labels: string[];
}

// Step 3: AI Plan
export interface PanelPlan {
  id: string;
  title: string;
  type: PanelType;
  description: string;
  metrics: string[]; // List of metrics this panel uses
  promql_hint: string;
}

export interface CategoryPlan {
  name: string;
  panels: PanelPlan[];
}

export interface DashboardPlan {
  dashboardTitle: string;
  dashboardDescription: string;
  categories: CategoryPlan[];
}

// Step 5: Final Generated Output
export interface GeneratedPanel {
  title: string;
  type: PanelType;
  description: string;
  promql: string;
  unit: string;
  min?: number;
  max?: number;
  metrics: string[];
}

export interface GeneratedCategory {
  name: string;
  panels: GeneratedPanel[];
}

export interface AIResponse {
  dashboardTitle: string;
  dashboardDescription: string;
  categories: GeneratedCategory[];
}

// Grafana JSON Internal Types
export interface GrafanaTarget {
  expr: string;
  refId: string;
  legendFormat?: string;
}

export interface GrafanaPanel {
  id: number;
  gridPos: { h: number; w: number; x: number; y: number };
  type: string;
  title: string;
  datasource: { type: string; uid: string };
  targets: GrafanaTarget[];
  fieldConfig: {
    defaults: {
      unit: string;
      min?: number;
      max?: number;
      color?: { mode: string };
      custom?: Record<string, any>;
      [key: string]: any;
    };
  };
  options?: any;
  [key: string]: any;
}