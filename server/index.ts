import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
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
 * Инициализировать админского пользователя
 */
async function initializeAdmin(): Promise<void> {
  const ADMIN_USERNAME = "admin007";
  const ADMIN_PASSWORD = "Admin007";

  try {
    // Проверяем, существует ли уже админский аккаунт
    const existingAdmin = await storage.getUser(ADMIN_USERNAME);

    if (existingAdmin) {
      console.log(`\n[ADMIN] ✓ Админский аккаунт уже существует:`);
      console.log(`[ADMIN]   📝 Имя пользователя: ${ADMIN_USERNAME}`);
      console.log(`[ADMIN]   🔐 Пароль: ${ADMIN_PASSWORD}`);
      console.log(`[ADMIN]   👤 ID: ${existingAdmin.id}`);
      console.log(`[ADMIN]   📅 Создан: ${existingAdmin.created_at}`);
      return;
    }

    // Создаём админский аккаунт
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await storage.createUser({
      username: ADMIN_USERNAME,
      password_hash: hashedPassword,
      role: "teacher",
      class_code: "ADMIN0",
    });

    // Инициализируем прогресс админа
    await storage.initializeUserProgress(admin.id);

    // Создаём класс для админа
    await storage.createClass({
      teacher_id: admin.id,
      class_code: "ADMIN0",
      class_name: "Administration",
    });

    console.log(`\n[ADMIN] ✓ Новый админский аккаунт создан:`);
    console.log(`[ADMIN]   📝 Имя пользователя: ${ADMIN_USERNAME}`);
    console.log(`[ADMIN]   🔐 Пароль: ${ADMIN_PASSWORD}`);
    console.log(`[ADMIN]   👤 ID: ${admin.id}`);
    console.log(`[ADMIN]   📅 Создан: ${admin.created_at}`);
    console.log(`[ADMIN] ⚠️  ВАЖНО: Измените пароль при первом входе!\n`);
  } catch (error) {
    console.error("[ADMIN] ✗ Ошибка при инициализации админа:", error);
  }
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

    // Инициализируем админского пользователя
    await initializeAdmin();

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
