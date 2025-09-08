// Importing the traceHeaders object, which contains headers for distributed tracing
import { traceHeaders } from "./trace";

// Function to start a session by making a GET request to the backend
export async function startSession() {
  // Send a GET request to the "/api/session/start" endpoint with trace headers
  const res = await fetch("/api/session/start", { headers: traceHeaders });

  // Check if the response is not OK (e.g., status code is not 2xx)
  if (!res.ok) throw new Error("Failed to start session");

  // Parse and return the JSON response from the server
  return res.json();
}

// Function to send an event to the backend by making a POST request
export async function sendEvent(evt) {
  // Send a POST request to the "/api/events" endpoint
  return fetch("/api/events", {
    method: "POST", // HTTP method for sending data
    headers: { 
      "Content-Type": "application/json", // Specify that the request body is JSON
      ...traceHeaders, // Include trace headers for distributed tracing
    },
    body: JSON.stringify(evt), // Convert the event object to a JSON string
  });
}