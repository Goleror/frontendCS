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
 * Хук для синхронизации прогресса с сервером
 * Загружает прогресс при входе в игру и сохраняет при завершении миссий
 */
export const useProgressSync = () => {
  const gameEngine = useGameEngine();
  const achievementsStore = useAchievements();

  /**
   * Загружает прогресс пользователя с сервера
   */
  const loadProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/progress');
      if (!response.ok) {
        if (response.status === 404) {
          console.log('[useProgressSync] No progress found, starting fresh');
          return null;
        }
        throw new Error('Failed to load progress');
      }

      const progress = await response.json();
      console.log('[useProgressSync] Progress loaded:', progress);
      
      // Применяем загруженный прогресс к игре
      applyLoadedProgress(progress);
      
      return progress;
    } catch (error) {
      console.error('[useProgressSync] Error loading progress:', error);
      return null;
    }
  }, []);

  /**
   * Применяет загруженный прогресс к состоянию игры
   */
  const applyLoadedProgress = useCallback((progress: UserProgress) => {
    try {
      // Восстанавливаем достижения
      if (progress.unlocked_achievements) {
        const unlockedIds = JSON.parse(progress.unlocked_achievements);
        achievementsStore.applyUnlockedAchievements(unlockedIds);
      }

      // Восстанавливаем завершенные миссии
      if (progress.total_missions_completed > 0) {
        gameEngine.applyCompletedMissions(progress.total_missions_completed);
      }

      // Восстанавливаем статистику команд
      gameEngine.applyCommandStats(
        progress.total_commands_executed,
        progress.total_errors
      );

      console.log('[useProgressSync] Progress applied to game state');
    } catch (error) {
      console.error('[useProgressSync] Error applying progress:', error);
    }
  }, [gameEngine, achievementsStore]);

  /**
   * Сохраняет прогресс на сервер
   */
  const saveProgress = useCallback(async (data: Partial<UserProgress>) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      const result = await response.json();
      console.log('[useProgressSync] Progress saved:', result);
      return result;
    } catch (error) {
      console.error('[useProgressSync] Error saving progress:', error);
      return null;
    }
  }, []);

  /**
   * Сохраняет прогресс после завершения миссии
   */
  const saveMissionProgress = useCallback(async () => {
    const completedMissions = gameEngine.missions.filter(m => m.completed).length;
    const unlockedAchievements = achievementsStore.achievements
      .filter(a => a.unlocked)
      .map(a => a.id);

    try {
      const response = await fetch('/api/progress/mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: Math.floor(completedMissions / 2) + 1,
          points: completedMissions * 100,
          commandCount: gameEngine.commandCount,
          errorCount: gameEngine.errorCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mission progress');
      }

      const result = await response.json();
      console.log('[useProgressSync] Mission progress saved:', result);
      return result;
    } catch (error) {
      console.error('[useProgressSync] Error saving mission progress:', error);
      return null;
    }
  }, [gameEngine, achievementsStore]);

  /**
   * Сохраняет достижение на сервер
   */
  const saveAchievement = useCallback(async (achievementId: string) => {
    try {
      const response = await fetch('/api/progress/achievement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievementId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save achievement');
      }

      const result = await response.json();
      console.log('[useProgressSync] Achievement saved:', result);
      return result;
    } catch (error) {
      console.error('[useProgressSync] Error saving achievement:', error);
      return null;
    }
  }, []);

  return {
    loadProgress,
    applyLoadedProgress,
    saveProgress,
    saveMissionProgress,
    saveAchievement,
  };
};
