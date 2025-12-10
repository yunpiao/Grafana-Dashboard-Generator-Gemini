import { ParsedMetric } from "../types";

export const parseMetricsLocal = (input: string): ParsedMetric[] => {
  const lines = input.split('\n');
  const metricMap = new Map<string, ParsedMetric>();

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith('# HELP')) {
      // # HELP name desc...
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        const name = parts[2];
        const help = parts.slice(3).join(' ');
        if (!metricMap.has(name)) {
            // Defer type inference until we see the value or just default to unknown for now
            metricMap.set(name, { name, type: 'unknown', help, labels: [] });
        } else {
            metricMap.get(name)!.help = help;
        }
      }
    } else if (line.startsWith('# TYPE')) {
       // # TYPE name type
       const parts = line.split(/\s+/);
       if (parts.length >= 4) {
         const name = parts[2];
         const type = parts[3];
         if (!metricMap.has(name)) {
            metricMap.set(name, { name, type, help: '', labels: [] });
         } else {
            metricMap.get(name)!.type = type;
         }
       }
    } else if (!line.startsWith('#')) {
      // metric_name{label="val"} 123
      const match = line.match(/^([a-zA-Z0-9_:]+)(?:\{([^}]+)\})?\s+(.+)$/);
      if (match) {
        const name = match[1];
        const labelStr = match[2];
        
        if (!metricMap.has(name)) {
            // Automatic Type Inference based on naming conventions
            let inferredType = 'unknown';
            if (name.endsWith('_total')) inferredType = 'counter';
            else if (name.endsWith('_bucket')) inferredType = 'histogram';
            else if (name.endsWith('_sum')) inferredType = 'histogram';
            else if (name.endsWith('_count')) inferredType = 'histogram';
            else if (name.endsWith('_info')) inferredType = 'gauge';
            else if (name.endsWith('_seconds')) inferredType = 'summary'; // loose heuristic

            metricMap.set(name, { name, type: inferredType, help: '', labels: [] });
        }
        
        const entry = metricMap.get(name)!;
        
        // If type is still unknown, try to infer it now
        if (entry.type === 'unknown') {
            if (name.endsWith('_total')) entry.type = 'counter';
            else if (name.endsWith('_bucket') || name.endsWith('_sum') || name.endsWith('_count')) entry.type = 'histogram';
            else if (name.endsWith('_info')) entry.type = 'gauge';
        }

        if (labelStr) {
           // Parse labels roughly: key="val", key2="val"
           // Simple regex split to get keys
           const labelMatches = labelStr.matchAll(/([a-zA-Z0-9_]+)=/g);
           for (const m of labelMatches) {
               if (!entry.labels.includes(m[1])) {
                   entry.labels.push(m[1]);
               }
           }
        }
      }
    }
  });

  return Array.from(metricMap.values());
};