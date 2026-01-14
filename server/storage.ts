import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import { users, leaderboard, userProgress, type User, type InsertUser, type LeaderboardEntry, type InsertLeaderboard, type UserProgress, type InsertUserProgress } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  addLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry>;
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  initializeUserProgress(userId: number): Promise<UserProgress>;
}

// File-based storage for development
class FileStorage implements IStorage {
  private dataFile = path.join(process.cwd(), '.data.json');
  private data: {
    users: (User & { id: number })[];
    leaderboard: LeaderboardEntry[];
    userProgress: Map<number, UserProgress>;
    nextUserId: number;
    nextLeaderboardId: number;
  };

  constructor() {
    this.data = this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          ...parsed,
          userProgress: new Map(parsed.userProgress || []),
        };
      }
    } catch (error) {
      console.error('Error loading data file:', error);
    }

    return {
      users: [],
      leaderboard: [],
      userProgress: new Map(),
      nextUserId: 1,
      nextLeaderboardId: 1,
    };
  }

  private saveData() {
    try {
      const dataToSave = {
        ...this.data,
        userProgress: Array.from(this.data.userProgress.entries()),
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Error saving data file:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User & { id: number } = {
      id: this.data.nextUserId++,
      ...insertUser,
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    return this.data.leaderboard
      .sort((a, b) => a.completionTimeMs - b.completionTimeMs)
      .slice(0, limit);
  }

  async addLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const newEntry: LeaderboardEntry = {
      id: this.data.nextLeaderboardId++,
      ...entry,
      createdAt: new Date(),
    };
    this.data.leaderboard.push(newEntry);
    this.saveData();
    return newEntry;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return this.data.userProgress.get(userId);
  }

  async initializeUserProgress(userId: number): Promise<UserProgress> {
    const newProgress: UserProgress = {
      id: this.data.userProgress.size + 1,
      userId,
      level: 1,
      totalScore: 0,
      totalMissionsCompleted: 0,
      totalCommandsExecuted: 0,
      totalErrors: 0,
      unlockedAchievements: "[]",
      lastPlayedAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.userProgress.set(userId, newProgress);
    this.saveData();
    return newProgress;
  }

  async updateUserProgress(userId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress> {
    let userProg = this.data.userProgress.get(userId);
    if (!userProg) {
      userProg = await this.initializeUserProgress(userId);
    }

    const updated: UserProgress = {
      ...userProg,
      ...progress,
      updatedAt: new Date(),
      lastPlayedAt: new Date(),
    };
    this.data.userProgress.set(userId, updated);
    this.saveData();
    return updated;
  }
}

// In-memory storage for development
class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private leaderboard: Map<number, LeaderboardEntry> = new Map();
  private userProgresses: Map<number, UserProgress> = new Map();
  private userIdCounter = 1;
  private leaderboardIdCounter = 1;
  private progressIdCounter = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      ...insertUser,
    };
    this.users.set(user.id, user);
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const entries = Array.from(this.leaderboard.values())
      .sort((a, b) => a.completionTimeMs - b.completionTimeMs)
      .slice(0, limit);
    return entries;
  }

  async addLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const newEntry: LeaderboardEntry = {
      id: this.leaderboardIdCounter++,
      ...entry,
      createdAt: new Date(),
    };
    this.leaderboard.set(newEntry.id, newEntry);
    return newEntry;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return this.userProgresses.get(userId);
  }

  async initializeUserProgress(userId: number): Promise<UserProgress> {
    const newProgress: UserProgress = {
      id: this.progressIdCounter++,
      userId,
      level: 1,
      totalScore: 0,
      totalMissionsCompleted: 0,
      totalCommandsExecuted: 0,
      totalErrors: 0,
      unlockedAchievements: "[]",
      lastPlayedAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProgresses.set(userId, newProgress);
    return newProgress;
  }

  async updateUserProgress(userId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress> {
    let userProg = this.userProgresses.get(userId);
    if (!userProg) {
      userProg = await this.initializeUserProgress(userId);
    }

    const updated: UserProgress = {
      ...userProg,
      ...progress,
      updatedAt: new Date(),
      lastPlayedAt: new Date(),
    };
    this.userProgresses.set(userId, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    return db.select().from(leaderboard).orderBy(asc(leaderboard.completionTimeMs)).limit(limit);
  }

  async addLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const [newEntry] = await db.insert(leaderboard).values(entry).returning();
    return newEntry;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async initializeUserProgress(userId: number): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values({
      userId,
      level: 1,
      totalScore: 0,
      totalMissionsCompleted: 0,
      totalCommandsExecuted: 0,
      totalErrors: 0,
      unlockedAchievements: "[]",
    }).returning();
    return progress;
  }

  async updateUserProgress(userId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress> {
    let existing = await this.getUserProgress(userId);
    if (!existing) {
      existing = await this.initializeUserProgress(userId);
    }

    const [updated] = await db
      .update(userProgress)
      .set({ ...progress, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return updated;
  }
}

// Use appropriate storage based on environment
// By default use DatabaseStorage (SQLite)
let storage: IStorage;

// Always use DatabaseStorage (SQLite) by default
storage = new DatabaseStorage();
console.log('[storage] Using DatabaseStorage - SQLite database');

export { storage };
