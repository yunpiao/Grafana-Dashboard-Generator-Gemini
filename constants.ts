// Node Exporter sample metrics for quick demo
export const SAMPLE_METRICS = `# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.
# TYPE node_cpu_seconds_total counter
node_cpu_seconds_total{cpu="0",mode="idle"} 78245.67
node_cpu_seconds_total{cpu="0",mode="iowait"} 512.34
node_cpu_seconds_total{cpu="0",mode="system"} 3456.78
node_cpu_seconds_total{cpu="0",mode="user"} 12345.67
node_cpu_seconds_total{cpu="1",mode="idle"} 77890.12
node_cpu_seconds_total{cpu="1",mode="iowait"} 498.76
node_cpu_seconds_total{cpu="1",mode="system"} 3234.56
node_cpu_seconds_total{cpu="1",mode="user"} 11987.34

# HELP node_memory_MemTotal_bytes Memory information field MemTotal_bytes.
# TYPE node_memory_MemTotal_bytes gauge
node_memory_MemTotal_bytes 1.6777216e+10
# HELP node_memory_MemAvailable_bytes Memory information field MemAvailable_bytes.
# TYPE node_memory_MemAvailable_bytes gauge
node_memory_MemAvailable_bytes 8.589934592e+09
# HELP node_memory_MemFree_bytes Memory information field MemFree_bytes.
# TYPE node_memory_MemFree_bytes gauge
node_memory_MemFree_bytes 2.147483648e+09
# HELP node_memory_Buffers_bytes Memory information field Buffers_bytes.
# TYPE node_memory_Buffers_bytes gauge
node_memory_Buffers_bytes 5.36870912e+08
# HELP node_memory_Cached_bytes Memory information field Cached_bytes.
# TYPE node_memory_Cached_bytes gauge
node_memory_Cached_bytes 5.36870912e+09

# HELP node_filesystem_size_bytes Filesystem size in bytes.
# TYPE node_filesystem_size_bytes gauge
node_filesystem_size_bytes{device="/dev/sda1",fstype="ext4",mountpoint="/"} 1.073741824e+11
node_filesystem_size_bytes{device="/dev/sdb1",fstype="ext4",mountpoint="/data"} 5.36870912e+11
# HELP node_filesystem_avail_bytes Filesystem space available to non-root users in bytes.
# TYPE node_filesystem_avail_bytes gauge
node_filesystem_avail_bytes{device="/dev/sda1",fstype="ext4",mountpoint="/"} 5.36870912e+10
node_filesystem_avail_bytes{device="/dev/sdb1",fstype="ext4",mountpoint="/data"} 4.294967296e+11

# HELP node_disk_read_bytes_total The total number of bytes read successfully.
# TYPE node_disk_read_bytes_total counter
node_disk_read_bytes_total{device="sda"} 1.073741824e+10
node_disk_read_bytes_total{device="sdb"} 5.36870912e+09
# HELP node_disk_written_bytes_total The total number of bytes written successfully.
# TYPE node_disk_written_bytes_total counter
node_disk_written_bytes_total{device="sda"} 2.147483648e+10
node_disk_written_bytes_total{device="sdb"} 1.073741824e+10
# HELP node_disk_io_time_seconds_total Total seconds spent doing I/Os.
# TYPE node_disk_io_time_seconds_total counter
node_disk_io_time_seconds_total{device="sda"} 12345.67
node_disk_io_time_seconds_total{device="sdb"} 6789.01

# HELP node_network_receive_bytes_total Network device statistic receive_bytes.
# TYPE node_network_receive_bytes_total counter
node_network_receive_bytes_total{device="eth0"} 1.073741824e+11
node_network_receive_bytes_total{device="lo"} 1.073741824e+08
# HELP node_network_transmit_bytes_total Network device statistic transmit_bytes.
# TYPE node_network_transmit_bytes_total counter
node_network_transmit_bytes_total{device="eth0"} 5.36870912e+10
node_network_transmit_bytes_total{device="lo"} 1.073741824e+08

# HELP node_load1 1m load average.
# TYPE node_load1 gauge
node_load1 1.25
# HELP node_load5 5m load average.
# TYPE node_load5 gauge
node_load5 0.89
# HELP node_load15 15m load average.
# TYPE node_load15 gauge
node_load15 0.67

# HELP node_boot_time_seconds Node boot time, in unixtime.
# TYPE node_boot_time_seconds gauge
node_boot_time_seconds 1.702300000e+09

# HELP node_time_seconds System time in seconds since epoch (1970).
# TYPE node_time_seconds gauge
node_time_seconds 1.733980000e+09

# HELP node_uname_info Labeled system information as provided by the uname system call.
# TYPE node_uname_info gauge
node_uname_info{domainname="(none)",machine="x86_64",nodename="node-1",release="5.15.0-generic",sysname="Linux",version="#1 SMP"} 1

# HELP node_filefd_allocated File descriptor statistics: allocated.
# TYPE node_filefd_allocated gauge
node_filefd_allocated 4096
# HELP node_filefd_maximum File descriptor statistics: maximum.
# TYPE node_filefd_maximum gauge
node_filefd_maximum 1048576

# HELP node_scrape_collector_duration_seconds Duration of a collector scrape.
# TYPE node_scrape_collector_duration_seconds gauge
node_scrape_collector_duration_seconds{collector="cpu"} 0.012
node_scrape_collector_duration_seconds{collector="meminfo"} 0.003
node_scrape_collector_duration_seconds{collector="diskstats"} 0.008
node_scrape_collector_duration_seconds{collector="filesystem"} 0.015
node_scrape_collector_duration_seconds{collector="netdev"} 0.005
`;
