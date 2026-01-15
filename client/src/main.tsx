import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[MAIN] Starting application...");
console.log("[MAIN] Root element:", document.getElementById("root"));

try {
  console.log("[MAIN] Creating React root...");
  const root = createRoot(document.getElementById("root")!);
  console.log("[MAIN] React root created, rendering App...");
  root.render(<App />);
  console.log("[MAIN] App rendered successfully");
} catch (e) {
  console.error("[MAIN] Error rendering app:", e);
}
