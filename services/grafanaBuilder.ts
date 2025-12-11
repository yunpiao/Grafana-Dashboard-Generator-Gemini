import { AIResponse, GrafanaPanel, PanelType, GeneratedPanel } from "../types";

export const buildGrafanaDashboardJson = (aiData: AIResponse) => {
  const panels: GrafanaPanel[] = [];
  let panelIdCounter = 1;
  let currentY = 0;

  // Helper to check if panel is a small stat-like panel
  const isStatType = (type: PanelType) => type === PanelType.Stat || type === PanelType.Gauge;

  // Helper to get chart width based on count per row (max 24 width)
  // 1 chart → 24, 2 charts → 12, 3 charts → 8, 4+ charts → 6
  const getChartWidth = (chartCount: number): number => {
    if (chartCount <= 1) return 24;
    if (chartCount === 2) return 12;
    if (chartCount === 3) return 8;
    return 6; // 4+ charts
  };

  // Helper to get dimensions (needs chartCount for dynamic width)
  const getPanelDim = (type: PanelType, chartCount: number = 2) => {
    if (isStatType(type)) {
      return { w: 6, h: 4 }; // Stat: 6x4
    }
    return { w: getChartWidth(chartCount), h: 8 }; // Chart: dynamic width x 8
  };

  // Helper to map internal type to Grafana panel type
  const getGrafanaType = (type: PanelType): string => {
    switch (type) {
      case PanelType.Stat: return 'stat';
      case PanelType.Gauge: return 'gauge';
      case PanelType.Timeseries: return 'timeseries';
      case PanelType.Heatmap: return 'heatmap';
      case PanelType.Histogram: return 'barchart'; // Prometheus buckets render best as BarChart
      case PanelType.Logs: return 'logs';
      default: return 'timeseries';
    }
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

    // Count chart-type panels for dynamic width calculation
    const chartPanels = sortedPanels.filter(p => !isStatType(p.type));
    const chartCount = chartPanels.length;

    // 3. Layout Logic
    let currentX = 0;
    let currentRowHeight = 0;

    sortedPanels.forEach((panel) => {
      const { w, h } = getPanelDim(panel.type, chartCount);

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
        type: getGrafanaType(panel.type),
        title: panel.title,
        description: panel.description,
        datasource: { type: "prometheus", uid: "${datasource}" },
        targets: [
          {
            expr: panel.promql,
            refId: "A",
            legendFormat: panel.type === PanelType.Histogram ? "{{le}}" : "{{instance}}",
            instant: panel.type === PanelType.Histogram,
            format: panel.type === PanelType.Histogram ? "heatmap" : "time_series"
          }
        ],
        // Add transformations for Histogram to convert cumulative buckets to individual counts
        ...(panel.type === PanelType.Histogram ? {
          transformations: [
            {
              id: "histogram",
              options: {
                bucketCount: 30,
                bucketSize: "",
                combine: false
              }
            }
          ]
        } : {}),
        fieldConfig: {
          defaults: {
            unit: panel.unit || "short",
            min: panel.min,
            max: panel.max,
            // Value mappings for bool unit (0 → False, 1 → True)
            ...(panel.unit === 'bool' ? {
              mappings: [
                { type: "value", options: { "0": { text: "False", color: "red" } } },
                { type: "value", options: { "1": { text: "True", color: "green" } } }
              ]
            } : {}),
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
           } : {}),
           // Specific options for Heatmap
           ...(panel.type === PanelType.Heatmap ? {
             calculate: false,
             cellGap: 1,
             color: {
               mode: "scheme",
               scheme: "Oranges",
               steps: 64
             },
             yAxis: {
               axisPlacement: "left"
             }
           } : {}),
           // Specific options for Histogram (BarChart)
           ...(panel.type === PanelType.Histogram ? {
             orientation: "auto",
             showValue: "never",
             groupWidth: 0.8,
             barWidth: 0.97,
             legend: { showLegend: false }, // Too many buckets usually
             xTickLabelRotation: 0,
             stacking: "normal" // Normal stacking for bars
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