import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  completionTimeMs: integer("completion_time_ms").notNull(),
  commandCount: integer("command_count").notNull(),
  errorCount: integer("error_count").notNull(),
  achievementCount: integer("achievement_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress/stats
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  level: integer("level").notNull().default(1),
  totalScore: integer("total_score").notNull().default(0),
  totalMissionsCompleted: integer("total_missions_completed").notNull().default(0),
  totalCommandsExecuted: integer("total_commands_executed").notNull().default(0),
  totalErrors: integer("total_errors").notNull().default(0),
  unlockedAchievements: text("unlocked_achievements").notNull().default("[]"), // JSON array
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Multiplayer tables
export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  roomCode: text("room_code").notNull().unique(),
  creatorId: integer("creator_id").notNull(),
  maxPlayers: integer("max_players").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomPlayers = pgTable("room_players", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  playerId: integer("player_id").notNull(),
  team: text("team").notNull(), // "red" or "blue"
  score: integer("score").notNull().default(0),
  isReady: boolean("is_ready").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  playerId: integer("player_id").notNull(),
  eventType: text("event_type").notNull(), // "command", "error", "achievement"
  eventData: text("event_data").notNull(), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team statistics
export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  team: text("team").notNull(), // "red" or "blue"
  totalScore: integer("total_score").notNull().default(0),
  commandsExecuted: integer("commands_executed").notNull().default(0),
  errorsCount: integer("errors_count").notNull().default(0),
  achievementsUnlocked: integer("achievements_unlocked").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).pick({
  userId: true,
  playerName: true,
  completionTimeMs: true,
  commandCount: true,
  errorCount: true,
  achievementCount: true,
}).extend({
  userId: z.number().optional(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  level: true,
  totalScore: true,
  totalMissionsCompleted: true,
  totalCommandsExecuted: true,
  totalErrors: true,
  unlockedAchievements: true,
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).pick({
  creatorId: true,
  maxPlayers: true,
});

export const insertRoomPlayerSchema = createInsertSchema(roomPlayers).pick({
  roomId: true,
  playerId: true,
});

export const insertGameEventSchema = createInsertSchema(gameEvents).pick({
  roomId: true,
  playerId: true,
  eventType: true,
  eventData: true,
});

export const insertTeamStatsSchema = createInsertSchema(teamStats).pick({
  roomId: true,
  team: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Multiplayer types
export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type RoomPlayer = typeof roomPlayers.$inferSelect;
export type InsertRoomPlayer = z.infer<typeof insertRoomPlayerSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type TeamStats = typeof teamStats.$inferSelect;
export type InsertTeamStats = z.infer<typeof insertTeamStatsSchema>;
