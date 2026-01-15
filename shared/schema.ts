import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table
 * Хранит информацию об пользователях и их учетные данные
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * User Progress table
 * Хранит прогресс каждого игрока (уровни, очки, достижения)
 */
export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  level: integer("level").default(1),
  total_score: integer("total_score").default(0),
  total_missions_completed: integer("total_missions_completed").default(0),
  total_commands_executed: integer("total_commands_executed").default(0),
  total_errors: integer("total_errors").default(0),
  unlocked_achievements: text("unlocked_achievements").default("[]"),
  last_played_at: text("last_played_at"),
});

/**
 * Leaderboard table
 * Хранит информацию о прохождениях игроков для таблицы лидеров
 */
export const leaderboard = sqliteTable("leaderboard", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  player_name: text("player_name").notNull(),
  completion_time_ms: integer("completion_time_ms").notNull(),
  command_count: integer("command_count").notNull(),
  error_count: integer("error_count").notNull(),
  achievement_count: integer("achievement_count").notNull(),
  created_at: text("created_at"),
});

// ============================================================================
// Zod Schemas для валидации и типизации
// ============================================================================

/**
 * Users - Zod схемы
 */
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  password_hash: z.string().min(8, "Password must be at least 8 characters"),
});

export const selectUserSchema = createSelectSchema(users);

/**
 * User Progress - Zod схемы
 */
export const insertUserProgressSchema = createInsertSchema(userProgress, {
  user_id: z.number().int().positive(),
  level: z.number().int().positive().default(1),
  total_score: z.number().int().nonnegative().default(0),
  total_missions_completed: z.number().int().nonnegative().default(0),
  total_commands_executed: z.number().int().nonnegative().default(0),
  total_errors: z.number().int().nonnegative().default(0),
  unlocked_achievements: z.string().default("[]"),
  last_played_at: z.string().optional(),
});

export const selectUserProgressSchema = createSelectSchema(userProgress);

/**
 * Leaderboard - Zod схемы
 */
export const insertLeaderboardSchema = createInsertSchema(leaderboard, {
  player_name: z.string().min(1, "Player name is required"),
  completion_time_ms: z.number().int().nonnegative(),
  command_count: z.number().int().nonnegative(),
  error_count: z.number().int().nonnegative(),
  achievement_count: z.number().int().nonnegative(),
  created_at: z.string().optional(),
});

export const selectLeaderboardSchema = createSelectSchema(leaderboard);

// ============================================================================
// TypeScript типы (выведенные из Zod схем)
// ============================================================================

/**
 * User типы
 */
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * User Progress типы
 */
export type UserProgress = z.infer<typeof selectUserProgressSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

/**
 * Leaderboard типы
 */
export type Leaderboard = z.infer<typeof selectLeaderboardSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
