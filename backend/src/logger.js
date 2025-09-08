// Importing the Winston logging library
const winston = require("winston");

// Importing the context module to retrieve contextual information (e.g., trace IDs)
const { ctx } = require("./context");

// Creating a Winston logger instance
const logger = winston.createLogger({
  // Defining the transport mechanism for logging (Console in this case)
  transports: [new winston.transports.Console()],

  // Defining the log message format
  format: winston.format.printf((info) => {
    // Retrieve the current context store (e.g., trace information)
    const store = ctx.getStore() || {};

    // Return the log message as a JSON string with structured fields
    return JSON.stringify({
      "@timestamp": new Date().toISOString(), // ISO timestamp for the log entry
      level: info.level, // Log level (e.g., info, error, debug)
      message: info.message, // Log message
      "trace.id": store.traceId, // Trace ID from the context store (if available)
      ...info.meta, // Additional metadata passed with the log entry
    });
  }),
});

// Exporting the logger instance for use in other modules
module.exports = logger;