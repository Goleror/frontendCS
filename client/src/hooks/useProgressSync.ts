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
 * 
 * Сохраняет:
 * - Статистику (очки, миссии, команды, ошибки)
 * - Открытые достижения
 * - Состояние игры
 */
export const useProgressSync = () => {
  const gameEngine = useGameEngine();
  const achievementsStore = useAchievements();

  /**
   * Получает ключ прогресса для текущего пользователя
   */
  const getProgressKey = useCallback(() => {
    try {
      const user = localStorage.getItem('cybershield_user');
      if (!user) return null;
      const { username } = JSON.parse(user);
      return `cybershield_progress_${username}`;
    } catch (e) {
      console.error('[useProgressSync] Error getting progress key:', e);
      return null;
    }
  }, []);

  /**
   * Получает общий ключ данных игры для текущего пользователя
   */
  const getGameDataKey = useCallback(() => {
    try {
      const user = localStorage.getItem('cybershield_user');
      if (!user) return null;
      const { username } = JSON.parse(user);
      return `cybershield_game_${username}_data`;
    } catch (e) {
      console.error('[useProgressSync] Error getting game data key:', e);
      return null;
    }
  }, []);

  /**
   * Загружает прогресс пользователя из localStorage
   */
  const loadProgress = useCallback((): UserProgress | null => {
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

      // Восстанавливаем статистику команд и ошибок, если есть
      if (progress.total_commands_executed !== undefined || progress.total_errors !== undefined) {
        gameEngine.applyCommandStats?.(
          progress.total_commands_executed || 0,
          progress.total_errors || 0
        );
      }

      // Восстанавливаем завершенные миссии
      if (progress.total_missions_completed !== undefined && progress.total_missions_completed > 0) {
        gameEngine.applyCompletedMissions?.(progress.total_missions_completed);
      }

      console.log('[useProgressSync] Progress applied to game state');
    } catch (error) {
      console.error('[useProgressSync] Error applying progress:', error);
    }
  }, [achievementsStore, gameEngine]);

  /**
   * Сохраняет прогресс в localStorage
   */
  const saveProgress = useCallback((data: Partial<UserProgress>) => {
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

  /**
   * Сохраняет полное состояние игры (терминал, миссии, статистика)
   */
  const saveFullGameState = useCallback(() => {
    try {
      const gameDataKey = getGameDataKey();
      if (!gameDataKey) {
        console.warn('[useProgressSync] No user logged in');
        return false;
      }

      const missionsCompleted = gameEngine.missions.filter(m => m.completed).length;
      const achievements = achievementsStore.achievements || [];
      const unlockedAchievementIds = achievements
        .filter((a: any) => a.unlocked)
        .map((a: any) => a.id);

      const gameState = {
        total_score: missionsCompleted * 100,
        total_missions_completed: missionsCompleted,
        total_commands_executed: gameEngine.commandCount || 0,
        total_errors: gameEngine.errorCount || 0,
        unlocked_achievements: unlockedAchievementIds,
        gameCompleted: gameEngine.gameCompleted || false,
        completionTime: gameEngine.gameStartTime ? Date.now() - gameEngine.gameStartTime : 0,
        saved_at: new Date().toISOString()
      };

      localStorage.setItem(gameDataKey, JSON.stringify(gameState));
      console.log('[useProgressSync] Full game state saved:', gameState);
      return true;
    } catch (error) {
      console.error('[useProgressSync] Error saving full game state:', error);
      return false;
    }
  }, [gameEngine, achievementsStore, getGameDataKey]);

  /**
   * Загружает полное состояние игры из localStorage
   */
  const loadFullGameState = useCallback(() => {
    try {
      const gameDataKey = getGameDataKey();
      if (!gameDataKey) {
        console.log('[useProgressSync] No user logged in');
        return null;
      }

      const savedState = localStorage.getItem(gameDataKey);
      if (!savedState) {
        console.log('[useProgressSync] No full game state found');
        return null;
      }

      const state = JSON.parse(savedState);
      console.log('[useProgressSync] Full game state loaded:', state);
      return state;
    } catch (error) {
      console.error('[useProgressSync] Error loading full game state:', error);
      return null;
    }
  }, [getGameDataKey]);

  /**
   * Очищает все данные прогресса
   */
  const clearProgress = useCallback(() => {
    try {
      const progressKey = getProgressKey();
      const gameDataKey = getGameDataKey();
      
      if (progressKey) localStorage.removeItem(progressKey);
      if (gameDataKey) localStorage.removeItem(gameDataKey);
      
      console.log('[useProgressSync] Progress cleared');
      return true;
    } catch (error) {
      console.error('[useProgressSync] Error clearing progress:', error);
      return false;
    }
  }, [getProgressKey, getGameDataKey]);

  return {
    loadProgress,
    applyLoadedProgress,
    saveProgress,
    saveMissionProgress,
    saveAchievement,
    saveFullGameState,
    loadFullGameState,
    clearProgress,
  };
};
