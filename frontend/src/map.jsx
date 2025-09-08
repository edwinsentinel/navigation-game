// Importing React and its hooks for managing state and side effects
import React, { useEffect, useState } from "react";

// Importing Leaflet, a library for interactive maps
import L from "leaflet";

// Importing the sendEvent function to log events to the backend
import { sendEvent } from "./api";

// Function to calculate the haversine distance (great-circle distance) between two points
function haversine(a, b) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (x) => (x * Math.PI) / 180; // Convert degrees to radians
  const dLat = toRad(b.lat - a.lat); // Difference in latitude
  const dLon = toRad(b.lon - a.lon); // Difference in longitude
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLon / 2) ** 2; // Haversine formula
  return 2 * R * Math.asin(Math.sqrt(s1)); // Calculate the distance
}

// Map component to display the game map and handle player movement
export default function Map({ session, onGoalReached }) {
  // State to track whether the goal has been reached
  const [goalReached, setGoalReached] = useState(false);

  // useEffect hook to initialize the map and handle geolocation updates
  useEffect(() => {
    // Initialize the map centered on the starting location
    const map = L.map("map").setView([session.start.lat, session.start.lon], 15);

    // Add OpenStreetMap tiles to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Add a marker for the player's starting position
    const playerMarker = L.marker([session.start.lat, session.start.lon]).addTo(map);

    // Add a marker for the goal location with a custom icon
    L.marker([session.goal.lat, session.goal.lon], {
      icon: L.divIcon({ className: "goal", html: "🎯" }), // Custom goal icon
    }).addTo(map);

    // Check if geolocation is supported by the browser
    const ok = "geolocation" in navigator;
    if (!ok) alert("Geolocation not supported");

    // Watch the user's geolocation and update the player's position on the map
    const watchId = ok
      ? navigator.geolocation.watchPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }; // Current position
            playerMarker.setLatLng([coords.lat, coords.lon]); // Update player marker position

            // Check if the player has reached the goal
            if (!goalReached && haversine(coords, session.goal) < session.goal.radius) {
              setGoalReached(true); // Mark the goal as reached
              onGoalReached({ type: "goal_reached", position: coords }); // Notify the parent component
              alert("Goal Reached!"); // Alert the user
            } else {
              // Log the player's position as a "position_tick" event
              sendEvent({ type: "position_tick", position: coords });
            }
          },
          console.error, // Log errors to the console
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 } // Geolocation options
        )
      : null;

    // Cleanup function to stop watching the user's geolocation when the component unmounts
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [session]); // Dependency array ensures this runs when the session changes

  // Render the map container
  return <div id="map" style={{ height: "80vh" }} />;
}