import { DashboardPlan, AIResponse, PanelType } from './types';

// Real etcd metrics sample - a cohesive set from a single service
export const SAMPLE_METRICS = `# HELP etcd_server_has_leader Whether or not a leader exists. 1 is existence, 0 is not.
# TYPE etcd_server_has_leader gauge
etcd_server_has_leader 1
# HELP etcd_server_is_leader Whether or not this member is a leader. 1 if is, 0 otherwise.
# TYPE etcd_server_is_leader gauge
etcd_server_is_leader 1
# HELP etcd_server_leader_changes_seen_total The number of leader changes seen.
# TYPE etcd_server_leader_changes_seen_total counter
etcd_server_leader_changes_seen_total 1
# HELP etcd_server_proposals_applied_total The total number of consensus proposals applied.
# TYPE etcd_server_proposals_applied_total gauge
etcd_server_proposals_applied_total 112
# HELP etcd_server_proposals_pending The current number of pending proposals to commit.
# TYPE etcd_server_proposals_pending gauge
etcd_server_proposals_pending 0

# HELP etcd_mvcc_db_total_size_in_bytes Total size of the underlying database physically allocated in bytes.
# TYPE etcd_mvcc_db_total_size_in_bytes gauge
etcd_mvcc_db_total_size_in_bytes 20480
# HELP etcd_debugging_mvcc_keys_total Total number of keys.
# TYPE etcd_debugging_mvcc_keys_total gauge
etcd_debugging_mvcc_keys_total 0
# HELP etcd_mvcc_range_total Total number of ranges seen by this member.
# TYPE etcd_mvcc_range_total counter
etcd_mvcc_range_total 108
# HELP etcd_mvcc_put_total Total number of puts seen by this member.
# TYPE etcd_mvcc_put_total counter
etcd_mvcc_put_total 0

# HELP grpc_server_started_total Total number of RPCs started on the server.
# TYPE grpc_server_started_total counter
grpc_server_started_total{grpc_method="Range",grpc_service="etcdserverpb.KV",grpc_type="unary"} 106
grpc_server_started_total{grpc_method="Alarm",grpc_service="etcdserverpb.Maintenance",grpc_type="unary"} 106
grpc_server_started_total{grpc_method="Put",grpc_service="etcdserverpb.KV",grpc_type="unary"} 0
grpc_server_started_total{grpc_method="Watch",grpc_service="etcdserverpb.Watch",grpc_type="bidi_stream"} 0
# HELP etcd_network_client_grpc_received_bytes_total The total number of bytes received from grpc clients.
# TYPE etcd_network_client_grpc_received_bytes_total counter
etcd_network_client_grpc_received_bytes_total 864
# HELP etcd_network_client_grpc_sent_bytes_total The total number of bytes sent to grpc clients.
# TYPE etcd_network_client_grpc_sent_bytes_total counter
etcd_network_client_grpc_sent_bytes_total 5832

# HELP etcd_disk_wal_fsync_duration_seconds The latency distributions of fsync called by WAL.
# TYPE etcd_disk_wal_fsync_duration_seconds histogram
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.001"} 0
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.002"} 1
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.004"} 100
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.008"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.016"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.032"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.064"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.128"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.256"} 113
etcd_disk_wal_fsync_duration_seconds_bucket{le="0.512"} 114
etcd_disk_wal_fsync_duration_seconds_bucket{le="+Inf"} 114
etcd_disk_wal_fsync_duration_seconds_sum 0.705
etcd_disk_wal_fsync_duration_seconds_count 114
# HELP etcd_disk_backend_commit_duration_seconds The latency distributions of commit called by backend.
# TYPE etcd_disk_backend_commit_duration_seconds histogram
etcd_disk_backend_commit_duration_seconds_bucket{le="0.001"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.002"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.004"} 0
etcd_disk_backend_commit_duration_seconds_bucket{le="0.008"} 5
etcd_disk_backend_commit_duration_seconds_bucket{le="0.016"} 6
etcd_disk_backend_commit_duration_seconds_bucket{le="0.032"} 6
etcd_disk_backend_commit_duration_seconds_bucket{le="+Inf"} 6
etcd_disk_backend_commit_duration_seconds_sum 0.043
etcd_disk_backend_commit_duration_seconds_count 6

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 3.930112e+07
# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 3.43
# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 19
`;

// Check if input is sample data (compare trimmed content)
export const isSampleData = (input: string): boolean => {
  return input.trim() === SAMPLE_METRICS.trim();
};

// Sample Dashboard Plan (for quick UI validation) - etcd themed
export const SAMPLE_DASHBOARD_PLAN: DashboardPlan = {
  dashboardTitle: "etcd Cluster Dashboard",
  dashboardDescription: "Auto-generated dashboard for etcd cluster monitoring",
  categories: [
    {
      name: "Cluster Health",
      panels: [
        { id: "1", title: "Has Leader", type: PanelType.Stat, description: "Whether a leader exists (1=yes)", metrics: ["etcd_server_has_leader"], promql_hint: "etcd_server_has_leader" },
        { id: "2", title: "Is Leader", type: PanelType.Stat, description: "Whether this node is leader", metrics: ["etcd_server_is_leader"], promql_hint: "etcd_server_is_leader" },
        { id: "3", title: "Leader Changes", type: PanelType.Stat, description: "Total leader elections", metrics: ["etcd_server_leader_changes_seen_total"], promql_hint: "etcd_server_leader_changes_seen_total" },
        { id: "4", title: "Pending Proposals", type: PanelType.Gauge, description: "Proposals waiting to commit", metrics: ["etcd_server_proposals_pending"], promql_hint: "etcd_server_proposals_pending" },
      ]
    },
    {
      name: "gRPC Traffic",
      panels: [
        { id: "5", title: "gRPC Request Rate", type: PanelType.Timeseries, description: "gRPC requests per second by method", metrics: ["grpc_server_started_total"], promql_hint: "rate(grpc_server_started_total[5m]) by (grpc_method)" },
        { id: "6", title: "Network Bytes", type: PanelType.Timeseries, description: "gRPC bytes sent/received", metrics: ["etcd_network_client_grpc_received_bytes_total", "etcd_network_client_grpc_sent_bytes_total"], promql_hint: "rate(etcd_network_client_grpc_*_bytes_total[5m])" },
      ]
    },
    {
      name: "Disk I/O",
      panels: [
        { id: "7", title: "WAL Fsync Latency Heatmap", type: PanelType.Heatmap, description: "WAL fsync duration distribution over time", metrics: ["etcd_disk_wal_fsync_duration_seconds_bucket"], promql_hint: "sum(rate(etcd_disk_wal_fsync_duration_seconds_bucket[5m])) by (le)" },
        { id: "8", title: "WAL Fsync P99", type: PanelType.Timeseries, description: "99th percentile WAL fsync latency", metrics: ["etcd_disk_wal_fsync_duration_seconds_bucket"], promql_hint: "histogram_quantile(0.99, ...)" },
        { id: "9", title: "Backend Commit Histogram", type: PanelType.Histogram, description: "Backend commit duration distribution", metrics: ["etcd_disk_backend_commit_duration_seconds_bucket"], promql_hint: "sum by (le) (etcd_disk_backend_commit_duration_seconds_bucket)" },
      ]
    },
    {
      name: "Resources",
      panels: [
        { id: "10", title: "DB Size", type: PanelType.Stat, description: "Total database size", metrics: ["etcd_mvcc_db_total_size_in_bytes"], promql_hint: "etcd_mvcc_db_total_size_in_bytes" },
        { id: "11", title: "Memory Usage", type: PanelType.Gauge, description: "Resident memory", metrics: ["process_resident_memory_bytes"], promql_hint: "process_resident_memory_bytes" },
        { id: "12", title: "Open FDs", type: PanelType.Stat, description: "Open file descriptors", metrics: ["process_open_fds"], promql_hint: "process_open_fds" },
        { id: "13", title: "CPU Rate", type: PanelType.Stat, description: "CPU usage rate", metrics: ["process_cpu_seconds_total"], promql_hint: "rate(process_cpu_seconds_total[5m])" },
      ]
    }
  ]
};

// Sample Dashboard Result (for quick UI validation) - etcd themed
export const SAMPLE_DASHBOARD_RESULT: AIResponse = {
  dashboardTitle: "etcd Cluster Dashboard",
  dashboardDescription: "Auto-generated dashboard for etcd cluster monitoring",
  categories: [
    {
      name: "Cluster Health",
      panels: [
        { title: "Has Leader", type: PanelType.Stat, description: "Whether a leader exists (1=yes)", promql: "etcd_server_has_leader", unit: "bool", metrics: ["etcd_server_has_leader"] },
        { title: "Is Leader", type: PanelType.Stat, description: "Whether this node is leader", promql: "etcd_server_is_leader", unit: "bool", metrics: ["etcd_server_is_leader"] },
        { title: "Leader Changes", type: PanelType.Stat, description: "Total leader elections seen", promql: "etcd_server_leader_changes_seen_total", unit: "short", metrics: ["etcd_server_leader_changes_seen_total"] },
        { title: "Pending Proposals", type: PanelType.Gauge, description: "Current proposals waiting to commit", promql: "etcd_server_proposals_pending", unit: "short", metrics: ["etcd_server_proposals_pending"] },
      ]
    },
    {
      name: "gRPC Traffic",
      panels: [
        { title: "gRPC Request Rate", type: PanelType.Timeseries, description: "gRPC requests per second by method", promql: "sum by(grpc_method) (rate(grpc_server_started_total[5m]))", unit: "reqps", metrics: ["grpc_server_started_total"] },
        { title: "Network Bytes", type: PanelType.Timeseries, description: "gRPC bytes sent and received per second", promql: "rate(etcd_network_client_grpc_received_bytes_total[5m]) or rate(etcd_network_client_grpc_sent_bytes_total[5m])", unit: "Bps", metrics: ["etcd_network_client_grpc_received_bytes_total", "etcd_network_client_grpc_sent_bytes_total"] },
      ]
    },
    {
      name: "Disk I/O",
      panels: [
        { title: "WAL Fsync Latency Heatmap", type: PanelType.Heatmap, description: "WAL fsync duration distribution over time", promql: "sum(rate(etcd_disk_wal_fsync_duration_seconds_bucket[5m])) by (le)", unit: "s", metrics: ["etcd_disk_wal_fsync_duration_seconds_bucket"] },
        { title: "WAL Fsync P99", type: PanelType.Timeseries, description: "99th percentile WAL fsync latency", promql: "histogram_quantile(0.99, sum(rate(etcd_disk_wal_fsync_duration_seconds_bucket[5m])) by (le))", unit: "s", metrics: ["etcd_disk_wal_fsync_duration_seconds_bucket"] },
        { title: "Backend Commit Histogram", type: PanelType.Histogram, description: "Backend commit duration distribution", promql: "sum by (le) (etcd_disk_backend_commit_duration_seconds_bucket)", unit: "s", metrics: ["etcd_disk_backend_commit_duration_seconds_bucket"] },
      ]
    },
    {
      name: "Resources",
      panels: [
        { title: "DB Size", type: PanelType.Stat, description: "Total etcd database size", promql: "etcd_mvcc_db_total_size_in_bytes", unit: "bytes", metrics: ["etcd_mvcc_db_total_size_in_bytes"] },
        { title: "Memory Usage", type: PanelType.Gauge, description: "Resident memory usage", promql: "process_resident_memory_bytes", unit: "bytes", metrics: ["process_resident_memory_bytes"] },
        { title: "Open FDs", type: PanelType.Stat, description: "Open file descriptors", promql: "process_open_fds", unit: "short", metrics: ["process_open_fds"] },
        { title: "CPU Rate", type: PanelType.Stat, description: "CPU usage rate", promql: "rate(process_cpu_seconds_total[5m])", unit: "short", metrics: ["process_cpu_seconds_total"] },
      ]
    }
  ]
};
