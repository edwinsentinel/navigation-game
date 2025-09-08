// Importing required modules
const express = require("express"); // Express framework for building web applications
const logger = require("./logger"); // Custom logger module for logging events
const traceMw = require("./trace-mw"); // Middleware for tracing requests

// Initializing the Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware for tracing requests
app.use(traceMw);

// Root route to verify the backend is running
app.get("/", (_req, res) => {
  // Respond with a plain text message
  res.type("text/plain").send("Backend running. Try /api/session/start");
});

// Function to generate a random goal location near a given latitude and longitude
function randomGoalNear(lat, lon, min = 300, max = 800) {
  // Calculate a random distance within the range (min to max) in kilometers
  const d = (min + Math.random() * (max - min)) / 1000;

  // Generate a random bearing (direction in radians)
  const bearing = Math.random() * 2 * Math.PI;

  // Earth's radius in kilometers
  const R = 6371;

  // Convert latitude and longitude to radians
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  // Calculate the new latitude using the haversine formula
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(bearing)
  );

  // Calculate the new longitude using the haversine formula
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  // Return the new latitude and longitude, converting back to degrees
  return {
    lat: (lat2 * 180) / Math.PI,
    lon: ((lon2 * 180) / Math.PI + 540) % 360 - 180, // Normalize longitude to -180 to 180
  };
}

// Route to start a session
app.get("/api/session/start", (req, res) => {
  // Define the starting location (hardcoded coordinates for Dubai)
  const start = { lat: 25.276987, lon: 55.296249 };

  // Generate a random goal location near the starting point
  const goal = randomGoalNear(start.lat, start.lon);

  // Create a session object with the start and goal locations
  const session = { start, goal: { ...goal, radius: 25 } };

  // Log the session start event
  logger.info("session_started", { meta: { session } });

  // Respond with the session object as JSON
  res.json(session);
});

// Route to log events
app.post("/api/events", (req, res) => {
  // Log the incoming event data from the request body
  logger.info("event", { meta: req.body });

  // Respond with HTTP status 202 (Accepted)
  res.sendStatus(202);
});

// Start the server and listen on port 3000
app.listen(3000, () => console.log("Backend running on 3000"));