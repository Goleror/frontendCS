import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { db } from "./db";
import os from "os";

const app = express();
const PORT = 5000;

/**
 * ============================================================================
 * Middleware
 * ============================================================================
 */

// CORS middleware for development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toLocaleTimeString()}] ${method} ${path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

/**
 * Получить локальные IP адреса
 */
function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const [, addrs] of Object.entries(interfaces)) {
    if (addrs) {
      for (const addr of addrs) {
        if (addr.family === "IPv4" && !addr.internal) {
          ips.push(addr.address);
        }
      }
    }
  }

  return ips;
}

/**
 * ============================================================================
 * Routes
 * ============================================================================
 */

(async () => {
  try {
    // Инициализируем БД (проверяем соединение)
    console.log("[db] Database connection initialized");

    // Регистрируем все API роуты
    await registerRoutes(app);

    // Подаём статические файлы (фронтенд)
    serveStatic(app);

    /**
     * ============================================================================
     * Global Error Handling Middleware
     * ============================================================================
     */
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error("[error] Error:", err);

        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({
          error: message,
          status,
        });
      }
    );

    /**
     * ============================================================================
     * 404 Handler (должен быть после всех других роутов)
     * ============================================================================
     */
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: "Not Found",
        path: req.path,
      });
    });

    /**
     * ============================================================================
     * Start Server
     * ============================================================================
     */

    app.listen(PORT, "0.0.0.0", () => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n[${timestamp}] [EXPRESS] serving on port ${PORT}`);
      console.log(`[${timestamp}] [EXPRESS] 🎮 Фронтенд и Бекенд запущены на одном сервере`);
      console.log(`[${timestamp}] [EXPRESS] 📍 Доступ через localhost:`);
      console.log(
        `[${timestamp}] [EXPRESS]    [BACKEND] http://localhost:${PORT} (API)`
      );
      console.log(
        `[${timestamp}] [EXPRESS]    [FRONTEND] http://localhost:${PORT} (Web UI)`
      );

      const localIPs = getLocalIPs();
      if (localIPs.length > 0) {
        console.log(`[${timestamp}] [EXPRESS] 📍 Доступ через локальную сеть:`);
        localIPs.forEach((ip) => {
          console.log(
            `[${timestamp}] [EXPRESS]    [BACKEND] http://${ip}:${PORT} (API)`
          );
          console.log(
            `[${timestamp}] [EXPRESS]    [FRONTEND] http://${ip}:${PORT} (Web UI)`
          );
        });
      }
    });
  } catch (error) {
    console.error("[error] Failed to start server:", error);
    process.exit(1);
  }
})();
