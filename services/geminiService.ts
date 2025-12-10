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

export const generateDashboardPlan = async (metrics: string): Promise<DashboardPlan> => {
  const ai = getAIClient();
  
  const systemInstruction = `
    You are a Grafana Solutions Architect.
    Analyze the provided Prometheus metrics.
    Propose a logical dashboard structure with Categories (Rows) and Panels.
    
    For each panel:
    1. Identify the best visualization type (Timeseries for counters/rates, Stat for gauges/current values, Heatmap for histograms).
    2. Write a clear Title and Description.
    3. List the specific metric names used.
    4. Provide a "promql_hint" (e.g. "rate(http_requests_total[5m]) by (method)") - NOT the full query yet, just the logic.
    
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
                      type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap] },
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
    I will provide raw metrics and a STRICT DASHBOARD PLAN.
    
    Your job is to generate the FINAL Grafana Dashboard JSON for the panels listed in the plan.
    
    Rules:
    1. **Strict Adherence**: Only generate panels defined in the plan.
    2. **PromQL Mastery**: Write valid, production-ready PromQL.
       - Use rate()[5m] for counters.
       - Use sum by() appropriately.
       - Handle nulls if needed.
    3. **Refinement**: Add units (bytes, seconds, percent) based on metric names.
    4. **Structure**: Return the specific JSON format requested.
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
                      type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap] },
                      description: { type: Type.STRING },
                      promql: { type: Type.STRING },
                      unit: { type: Type.STRING },
                      min: { type: Type.NUMBER, nullable: true },
                      max: { type: Type.NUMBER, nullable: true },
                    },
                    required: ["title", "type", "promql", "unit", "description"]
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