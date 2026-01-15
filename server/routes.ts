import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import SqliteStore from "connect-sqlite3";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";

// Инициализируем SQLiteStore
const Store = SqliteStore(session);

/**
 * Интерфейс для типизации request с userId из session
 */
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Middleware для проверки аутентификации
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Требуется аутентификация" });
    return;
  }
  req.userId = userId;
  next();
};

/**
 * Функция регистрации всех роутов
 */
export async function registerRoutes(app: Express): Promise<void> {
  // ============================================================================
  // Настройка express-session
  // ============================================================================
  
  app.use(
    session({
      store: new Store({
        db: "newarch_sessions.db",
        dir: ".",
      }) as any,
      secret: "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // для dev режима
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      },
    })
  );

  // ============================================================================
  // API Auth
  // ============================================================================

  /**
   * POST /api/auth/register
   * Регистрация нового пользователя
   */
  app.post(
    "/api/auth/register",
    [
      body("username")
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be 3-20 characters"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    ],
    async (req: Request, res: Response) => {
      try {
        // Проверяем валидацию
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ error: errors.array()[0].msg });
          return;
        }

        const { username, password } = req.body;

        // Проверяем, занят ли username
        const existingUser = await storage.getUser(username);
        if (existingUser) {
          res.status(409).json({ error: "Username already exists" });
          return;
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const user = await storage.createUser({
          username,
          password_hash: hashedPassword,
        });

        // Инициализируем прогресс пользователя
        await storage.initializeUserProgress(user.id);

        // Сохраняем userId в session
        (req.session as any).userId = user.id;
        req.userId = user.id;

        res.status(201).json({
          id: user.id,
          username: user.username,
        });
      } catch (error) {
        console.error("[routes] Register error:", error);
        res.status(500).json({ error: "Registration failed" });
      }
    }
  );

  /**
   * POST /api/auth/login
   * Вход в систему
   */
  app.post(
    "/api/auth/login",
    [
      body("username").trim().notEmpty().withMessage("Username required"),
      body("password").notEmpty().withMessage("Password required"),
    ],
    async (req: Request, res: Response) => {
      try {
        // Проверяем валидацию
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ error: errors.array()[0].msg });
          return;
        }

        const { username, password } = req.body;

        // Ищем пользователя
        const user = await storage.getUser(username);
        if (!user) {
          res.status(401).json({ error: "Invalid credentials" });
          return;
        }

        // Сравниваем пароли
        const isPasswordValid = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isPasswordValid) {
          res.status(401).json({ error: "Invalid credentials" });
          return;
        }

        // Сохраняем userId в session
        (req.session as any).userId = user.id;
        req.userId = user.id;

        res.json({
          id: user.id,
          username: user.username,
        });
      } catch (error) {
        console.error("[routes] Login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    }
  );

  /**
   * POST /api/auth/logout
   * Выход из системы
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.json({ success: true });
    });
  });

  /**
   * GET /api/auth/user
   * Получить текущего пользователя
   */
  app.get("/api/auth/user", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      // Получаем прогресс пользователя для дополнительной информации
      const progress = await storage.getUserProgress(userId);

      // В реальном приложении нужна функция для получения пользователя по ID
      // Для простоты просто возвращаем userId
      res.json({
        id: userId,
        progress,
      });
    } catch (error) {
      console.error("[routes] Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ============================================================================
  // API Progress (защищенные роуты)
  // ============================================================================

  /**
   * GET /api/progress
   * Получить прогресс пользователя
   */
  app.get("/api/progress", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const progress = await storage.getUserProgress(userId);

      if (!progress) {
        res.status(404).json({ error: "Progress not found" });
        return;
      }

      res.json(progress);
    } catch (error) {
      console.error("[routes] Get progress error:", error);
      res.status(500).json({ error: "Failed to get progress" });
    }
  });

  /**
   * POST /api/progress/mission
   * Обновить прогресс после завершения миссии
   */
  app.post(
    "/api/progress/mission",
    requireAuth,
    [
      body("level").isInt({ min: 1 }).optional(),
      body("points").isInt({ min: 0 }).optional(),
      body("commandCount").isInt({ min: 0 }).optional(),
      body("errorCount").isInt({ min: 0 }).optional(),
    ],
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ error: errors.array()[0].msg });
          return;
        }

        const userId = req.userId!;
        const { level, points, commandCount, errorCount } = req.body;

        // Получаем текущий прогресс
        let progress = await storage.getUserProgress(userId);
        if (!progress) {
          progress = await storage.initializeUserProgress(userId);
        }

        // Обновляем прогресс
        const updatedProgress = await storage.updateUserProgress(userId, {
          level: level || progress.level,
          total_score: (progress.total_score || 0) + (points || 0),
          total_missions_completed: (progress.total_missions_completed || 0) + 1,
          total_commands_executed:
            (progress.total_commands_executed || 0) + (commandCount || 0),
          total_errors: (progress.total_errors || 0) + (errorCount || 0),
          last_played_at: new Date().toISOString(),
        });

        res.json(updatedProgress);
      } catch (error) {
        console.error("[routes] Mission progress error:", error);
        res.status(500).json({ error: "Failed to update progress" });
      }
    }
  );

  /**
   * PUT /api/progress
   * Обновить прогресс пользователя
   */
  app.put("/api/progress", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const {
        level,
        total_score,
        total_missions_completed,
        total_commands_executed,
        total_errors,
        unlocked_achievements,
      } = req.body;

      // Получаем текущий прогресс
      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        progress = await storage.initializeUserProgress(userId);
      }

      // Обновляем прогресс
      const updatedProgress = await storage.updateUserProgress(userId, {
        level: level !== undefined ? level : progress.level,
        total_score:
          total_score !== undefined ? total_score : progress.total_score,
        total_missions_completed:
          total_missions_completed !== undefined
            ? total_missions_completed
            : progress.total_missions_completed,
        total_commands_executed:
          total_commands_executed !== undefined
            ? total_commands_executed
            : progress.total_commands_executed,
        total_errors:
          total_errors !== undefined ? total_errors : progress.total_errors,
        unlocked_achievements:
          unlocked_achievements !== undefined
            ? unlocked_achievements
            : progress.unlocked_achievements,
        last_played_at: new Date().toISOString(),
      });

      res.json(updatedProgress);
    } catch (error) {
      console.error("[routes] Update progress error:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // ============================================================================
  // API Leaderboard
  // ============================================================================

  /**
   * GET /api/leaderboard
   * Получить таблицу лидеров
   */
  app.get(
    "/api/leaderboard",
    async (req: Request, res: Response) => {
      try {
        const limit = req.query.limit
          ? parseInt(req.query.limit as string, 10)
          : 100;

        const leaderboard = await storage.getLeaderboard(limit);
        res.json(leaderboard);
      } catch (error) {
        console.error("[routes] Leaderboard error:", error);
        res.status(500).json({ error: "Failed to get leaderboard" });
      }
    }
  );

  /**
   * POST /api/leaderboard
   * Добавить запись в таблицу лидеров
   */
  app.post(
    "/api/leaderboard",
    [
      body("player_name").trim().notEmpty().withMessage("Player name required"),
      body("completion_time_ms")
        .isInt({ min: 0 })
        .withMessage("Valid completion time required"),
      body("command_count").isInt({ min: 0 }),
      body("error_count").isInt({ min: 0 }),
      body("achievement_count").isInt({ min: 0 }),
    ],
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ error: errors.array()[0].msg });
          return;
        }

        const {
          player_name,
          completion_time_ms,
          command_count,
          error_count,
          achievement_count,
        } = req.body;

        await storage.addLeaderboardEntry({
          player_name,
          completion_time_ms,
          command_count,
          error_count,
          achievement_count,
          created_at: new Date().toISOString(),
        });

        res.status(201).json({ success: true });
      } catch (error) {
        console.error("[routes] Add leaderboard entry error:", error);
        res.status(500).json({ error: "Failed to add leaderboard entry" });
      }
    }
  );

  console.log("[routes] All routes registered successfully");
}

export default registerRoutes;
