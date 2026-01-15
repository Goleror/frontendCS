import { db } from "./db";
import { users, userProgress, leaderboard } from "../shared/schema";
import type {
  User,
  InsertUser,
  UserProgress,
  InsertUserProgress,
  Leaderboard,
  InsertLeaderboard,
} from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Интерфейс для работы с хранилищем данных
 */
export interface IStorage {
  /**
   * Получить пользователя по username
   */
  getUser(username: string): Promise<User | undefined>;

  /**
   * Получить пользователя по username (alias для совместимости)
   */
  getUserByUsername(username: string): Promise<User | undefined>;

  /**
   * Создать нового пользователя
   */
  createUser(insertUser: InsertUser): Promise<User>;

  /**
   * Получить прогресс пользователя
   */
  getUserProgress(userId: number): Promise<UserProgress | undefined>;

  /**
   * Инициализировать прогресс пользователя
   */
  initializeUserProgress(userId: number): Promise<UserProgress>;

  /**
   * Обновить прогресс пользователя
   */
  updateUserProgress(userId: number, data: Partial<InsertUserProgress>): Promise<UserProgress>;

  /**
   * Получить таблицу лидеров
   */
  getLeaderboard(limit?: number): Promise<Leaderboard[]>;

  /**
   * Добавить запись в таблицу лидеров
   */
  addLeaderboardEntry(entry: InsertLeaderboard): Promise<void>;
}

/**
 * Реализация хранилища с использованием Drizzle ORM и SQLite
 */
export class DatabaseStorage implements IStorage {
  /**
   * Получить пользователя по username
   */
  async getUser(username: string): Promise<User | undefined> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return user[0];
    } catch (error) {
      console.error("[storage] Error getting user:", error);
      throw error;
    }
  }

  /**
   * Получить пользователя по username (alias для совместимости)
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getUser(username);
  }

  /**
   * Создать нового пользователя
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("[storage] Error creating user:", error);
      throw error;
    }
  }

  /**
   * Получить прогресс пользователя
   */
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    try {
      const progress = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.user_id, userId))
        .limit(1);

      return progress[0];
    } catch (error) {
      console.error("[storage] Error getting user progress:", error);
      throw error;
    }
  }

  /**
   * Инициализировать прогресс пользователя
   */
  async initializeUserProgress(userId: number): Promise<UserProgress> {
    try {
      const result = await db
        .insert(userProgress)
        .values({
          user_id: userId,
          level: 1,
          total_score: 0,
          total_missions_completed: 0,
          total_commands_executed: 0,
          total_errors: 0,
          unlocked_achievements: "[]",
        } as InsertUserProgress)
        .returning();
      return result[0];
    } catch (error) {
      console.error("[storage] Error initializing user progress:", error);
      throw error;
    }
  }

  /**
   * Обновить прогресс пользователя
   */
  async updateUserProgress(
    userId: number,
    data: Partial<InsertUserProgress>
  ): Promise<UserProgress> {
    try {
      // Проверяем, существует ли запись прогресса
      const existing = await this.getUserProgress(userId);

      if (!existing) {
        // Если не существует, создаем новую с user_id
        return this.initializeUserProgress(userId);
      }

      // Обновляем существующую запись
      const result = await db
        .update(userProgress)
        .set(data)
        .where(eq(userProgress.user_id, userId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("[storage] Error updating user progress:", error);
      throw error;
    }
  }

  /**
   * Получить таблицу лидеров (отсортировано по completion_time_ms)
   */
  async getLeaderboard(limit: number = 100): Promise<Leaderboard[]> {
    try {
      const entries = await db.select().from(leaderboard);
      // Сортируем по completion_time_ms (быстрее = лучше)
      return entries
        .sort((a, b) => a.completion_time_ms - b.completion_time_ms)
        .slice(0, limit);
    } catch (error) {
      console.error("[storage] Error getting leaderboard:", error);
      throw error;
    }
  }

  /**
   * Добавить запись в таблицу лидеров
   */
  async addLeaderboardEntry(entry: InsertLeaderboard): Promise<void> {
    try {
      await db.insert(leaderboard).values(entry);
    } catch (error) {
      console.error("[storage] Error adding leaderboard entry:", error);
      throw error;
    }
  }
}

/**
 * Единственный экземпляр хранилища
 */
export const storage = new DatabaseStorage();

export default storage;
