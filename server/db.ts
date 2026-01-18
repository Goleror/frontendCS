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
    
    // Создаём таблицу users с новыми полями
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        class_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаём таблицу classes
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        class_code TEXT NOT NULL UNIQUE,
        class_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Создаём таблицу class_students
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS class_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
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
  } else {
    // Проверяем, есть ли новые столбцы в таблице users
    const columnsCheck = sqlite.prepare("PRAGMA table_info(users)").all();
    const hasRoleColumn = columnsCheck.some((col: any) => col.name === 'role');
    
    if (!hasRoleColumn) {
      console.log("[db] Adding missing columns to users table...");
      sqlite.exec(`
        ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
      `);
      sqlite.exec(`
        ALTER TABLE users ADD COLUMN class_code TEXT;
      `);
      console.log("[db] Added role and class_code columns");
    }
    
    // Проверяем, есть ли таблица classes
    const classesCheck = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='classes'"
    ).all();
    
    if (classesCheck.length === 0) {
      console.log("[db] Creating classes and class_students tables...");
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          class_code TEXT NOT NULL UNIQUE,
          class_name TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS class_students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          class_id INTEGER NOT NULL,
          joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
        );
      `);
    }
  }
} catch (error) {
  console.error("[db] Error creating tables:", error);
}

export default db;

