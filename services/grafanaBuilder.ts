import { AIResponse, GrafanaPanel, PanelType } from "../types";

export const buildGrafanaDashboardJson = (aiData: AIResponse) => {
  const panels: GrafanaPanel[] = [];
  let panelIdCounter = 1;
  let currentY = 0;

  aiData.categories.forEach((category) => {
    // Add a Row panel for the category
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

    // Track row flow
    let currentX = 0;
    let maxRowHeight = 0;

    category.panels.forEach((panel) => {
      const isStat = panel.type === PanelType.Stat || panel.type === PanelType.Gauge;
      const width = isStat ? 4 : 12; // Stats are smaller (1/6th), Graphs are half (1/2)
      const height = isStat ? 4 : 8;

      // Check if we need to wrap to a new line
      if (currentX + width > 24) {
        currentY += maxRowHeight;
        currentX = 0;
        maxRowHeight = 0;
      }

      panels.push({
        id: panelIdCounter++,
        gridPos: { h: height, w: width, x: currentX, y: currentY },
        type: panel.type === PanelType.Gauge ? 'stat' : panel.type, // Map 'gauge' to 'stat' or 'gauge' depending on preference, usually 'stat' or 'gauge' viz
        title: panel.title,
        description: panel.description,
        datasource: { type: "prometheus", uid: "${datasource}" },
        targets: [
          {
            expr: panel.promql,
            refId: "A",
            legendFormat: "{{instance}}"
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
           ...(isStat ? {
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

      // Advance X
      currentX += width;
      // Track max height in this current row to know how much to jump when wrapping
      maxRowHeight = Math.max(maxRowHeight, height);
    });
    
    // Advance Y after the category is done (plus the height of the last row)
    currentY += maxRowHeight > 0 ? maxRowHeight : 0;
    // Add a little breathing room
    currentY += 1; 
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