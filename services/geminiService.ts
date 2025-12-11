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
  return text.replace(/```json\n?|```/g, '').trim();
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

    ### Known failure cases to avoid:
    - Stat/Gauge panels MUST aggregate to a single series (e.g., sum()/avg()) and should filter by target service (e.g., job="etcd") to avoid multiple instances showing.
    - Histogram buckets: use *_bucket with rate()/increase and sum by (le); do not return cumulative bucket series directly.
    
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
    return JSON.parse(cleanResponse(response.text)) as DashboardPlan;
  } catch (e) {
    throw new Error("Failed to parse dashboard plan.");
  }
};

export const generateFinalDashboard = async (metrics: string, plan: DashboardPlan): Promise<AIResponse> => {
  const ai = getAIClient();
  
  const systemInstruction = `
    You are a Senior Grafana Engineer.
    I will provide raw metrics and a STRICT DASHBOARD PLAN with user-edited PromQL hints.
    
    Your job is to generate the FINAL Grafana Dashboard JSON for the panels listed in the plan.
    
    Rules:
    1. **Strict Adherence**: Only generate panels defined in the plan. Keep the same titles and types.
    2. **Use User PromQL**: Each panel has a "promql_hint" field - this is the user's intended query.
       - If promql_hint looks complete (e.g., "rate(http_requests_total[5m])"), use it directly as promql.
       - If promql_hint is just a hint (e.g., "rate by method"), expand it to valid PromQL.
       - Always ensure the final promql is syntactically valid.
    3. **PromQL Best Practices**:
       - Use rate()[5m] for counters.
       - Use sum by() for aggregations.
       - For Heatmap panels: use sum by (le) (rate(*_bucket[5m])) for time-series distribution.
       - For Histogram (bar chart) panels: use sum by (le) (increase(*_bucket[1h])) for bucket distribution snapshot.
       - For percentiles: use histogram_quantile(0.99, sum by (le) (rate(*_bucket[5m]))).
    4. **Units**: Add appropriate units (bytes, seconds, percent, reqps) based on metric names.
    5. **Structure**: Return the exact JSON format requested.
    6. **Known failure cases to avoid**:
       - Stat/Gauge panels must aggregate to a single series (e.g., sum()/avg()) and filter to the target service (e.g., job="etcd") to avoid multiple instance values.
       - Histogram buckets must use rate()/increase over *_bucket with sum by (le); do not return raw cumulative buckets.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      Raw Metrics:
      ${metrics}

      Approved Plan (Implement ONLY these):
      ${JSON.stringify(plan)}
    `,
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
              },
              required: ["name", "panels"]
            }
          }
        },
        required: ["dashboardTitle", "categories", "dashboardDescription"]
      }
    }
  });

  try {
    return JSON.parse(cleanResponse(response.text)) as AIResponse;
  } catch (e) {
    throw new Error("Failed to generate final dashboard JSON.");
  }
};