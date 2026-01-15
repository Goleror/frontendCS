import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { log } from "./logger";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: false, // Disable HMR for cross-device development
    allowedHosts: "*" as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        log(`Vite Error: ${msg}`, "frontend");
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    log(`Processing request for URL: ${url}`, "frontend");

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      
      log(`Loading template from: ${clientTemplate}`, "frontend");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      log(`Template loaded, size: ${template.length} bytes`, "frontend");
      
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      log(`Transforming HTML...`, "frontend");
      const page = await vite.transformIndexHtml(url, template);
      log(`Transform complete, sending response of ${page.length} bytes`, "frontend");
      
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      log(`Error: ${e}`, "frontend");
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
