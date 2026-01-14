import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import * as path from "path";
import * as fs from "fs";

// Initialize SQLite database
const dbPath = path.join(process.cwd(), "newarch.db");
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Run migrations/create tables
export async function initializeDatabase() {
  try {
    // Check if tables exist, if not create them
    const tableCheck = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      )
      .get();

    if (!tableCheck) {
      console.log("[db] Creating database tables...");
      
      // Create users table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);

      // Create leaderboard table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS leaderboard (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_name TEXT NOT NULL,
          completion_time_ms INTEGER NOT NULL,
          command_count INTEGER NOT NULL,
          error_count INTEGER NOT NULL,
          achievement_count INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_progress table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          level INTEGER NOT NULL DEFAULT 1,
          total_score INTEGER NOT NULL DEFAULT 0,
          total_missions_completed INTEGER NOT NULL DEFAULT 0,
          total_commands_executed INTEGER NOT NULL DEFAULT 0,
          total_errors INTEGER NOT NULL DEFAULT 0,
          unlocked_achievements TEXT NOT NULL DEFAULT '[]',
          last_played_at DATETIME,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      console.log("[db] ✓ Database tables created successfully");
    } else {
      console.log("[db] Using existing SQLite database at", dbPath);
    }
  } catch (error) {
    console.error("[db] Error initializing database:", error);
    throw error;
  }
}

