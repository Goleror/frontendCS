import { db } from "./db";
import { users, userProgress, leaderboard, classes, classStudents } from "../shared/schema";
import type {
  User,
  InsertUser,
  UserProgress,
  InsertUserProgress,
  Leaderboard,
  InsertLeaderboard,
  Class,
  InsertClass,
  ClassStudent,
  InsertClassStudent,
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
   * Получить пользователя по ID
   */
  getUserById(id: number): Promise<User | undefined>;

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

  /**
   * Создать класс для учителя
   */
  createClass(insertClass: InsertClass): Promise<Class>;

  /**
   * Получить класс по коду
   */
  getClassByCode(classCode: string): Promise<Class | undefined>;

  /**
   * Добавить студента в класс
   */
  addStudentToClass(studentId: number, classId: number): Promise<ClassStudent>;

  /**
   * Получить классы преподавателя
   */
  getTeacherClasses(teacherId: number): Promise<Class[]>;

  /**
   * Получить студентов в классе
   */
  getClassStudents(classId: number): Promise<User[]>;

  /**
   * Проверить, есть ли студент в классе
   */
  isStudentInClass(studentId: number, classId: number): Promise<boolean>;

  /**
   * Получить всех пользователей
   */
  getAllUsers(): Promise<User[]>;

  /**
   * Получить все классы
   */
  getAllClasses(): Promise<Class[]>;

  /**
   * Обновить данные пользователя (админ функция)
   */
  updateUser(userId: number, data: Partial<{ username: string; role: string; class_code: string }>): Promise<User>;

  /**
   * Удалить пользователя (админ функция)
   */
  deleteUser(userId: number): Promise<void>;

  /**
   * Удалить класс (админ функция)
   */
  deleteClass(classId: number): Promise<void>;
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
   * Получить пользователя по ID
   */
  async getUserById(id: number): Promise<User | undefined> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return user[0];
    } catch (error) {
      console.error("[storage] Error getting user by ID:", error);
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

  /**
   * Создать класс для учителя
   */
  async createClass(insertClass: InsertClass): Promise<Class> {
    try {
      const result = await db.insert(classes).values(insertClass).returning();
      return result[0];
    } catch (error) {
      console.error("[storage] Error creating class:", error);
      throw error;
    }
  }

  /**
   * Получить класс по коду
   */
  async getClassByCode(classCode: string): Promise<Class | undefined> {
    try {
      const cls = await db
        .select()
        .from(classes)
        .where(eq(classes.class_code, classCode))
        .limit(1);

      return cls[0];
    } catch (error) {
      console.error("[storage] Error getting class by code:", error);
      throw error;
    }
  }

  /**
   * Добавить студента в класс
   */
  async addStudentToClass(studentId: number, classId: number): Promise<ClassStudent> {
    try {
      const result = await db
        .insert(classStudents)
        .values({ student_id: studentId, class_id: classId })
        .returning();
      return result[0];
    } catch (error) {
      console.error("[storage] Error adding student to class:", error);
      throw error;
    }
  }

  /**
   * Получить классы преподавателя
   */
  async getTeacherClasses(teacherId: number): Promise<Class[]> {
    try {
      const result = await db
        .select()
        .from(classes)
        .where(eq(classes.teacher_id, teacherId));

      return result;
    } catch (error) {
      console.error("[storage] Error getting teacher classes:", error);
      throw error;
    }
  }

  /**
   * Получить студентов в классе
   */
  async getClassStudents(classId: number): Promise<User[]> {
    try {
      const result = await db
        .select({ student: users })
        .from(classStudents)
        .where(eq(classStudents.class_id, classId));

      return result.map((row: any) => row.student);
    } catch (error) {
      console.error("[storage] Error getting class students:", error);
      throw error;
    }
  }

  /**
   * Проверить, есть ли студент в классе
   */
  async isStudentInClass(studentId: number, classId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(classStudents)
        .where(
          eq(classStudents.student_id, studentId) &&
          eq(classStudents.class_id, classId)
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error("[storage] Error checking student in class:", error);
      throw error;
    }
  }

  /**
   * Получить всех пользователей
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error("[storage] Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Получить все классы
   */
  async getAllClasses(): Promise<Class[]> {
    try {
      const allClasses = await db.select().from(classes);
      return allClasses;
    } catch (error) {
      console.error("[storage] Error getting all classes:", error);
      throw error;
    }
  }

  /**
   * Обновить данные пользователя
   */
  async updateUser(
    userId: number,
    data: Partial<{ username: string; role: string; class_code: string }>
  ): Promise<User> {
    try {
      const updateData: any = {};
      if (data.username) updateData.username = data.username;
      if (data.role) updateData.role = data.role;
      if (data.class_code) updateData.class_code = data.class_code;

      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("[storage] Error updating user:", error);
      throw error;
    }
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error("[storage] Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Удалить класс
   */
  async deleteClass(classId: number): Promise<void> {
    try {
      await db.delete(classes).where(eq(classes.id, classId));
    } catch (error) {
      console.error("[storage] Error deleting class:", error);
      throw error;
    }
  }
}

/**
 * Единственный экземпляр хранилища
 */
export const storage = new DatabaseStorage();

export default storage;
