import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeaderboardSchema, insertUserSchema } from "@shared/schema";
import { registerMultiplayerRoutes } from "./multiplayer";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per 15 minutes
  message: 'Слишком много попыток входа. Попробуйте позже.',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip || 'unknown',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.ip || 'unknown',
});

// Validation middleware
const validateUsername = body('username')
  .trim()
  .isLength({ min: 3, max: 20 })
  .withMessage('Имя пользователя должно быть от 3 до 20 символов')
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage('Имя пользователя может содержать только буквы, цифры, _ и -');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Пароль должен быть минимум 8 символов')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Пароль должен содержать заглавные, строчные буквы и цифры');

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AUTH: Register
  app.post(
    "/api/auth/register",
    authLimiter,
    validateUsername,
    validatePassword,
    async (req, res) => {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      try {
        const parsed = insertUserSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: "Некорректные данные запроса" });
          return;
        }

        const { username, password } = parsed.data;

        // Additional security check: prevent common usernames
        const blockedUsernames = ['admin', 'root', 'system', 'test', 'guest'];
        if (blockedUsernames.includes(username.toLowerCase())) {
          res.status(400).json({ error: 'Это имя пользователя недоступно' });
          return;
        }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: "Пользователь с таким именем уже существует" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Initialize user progress
      await storage.initializeUserProgress(user.id);

      // Set session
      (req as any).session.userId = user.id;
      await new Promise((resolve, reject) => {
        (req as any).session.save((err: any) => {
          if (err) reject(err);
          else resolve(null);
        });
      });

      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Ошибка при регистрации: не удалось создать аккаунт" });
    }
  });

  // AUTH: Login
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;

      // Input sanitization
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }

      const trimmedUsername = username.trim();
      
      const user = await storage.getUserByUsername(trimmedUsername);
      if (!user) {
        // Prevent username enumeration attacks
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Set session
      (req as any).session.userId = user.id;
      await new Promise((resolve, reject) => {
        (req as any).session.save((err: any) => {
          if (err) reject(err);
          else resolve(null);
        });
      });

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // AUTH: Logout
  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ error: "Failed to logout" });
        return;
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // AUTH: Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const entries = await storage.getLeaderboard(limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    try {
      const parsed = insertLeaderboardSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid request body", details: parsed.error.errors });
        return;
      }

      const entry = await storage.addLeaderboardEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error adding leaderboard entry:", error);
      res.status(500).json({ error: "Failed to add leaderboard entry" });
    }
  });

  // PROGRESS: Get user progress
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        progress = await storage.initializeUserProgress(userId);
      }

      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // PROGRESS: Update user progress (general)
  app.put("/api/progress", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { level, totalScore, totalMissionsCompleted, totalCommandsExecuted, totalErrors } = req.body;
      
      const progress = await storage.updateUserProgress(userId, {
        level,
        totalScore,
        totalMissionsCompleted,
        totalCommandsExecuted,
        totalErrors,
      });

      res.json(progress);
    } catch (error) {
      console.error("Error updating user progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // PROGRESS: Add mission completion
  app.post("/api/progress/mission", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { points, missionName } = req.body;
      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        progress = await storage.initializeUserProgress(userId);
      }

      const updated = await storage.updateUserProgress(userId, {
        totalScore: (progress.totalScore || 0) + (points || 10),
        totalMissionsCompleted: (progress.totalMissionsCompleted || 0) + 1,
      });

      res.json({ success: true, progress: updated });
    } catch (error) {
      console.error("Error recording mission completion:", error);
      res.status(500).json({ error: "Failed to record mission" });
    }
  });

  // PROGRESS: Unlock achievement
  app.post("/api/progress/achievement", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { achievementId, achievementName } = req.body;
      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        progress = await storage.initializeUserProgress(userId);
      }

      const achievements = JSON.parse(progress.unlockedAchievements || "[]");
      if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
      }

      const updated = await storage.updateUserProgress(userId, {
        unlockedAchievements: JSON.stringify(achievements),
      });

      res.json({ success: true, progress: updated });
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      res.status(500).json({ error: "Failed to unlock achievement" });
    }
  });

  // Register multiplayer routes
  registerMultiplayerRoutes(app);

  return httpServer;
}
