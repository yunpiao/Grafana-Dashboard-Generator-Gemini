export const SAMPLE_METRICS = `# HELP http_requests_total The total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="post",code="200"} 1024
http_requests_total{method="post",code="400"} 3
http_requests_total{method="post",code="500"} 12
http_requests_total{method="get",code="200"} 5043
http_requests_total{method="get",code="400"} 22

# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 1234.56

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 3.2e+07

# HELP jvm_memory_bytes_used Used bytes of a given JVM memory area.
# TYPE jvm_memory_bytes_used gauge
jvm_memory_bytes_used{area="heap"} 2.5e+08
jvm_memory_bytes_used{area="nonheap"} 5.4e+07

# HELP jvm_gc_collection_seconds Time spent in a given GC cause.
# TYPE jvm_gc_collection_seconds summary
jvm_gc_collection_seconds_count{gc="G1 Young Generation"} 12
jvm_gc_collection_seconds_sum{gc="G1 Young Generation"} 0.45
`;
