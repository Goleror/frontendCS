import { useEffect, useCallback } from 'react';
import { useGameEngine, type Mission } from './useGameEngine';
import { useAchievements, type Achievement } from './useAchievements';

export interface UserProgress {
  id: number;
  user_id: number;
  level: number;
  total_score: number;
  total_missions_completed: number;
  total_commands_executed: number;
  total_errors: number;
  unlocked_achievements: string;
  last_played_at?: string;
  updated_at?: string;
}

/**
 * Хук для синхронизации прогресса с localStorage
 * Загружает прогресс при входе в игру и сохраняет при завершении миссий
 */
export const useProgressSync = () => {
  const gameEngine = useGameEngine();
  const achievementsStore = useAchievements();

  /**
   * Получает ключ прогресса для текущего пользователя
   */
  const getProgressKey = useCallback(() => {
    const user = localStorage.getItem('cybershield_user');
    if (!user) return null;
    const { username } = JSON.parse(user);
    return `cybershield_progress_${username}`;
  }, []);

  /**
   * Загружает прогресс пользователя из localStorage
   */
  const loadProgress = useCallback(() => {
    try {
      const key = getProgressKey();
      if (!key) {
        console.log('[useProgressSync] No user logged in');
        return null;
      }

      const savedProgress = localStorage.getItem(key);
      if (!savedProgress) {
        console.log('[useProgressSync] No progress found, starting fresh');
        return null;
      }

      const progress = JSON.parse(savedProgress);
      console.log('[useProgressSync] Progress loaded:', progress);
      
      // Применяем загруженный прогресс к игре
      applyLoadedProgress(progress);
      
      return progress;
    } catch (error) {
      console.error('[useProgressSync] Error loading progress:', error);
      return null;
    }
  }, [getProgressKey]);

  /**
   * Применяет загруженный прогресс к состоянию игры
   */
  const applyLoadedProgress = useCallback((progress: any) => {
    try {
      // Восстанавливаем достижения
      if (progress.unlocked_achievements) {
        const unlockedIds = Array.isArray(progress.unlocked_achievements) 
          ? progress.unlocked_achievements
          : JSON.parse(progress.unlocked_achievements);
        achievementsStore.applyUnlockedAchievements?.(unlockedIds);
      }

      console.log('[useProgressSync] Progress applied to game state');
    } catch (error) {
      console.error('[useProgressSync] Error applying progress:', error);
    }
  }, [achievementsStore]);

  /**
   * Сохраняет прогресс в localStorage
   */
  const saveProgress = useCallback((data: any) => {
    try {
      const key = getProgressKey();
      if (!key) {
        console.warn('[useProgressSync] No user logged in, cannot save progress');
        return null;
      }

      const existingProgress = localStorage.getItem(key);
      const progress = existingProgress ? JSON.parse(existingProgress) : {};
      
      const updatedProgress = {
        ...progress,
        ...data,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(updatedProgress));
      console.log('[useProgressSync] Progress saved:', updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error('[useProgressSync] Error saving progress:', error);
      return null;
    }
  }, [getProgressKey]);

  /**
   * Сохраняет прогресс после завершения миссии
   */
  const saveMissionProgress = useCallback((missionData: any) => {
    try {
      const key = getProgressKey();
      if (!key) {
        console.warn('[useProgressSync] No user logged in');
        return null;
      }

      const existingProgressStr = localStorage.getItem(key) || '{}';
      const progress = JSON.parse(existingProgressStr);

      const updatedProgress = {
        ...progress,
        total_missions_completed: (progress.total_missions_completed || 0) + 1,
        total_score: (progress.total_score || 0) + (missionData.points || 100),
        total_commands_executed: (progress.total_commands_executed || 0) + (missionData.commandCount || 0),
        total_errors: (progress.total_errors || 0) + (missionData.errorCount || 0),
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(updatedProgress));
      console.log('[useProgressSync] Mission progress saved:', updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error('[useProgressSync] Error saving mission progress:', error);
      return null;
    }
  }, [getProgressKey]);

  /**
   * Сохраняет достижение в localStorage
   */
  const saveAchievement = useCallback((achievementId: string) => {
    try {
      const key = getProgressKey();
      if (!key) {
        console.warn('[useProgressSync] No user logged in');
        return null;
      }

      const existingProgressStr = localStorage.getItem(key) || '{}';
      const progress = JSON.parse(existingProgressStr);

      const unlockedAchievements = Array.isArray(progress.unlocked_achievements)
        ? progress.unlocked_achievements
        : progress.unlocked_achievements 
          ? JSON.parse(progress.unlocked_achievements)
          : [];

      if (!unlockedAchievements.includes(achievementId)) {
        unlockedAchievements.push(achievementId);
      }

      const updatedProgress = {
        ...progress,
        unlocked_achievements: unlockedAchievements,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(updatedProgress));
      console.log('[useProgressSync] Achievement saved:', achievementId);
      return updatedProgress;
    } catch (error) {
      console.error('[useProgressSync] Error saving achievement:', error);
      return null;
    }
  }, [getProgressKey]);

  return {
    loadProgress,
    applyLoadedProgress,
    saveProgress,
    saveMissionProgress,
    saveAchievement,
  };
};
