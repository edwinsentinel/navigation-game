// Importing React and its hooks for managing state and side effects
import React, { useState, useEffect } from "react";

// Importing the Map component to display the game map
import Map from "./map";

// Importing API functions to start a session and send events
import { startSession, sendEvent } from "./api";

function App() {
  // State to store the session data
  const [session, setSession] = useState(null);

  // State to store any error that occurs during the session initialization
  const [error, setError] = useState(null);

  // useEffect hook to start a session when the component mounts
  useEffect(() => {
    // Call the startSession API and update the session state with the response
    // If an error occurs, update the error state
    startSession()
      .then(setSession)
      .catch(err => setError(String(err)));
  }, []); // Empty dependency array ensures this runs only once on mount

  // If an error occurred, display an error message
  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;

  // If the session data is not yet loaded, display a loading message
  if (!session) return <p>Loading session...</p>;

  // Render the main application UI
  return (
    <div>
      <h2>Navigation Game</h2>
      {/* Render the Map component, passing the session data and a callback for when the goal is reached */}
      <Map session={session} onGoalReached={(evt) => sendEvent(evt)} />
    </div>
  );
}

// Exporting the App component as the default export
export default App;