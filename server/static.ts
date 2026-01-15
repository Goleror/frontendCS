import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // В режиме production: используем относительный путь от dist/index.cjs
  // В режиме development: используем относительный путь от server/
  const baseDir = path.dirname(__filename);
  
  const possiblePaths = [
    path.resolve(baseDir, "../dist"),           // Production (up from dist/)
    path.resolve(baseDir, "./dist"),            // From server folder
    path.resolve(baseDir, "../client/dist"),    // Client dist folder
    path.resolve(baseDir, "../public"),         // Public folder fallback
  ];

  let distPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      console.log(`[static] Found frontend at: ${p}`);
      break;
    }
  }

  if (!distPath) {
    console.warn(
      `[static] ⚠️ Frontend not found in any of: ${possiblePaths.join(", ")}`
    );
    console.warn(`[static] Skipping static file serving. Run 'npm run build' first.`);
    return;
  }

  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(distPath));

  // Fall through to index.html for SPA routing
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Not Found", path: _req.path });
    }
  });
}

