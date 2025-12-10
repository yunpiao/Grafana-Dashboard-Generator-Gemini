import { AIResponse, GrafanaPanel, PanelType, GeneratedPanel } from "../types";

export const buildGrafanaDashboardJson = (aiData: AIResponse) => {
  const panels: GrafanaPanel[] = [];
  let panelIdCounter = 1;
  let currentY = 0;

  // Helper to get dimensions
  const getPanelDim = (type: PanelType) => {
    const isStat = type === PanelType.Stat || type === PanelType.Gauge;
    // Stat: 6x4, Chart: 12x8
    return { w: isStat ? 6 : 12, h: isStat ? 4 : 8 };
  };

  // Helper to prioritize panels for sorting (Stats first to group by height)
  const getPanelPriority = (type: PanelType) => {
    if (type === PanelType.Stat || type === PanelType.Gauge) return 1;
    return 2;
  };

  aiData.categories.forEach((category) => {
    // 1. Add Category Row
    panels.push({
      id: panelIdCounter++,
      gridPos: { h: 1, w: 24, x: 0, y: currentY },
      type: "row",
      title: category.name,
      datasource: { type: "prometheus", uid: "${datasource}" },
      targets: [],
      fieldConfig: { defaults: { unit: "short" } },
      collapsed: false,
      panels: []
    });
    currentY += 1;

    // 2. Sort panels to group by height (Stats first, then Charts)
    // This helps satisfy the "same height per row" rule naturally
    const sortedPanels = [...category.panels].sort((a, b) => {
      return getPanelPriority(a.type) - getPanelPriority(b.type);
    });

    // 3. Layout Logic
    let currentX = 0;
    let currentRowHeight = 0;

    sortedPanels.forEach((panel) => {
      const { w, h } = getPanelDim(panel.type);

      // Check for Line Break conditions:
      // 1. Width overflow
      // 2. Height mismatch with current row (must start new row)
      const widthOverflow = currentX + w > 24;
      const heightMismatch = currentRowHeight > 0 && currentRowHeight !== h;

      if (widthOverflow || heightMismatch) {
        currentY += currentRowHeight; // Move Y down by the height of the finished row
        currentX = 0;                // Reset X
        currentRowHeight = 0;        // Reset Row Height
      }

      // Add Panel
      panels.push({
        id: panelIdCounter++,
        gridPos: { h, w, x: currentX, y: currentY },
        type: panel.type === PanelType.Gauge ? 'gauge' : (panel.type === PanelType.Stat ? 'stat' : panel.type),
        title: panel.title,
        description: panel.description,
        datasource: { type: "prometheus", uid: "${datasource}" },
        targets: [
          {
            expr: panel.promql,
            refId: "A",
            legendFormat: "{{instance}}" // Simple default, AI can improve this in prompt later
          }
        ],
        fieldConfig: {
          defaults: {
            unit: panel.unit || "short",
            min: panel.min,
            max: panel.max,
            color: {
               mode: "palette-classic"
            },
            custom: {
                axisCenteredZero: false,
                axisColorMode: "text",
                axisLabel: "",
                axisPlacement: "auto",
                barAlignment: 0,
                drawStyle: "line",
                fillOpacity: 10,
                gradientMode: "none",
                hideFrom: {
                    legend: false,
                    tooltip: false,
                    viz: false
                },
                lineInterpolation: "linear",
                lineWidth: 1,
                pointSize: 5,
                scaleDistribution: {
                    type: "linear"
                },
                showPoints: "auto",
                spanNulls: false,
                stacking: {
                    group: "A",
                    mode: "none"
                },
                thresholdsStyle: {
                    mode: "off"
                }
            }
          }
        },
        options: {
           legend: {
               calcs: [],
               displayMode: "list",
               placement: "bottom",
               showLegend: true
           },
           tooltip: {
               mode: "single",
               sort: "none"
           },
           // Specific options for Stat/Gauge panels
           ...((panel.type === PanelType.Stat || panel.type === PanelType.Gauge) ? {
             reduceOptions: {
               values: false,
               calcs: ["lastNotNull"],
               fields: ""
             },
             orientation: "auto",
             textMode: "auto",
             colorMode: "value",
             graphMode: "area",
             justifyMode: "auto"
           } : {})
        }
      });

      // Update Cursors
      currentX += w;
      currentRowHeight = h; // Set current row height (should be consistent due to sorting/checks)
    });

    // Move Y past the last row of this category
    if (currentRowHeight > 0) {
      currentY += currentRowHeight;
    }
  });

  return {
    annotations: { list: [] },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    links: [],
    liveNow: false,
    panels: panels,
    refresh: "",
    schemaVersion: 38,
    style: "dark",
    tags: ["generated-by-ai", "prometheus"],
    templating: { 
        list: [
            {
                current: {
                    selected: false,
                    text: "default",
                    value: "default"
                },
                hide: 0,
                includeAll: false,
                label: "Datasource",
                multi: false,
                name: "datasource",
                options: [],
                query: "prometheus",
                refresh: 1,
                regex: "",
                skipUrlSync: false,
                type: "datasource"
            }
        ] 
    },
    time: { from: "now-6h", to: "now" },
    timepicker: {},
    timezone: "",
    title: aiData.dashboardTitle,
    uid: "generated-" + Date.now(),
    version: 1,
    weekStart: ""
  };
};