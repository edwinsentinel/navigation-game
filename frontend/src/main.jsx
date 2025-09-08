// Importing React to use its features for building the UI
import React from "react";

// Importing ReactDOM to render the React application into the DOM
import ReactDOM from "react-dom/client";

// Importing the App component, which is the root component of the application
import App from "./App";

// Rendering the App component into the DOM element with the ID "root"
// ReactDOM.createRoot initializes the React application and attaches it to the DOM
ReactDOM.createRoot(document.getElementById("root")).render(<App />);