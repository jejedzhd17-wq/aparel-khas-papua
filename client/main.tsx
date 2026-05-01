import "./global.css";

import { createRoot } from "react-dom/client";
import App from "./App";

// Single mount point to prevent double initialization
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
