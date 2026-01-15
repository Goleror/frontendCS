import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import path from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// Используем relative path для работы с CommonJS в production
const dbPath = path.resolve(process.cwd(), "newarch.db");

/**
 * Инициализируем better-sqlite3 подключение
 */
const sqlite = new Database(dbPath);

// Включаем foreign keys
sqlite.pragma("foreign_keys = ON");

/**
 * Инициализируем drizzle ORM с SQLite
 */
export const db = drizzle(sqlite, { schema });

/**
 * Создаём таблицы если их нет (для разработки и первого запуска)
 */
try {
  // Проверяем наличие таблицы users
  const tableCheck = sqlite.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  ).all();
  
  if (tableCheck.length === 0) {
    console.log("[db] Creating tables...");
    
    // Создаём таблицу users
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаём таблицу user_progress
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        level INTEGER DEFAULT 1,
        total_score INTEGER DEFAULT 0,
        total_missions_completed INTEGER DEFAULT 0,
        total_commands_executed INTEGER DEFAULT 0,
        total_errors INTEGER DEFAULT 0,
        unlocked_achievements TEXT DEFAULT '[]',
        last_played_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Создаём таблицу leaderboard
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        completion_time_ms INTEGER DEFAULT 0,
        command_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        achievement_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("[db] Tables created successfully!");
  }
} catch (error) {
  console.error("[db] Error creating tables:", error);
}

export default db;

