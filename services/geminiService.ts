import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIResponse, DashboardPlan, PanelType } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Clean Markdown blocks
const cleanResponse = (text: string | undefined): string => {
  if (!text) throw new Error("No response from AI");
  return text.replace(/```(?:json)?\s*|```/gi, '').trim();
};

const parseJsonFromAI = <T>(text: string | undefined): T => {
  const cleaned = cleanResponse(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstObj = cleaned.indexOf('{');
    const lastObj = cleaned.lastIndexOf('}');
    if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
      return JSON.parse(cleaned.slice(firstObj, lastObj + 1)) as T;
    }
    throw new Error("Invalid JSON response from AI");
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const coercePanelType = (value: unknown): PanelType => {
  const t = typeof value === 'string' ? value.trim() : '';
  if (t === PanelType.Timeseries) return PanelType.Timeseries;
  if (t === PanelType.Stat) return PanelType.Stat;
  if (t === PanelType.Gauge) return PanelType.Gauge;
  if (t === PanelType.Heatmap) return PanelType.Heatmap;
  if (t === PanelType.Histogram) return PanelType.Histogram;
  throw new Error(`Invalid panel type: ${String(value)}`);
};

const normalizeGeneratedPanel = (panel: any, panelPlan: any): any => {
  const normalized: any = {
    ...panel,
    title: typeof panel?.title === 'string' ? panel.title.trim() : (typeof panelPlan?.title === 'string' ? panelPlan.title : ''),
    type: coercePanelType(panel?.type ?? panelPlan?.type),
    description: typeof panel?.description === 'string' ? panel.description : (typeof panelPlan?.description === 'string' ? panelPlan.description : ''),
    promql: typeof panel?.promql === 'string' ? panel.promql.trim() : '',
    unit: typeof panel?.unit === 'string' && panel.unit.trim().length > 0 ? panel.unit.trim() : 'short',
    metrics: Array.isArray(panel?.metrics) ? panel.metrics.filter((m: any) => typeof m === 'string') : (Array.isArray(panelPlan?.metrics) ? panelPlan.metrics : [])
  };

  if (normalized.metrics.length === 0 && typeof panelPlan?.metrics === 'string') {
    normalized.metrics = [panelPlan.metrics];
  }

  if (typeof panel?.min === 'number') normalized.min = panel.min;
  else delete normalized.min;

  if (typeof panel?.max === 'number') normalized.max = panel.max;
  else delete normalized.max;

  if (!normalized.title || !normalized.promql) {
    throw new Error("Panel output missing required fields");
  }

  if (normalized.promql.includes('_*_')) {
    throw new Error("PromQL contains unsupported wildcard metric name");
  }

  return normalized;
};

// Fix PromQL: replace {__name__=~"metric_a|metric_b"} with explicit metric names
const fixPromQL = (promql: string): string => {
  // Pattern: rate({__name__=~"metricA|metricB"}[5m]) -> rate(metricA[5m]) + rate(metricB[5m])
  const regex = /(\w+)\(\{__name__=~["']([^"']+)["']\}\[(\w+)\]\)/g;
  
  let result = promql;
  let match;
  
  while ((match = regex.exec(promql)) !== null) {
    const func = match[1]; // e.g., "rate"
    const metricsStr = match[2]; // e.g., "metricA|metricB"
    const interval = match[3]; // e.g., "5m"
    
    // Split by | and create individual queries
    const metrics = metricsStr.split('|').map(m => m.trim());
    const expanded = metrics.map(m => `${func}(${m}[${interval}])`).join(' + ');
    
    result = result.replace(match[0], expanded);
  }
  
  // Also handle simple {__name__=~"..."} without function wrapper
  const simpleRegex = /\{__name__=~["']([^"']+)["']\}/g;
  result = result.replace(simpleRegex, (_, metricsStr) => {
    const metrics = metricsStr.split('|').map((m: string) => m.trim());
    return metrics.join(' + ');
  });

  // Fix invalid: rate(x[5m]) by (label) -> sum by (label) (rate(x[5m]))
  result = result.replace(/\b(rate|irate|increase)\(\s*([^\)]+?)\s*\)\s*by\s*\(\s*([^\)]+?)\s*\)/g, (_m, fn, inner, labels) => {
    return `sum by (${labels}) (${fn}(${inner}))`;
  });
  
  return result;
};

// Apply fix to all panels in a category
const fixCategoryPromQL = (category: { name: string; panels: any[] }): { name: string; panels: any[] } => {
  return {
    ...category,
    panels: category.panels.map(panel => ({
      ...panel,
      promql: fixPromQL(panel.promql || '')
    }))
  };
};

export const generateDashboardPlan = async (metrics: string, userContext?: string): Promise<DashboardPlan> => {
  const ai = getAIClient();
  
  const contextInstruction = userContext 
    ? `\n\nUSER CONTEXT / REQUIREMENTS: "${userContext}"\nPrioritize panels that align with this context.` 
    : "";

  const systemInstruction = `
    You are a Grafana Solutions Architect.
    Analyze the provided Prometheus metrics.
    Propose a logical dashboard structure with Categories (Rows) and Panels.
    
    ${contextInstruction}

    ## CRITICAL LAYOUT RULES (Grafana uses 24-column grid):

    ### Panel Sizing (MUST follow exactly):
    | Panel Type | Width | Height |
    |------------|-------|--------|
    | stat       | 6     | 4      |
    | gauge      | 6     | 4      |
    | timeseries | 12    | 8      |
    | heatmap    | 12    | 8      |
    | histogram  | 12    | 8      |

    ### Row Layout Rules:
    1. Each row's panels MUST sum to exactly 24 width
    2. All panels in the same row MUST have the same height
    3. Do NOT mix stat (height=4) and timeseries (height=8) in the same row

    ### Valid Row Examples:
    - Overview row: 4 stat panels (6+6+6+6=24, all height=4)
    - Trends row: 2 timeseries panels (12+12=24, all height=8)
    
    For each panel:
    1. Identify the best visualization type (Timeseries for counters/rates, Stat for gauges/current values, Heatmap for histograms, Histogram when buckets should be rendered as bars).
    2. Write a clear Title and Description.
    3. List the specific metric names used.
    4. Provide a "promql_hint" (e.g. "rate(http_requests_total[5m]) by (method)") - NOT the full query yet, just the logic.

    ## CRITICAL - FORBIDDEN PATTERNS (will cause Grafana errors):
    - NEVER use {__name__=~"..."} regex matching! This causes "vector cannot contain metrics with the same labelset" error.
      WRONG: rate({__name__=~"etcd_network.*_total"}[5m])
      WRONG: {__name__=~"metric_a|metric_b"}
      CORRECT: Write each metric explicitly: rate(metric_a[5m]) + rate(metric_b[5m])
    - NEVER use "sum by (__name__)" - causes labelset errors.
    - Stat/Gauge panels MUST aggregate to a single series (sum()/avg()) and filter by target service.
    - Histogram buckets: use *_bucket with rate()/increase and sum by (le).
    - NEVER put multiple comma-separated queries in a single promql_hint.
    
    Do NOT generate the full JSON yet. We are in the planning phase.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze these metrics and propose a dashboard plan:\n\n${metrics}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dashboardTitle: { type: Type.STRING },
          dashboardDescription: { type: Type.STRING },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                panels: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique ID (e.g., panel_1)" },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap, PanelType.Histogram] },
                      description: { type: Type.STRING },
                      metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      promql_hint: { type: Type.STRING }
                    },
                    required: ["id", "title", "type", "description", "metrics", "promql_hint"]
                  }
                }
              },
              required: ["name", "panels"]
            }
          }
        },
        required: ["dashboardTitle", "dashboardDescription", "categories"]
      }
    }
  });

  try {
    return parseJsonFromAI<DashboardPlan>(response.text);
  } catch (e) {
    throw new Error("Failed to parse dashboard plan.");
  }
};

// Helper: Generate a single panel
const generateSinglePanel = async (
  ai: GoogleGenAI, 
  metrics: string, 
  panelPlan: any
): Promise<any> => {
  const retryContext = panelPlan?.__retryContext ? `\n\nPREVIOUS_ERROR: ${panelPlan.__retryContext}` : '';
  const systemInstruction = `
    You are a Senior Grafana Engineer. Generate ONE panel configuration.
    
    Rules:
    1. Use the "promql_hint" as basis. If complete, use directly; if hint, expand to valid PromQL.
    2. PromQL: rate()[5m] for counters, sum by() for aggregations.
    3. For Heatmap: sum by (le) (rate(*_bucket[5m])).
    4. For Histogram: sum by (le) (increase(*_bucket[1h])).
    5. Add appropriate units (bytes, seconds, percent, reqps).
    
    FORBIDDEN (causes errors):
    - NEVER use {__name__=~"..."} - use explicit metric names with + operator instead.
    - Stat/Gauge must aggregate to single series.
    - NEVER use metric name wildcards like metric_*_total. List each metric explicitly.
    - Return only strict JSON that matches the schema. No markdown, no extra keys.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Metrics: ${metrics}\n\nGenerate this panel: ${JSON.stringify(panelPlan)}${retryContext}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap, PanelType.Histogram] },
          description: { type: Type.STRING },
          promql: { type: Type.STRING },
          unit: { type: Type.STRING },
          min: { type: Type.NUMBER, nullable: true },
          max: { type: Type.NUMBER, nullable: true },
          metrics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "type", "promql", "unit", "description", "metrics"]
      }
    }
  });

  const panel = parseJsonFromAI<any>(response.text);
  panel.promql = fixPromQL(typeof panel.promql === 'string' ? panel.promql : '');
  return panel;
};

const generateSinglePanelWithRetry = async (
  ai: GoogleGenAI,
  metrics: string,
  panelPlan: any,
  maxAttempts: number = 5
): Promise<any> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const attemptPlan = {
        ...panelPlan,
        __retryContext: lastError ? String(lastError) : undefined
      };

      const rawPanel = await generateSinglePanel(ai, metrics, attemptPlan);
      const normalized = normalizeGeneratedPanel(rawPanel, panelPlan);
      normalized.promql = fixPromQL(normalized.promql || '');
      return normalized;
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts) {
        const title = typeof panelPlan?.title === 'string' ? panelPlan.title : 'unknown';
        throw new Error(`Failed to generate panel "${title}" after ${maxAttempts} attempts: ${String(err)}`);
      }
      const delay = Math.min(2500, 300 * Math.pow(2, attempt - 1));
      await sleep(delay);
    }
  }

  throw new Error("Unreachable");
};

export const generateFinalDashboard = async (metrics: string, plan: DashboardPlan): Promise<AIResponse> => {
  const ai = getAIClient();
  
  // Flatten all panels with category info
  const panelTasks: { categoryName: string; panelPlan: any }[] = [];
  plan.categories.forEach(cat => {
    cat.panels.forEach(panel => {
      panelTasks.push({ categoryName: cat.name, panelPlan: panel });
    });
  });

  // Parallel generation: one request per panel
  const panelPromises = panelTasks.map(task => 
    generateSinglePanelWithRetry(ai, metrics, task.panelPlan).then(panel => ({
      categoryName: task.categoryName,
      panel
    }))
  );

  const results = await Promise.all(panelPromises);

  // Rebuild category structure
  const categoryMap = new Map<string, any[]>();
  plan.categories.forEach(cat => categoryMap.set(cat.name, []));
  
  results.forEach(({ categoryName, panel }) => {
    categoryMap.get(categoryName)?.push(panel);
  });

  const categories = plan.categories.map(cat => ({
    name: cat.name,
    panels: categoryMap.get(cat.name) || []
  }));

  return {
    dashboardTitle: plan.dashboardTitle,
    dashboardDescription: plan.dashboardDescription,
    categories
  };
};