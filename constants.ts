// Go Prometheus HTTP sample - minimal set covering all panel types
export const SAMPLE_METRICS = `# HELP http_requests_total Total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 15234
http_requests_total{method="GET",status="500"} 23
http_requests_total{method="POST",status="201"} 892

# HELP http_request_duration_seconds HTTP request latency in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.01"} 5600
http_request_duration_seconds_bucket{le="0.05"} 13800
http_request_duration_seconds_bucket{le="0.1"} 14900
http_request_duration_seconds_bucket{le="0.5"} 15200
http_request_duration_seconds_bucket{le="1"} 15234
http_request_duration_seconds_bucket{le="+Inf"} 15234
http_request_duration_seconds_sum 312.45
http_request_duration_seconds_count 15234

# HELP http_requests_in_flight Current number of HTTP requests being processed.
# TYPE http_requests_in_flight gauge
http_requests_in_flight 12

# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 42

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 5.6789012e+07
`;
