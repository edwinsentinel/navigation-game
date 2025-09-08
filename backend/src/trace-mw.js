// Importing the context module to manage contextual data (e.g., trace IDs)
const { ctx } = require("./context");

// Importing the crypto module to generate random trace IDs if none are provided
const crypto = require("crypto");

// Exporting the trace middleware function
module.exports = function traceMiddleware(req, res, next) {
  // Extract the "traceparent" header from the incoming request
  const tp = req.header("traceparent");

  // If the "traceparent" header exists, extract the trace ID from it
  // Otherwise, generate a random 16-byte trace ID
  const traceId = tp ? tp.split("-")[1] : crypto.randomBytes(16).toString("hex");

  // Run the next middleware or route handler within a context that includes the trace ID
  ctx.run({ traceId }, () => next());
};