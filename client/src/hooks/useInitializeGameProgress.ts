import { useEffect, useCallback } from 'react';
import { useGameEngine } from './useGameEngine';
import { useAchievements } from './useAchievements';

interface UserProgress {
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
 * Хук для инициализации прогресса при входе в игру
 * Загружает прогресс с сервера ДО начала игры
 * НЕ использует localStorage
 */
export function useInitializeGameProgress() {
  /**
   * Загружает прогресс с сервера и применяет его
   */
  const loadProgressFromServer = useCallback(async () => {
    // Get fresh reference to avoid circular dependency
    const engine = useGameEngine.getState();
    
    try {
      console.log('[useInitializeGameProgress] Загружаю прогресс с сервера...');
      
      const response = await fetch('/api/progress', {
        credentials: 'include',
      });

      if (response.status === 404) {
        console.log('[useInitializeGameProgress] Прогресс не найден - начинаем с нуля');
        // Это нормально - новый пользователь
        engine.resetGame();
        return null;
      }

      if (!response.ok) {
        throw new Error(`Ошибка загрузки прогресса: ${response.status}`);
      }

      const progress: UserProgress = await response.json();
      console.log('[useInitializeGameProgress] Прогресс загружен:', progress);

      // Применяем прогресс к игре
      applyProgressToGame(progress);

      return progress;
    } catch (error) {
      console.error('[useInitializeGameProgress] Ошибка при загрузке прогресса:', error);
      // В случае ошибки - начинаем с нуля
      engine.resetGame();
      return null;
    }
  }, []);

  /**
   * Применяет загруженный прогресс к игре
   */
  const applyProgressToGame = useCallback((progress: UserProgress) => {
    // Get fresh reference to avoid circular dependency
    const engine = useGameEngine.getState();
    const achievements = useAchievements.getState();
    
    try {
      // Восстанавливаем достижения
      if (progress.unlocked_achievements) {
        try {
          const unlockedIds = JSON.parse(progress.unlocked_achievements);
          console.log('[useInitializeGameProgress] Применяю достижения:', unlockedIds);
          achievements.applyUnlockedAchievements(unlockedIds);
        } catch (e) {
          console.warn('[useInitializeGameProgress] Ошибка парсинга достижений:', e);
        }
      }

      // Восстанавливаем статистику
      console.log('[useInitializeGameProgress] Применяю статистику:', {
        missions: progress.total_missions_completed,
        commands: progress.total_commands_executed,
        errors: progress.total_errors,
      });

      engine.applyCommandStats(
        progress.total_commands_executed,
        progress.total_errors
      );

      console.log('[useInitializeGameProgress] Прогресс успешно применён');
    } catch (error) {
      console.error('[useInitializeGameProgress] Ошибка при применении прогресса:', error);
    }
  }, []);

  return {
    loadProgressFromServer,
  };
}
