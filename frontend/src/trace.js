// Generate a unique trace ID (32 characters) for distributed tracing
const traceId = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

// Generate a unique span ID (16 characters) for the current operation
const spanId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

// Export an object containing the traceparent header for distributed tracing
export const traceHeaders = {
  // The traceparent header follows the W3C Trace Context specification
  // Format: version-traceId-spanId-flags
  traceparent: `00-${traceId}-${spanId}-01`,
};