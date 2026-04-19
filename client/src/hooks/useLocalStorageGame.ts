import { useCallback, useEffect } from 'react';
import type { TerminalLine, Mission } from './useGameEngine';
import type { ProceduralMission } from './useProceduralMissions';

interface GameDataToSave {
  terminalHistory?: TerminalLine[];
  commandHistory?: string[];
  currentPath?: string;
  missions?: Mission[];
  currentMission?: number;
  gameCompleted?: boolean;
  gameStartTime?: number;
  commandCount?: number;
  errorCount?: number;
  processedMissions?: ProceduralMission[];
  currentProceduralMission?: ProceduralMission | null;
  proceduralCompletedCount?: number;
}

/**
 * Хук для работы с localStorage игры
 * Предоставляет единый интерфейс для сохранения и загрузки всех данных игры
 */
export const useLocalStorageGame = () => {
  /**
   * Получает ключ хранилища для текущего пользователя
   */
  const getStorageKey = useCallback((suffix: string): string | null => {
    try {
      const userStr = localStorage.getItem('cybershield_user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return `cybershield_game_${user.username}_${suffix}`;
    } catch (error) {
      console.error('[useLocalStorageGame] Error getting storage key:', error);
      return null;
    }
  }, []);

  /**
   * Сохраняет данные в localStorage
   */
  const saveGameData = useCallback((data: GameDataToSave) => {
    try {
      const userKey = getStorageKey('data');
      if (!userKey) {
        console.warn('[useLocalStorageGame] No user found, cannot save data');
        return false;
      }

      const existingData = localStorage.getItem(userKey);
      const currentData = existingData ? JSON.parse(existingData) : {};

      const updatedData = {
        ...currentData,
        ...data,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(userKey, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('[useLocalStorageGame] Error saving game data:', error);
      return false;
    }
  }, [getStorageKey]);

  /**
   * Загружает все данные из localStorage
   */
  const loadGameData = useCallback((): GameDataToSave | null => {
    try {
      const userKey = getStorageKey('data');
      if (!userKey) {
        console.log('[useLocalStorageGame] No user found');
        return null;
      }

      const data = localStorage.getItem(userKey);
      if (!data) {
        console.log('[useLocalStorageGame] No saved game data found');
        return null;
      }

      const parsed = JSON.parse(data);
      console.log('[useLocalStorageGame] Game data loaded:', parsed);
      return parsed;
    } catch (error) {
      console.error('[useLocalStorageGame] Error loading game data:', error);
      return null;
    }
  }, [getStorageKey]);

  /**
   * Сохраняет историю терминала
   */
  const saveTerminalHistory = useCallback((history: TerminalLine[]) => {
    return saveGameData({ terminalHistory: history });
  }, [saveGameData]);

  /**
   * Загружает историю терминала
   */
  const loadTerminalHistory = useCallback((): TerminalLine[] => {
    const data = loadGameData();
    return data?.terminalHistory || [];
  }, [loadGameData]);

  /**
   * Сохраняет историю команд
   */
  const saveCommandHistory = useCallback((history: string[]) => {
    return saveGameData({ commandHistory: history });
  }, [saveGameData]);

  /**
   * Загружает историю команд
   */
  const loadCommandHistory = useCallback((): string[] => {
    const data = loadGameData();
    return data?.commandHistory || [];
  }, [loadGameData]);

  /**
   * Сохраняет текущий путь
   */
  const saveCurrentPath = useCallback((path: string) => {
    return saveGameData({ currentPath: path });
  }, [saveGameData]);

  /**
   * Загружает текущий путь
   */
  const loadCurrentPath = useCallback((): string => {
    const data = loadGameData();
    return data?.currentPath || '/';
  }, [loadGameData]);

  /**
   * Сохраняет состояние миссий
   */
  const saveMissionsState = useCallback((missions: Mission[], currentMission: number, gameCompleted: boolean) => {
    return saveGameData({
      missions,
      currentMission,
      gameCompleted,
    });
  }, [saveGameData]);

  /**
   * Загружает состояние миссий
   */
  const loadMissionsState = useCallback((): { missions: Mission[] | null; currentMission: number; gameCompleted: boolean } => {
    const data = loadGameData();
    return {
      missions: data?.missions || null,
      currentMission: data?.currentMission || 0,
      gameCompleted: data?.gameCompleted || false,
    };
  }, [loadGameData]);

  /**
   * Сохраняет статистику игры
   */
  const saveGameStats = useCallback((startTime: number, commandCount: number, errorCount: number) => {
    return saveGameData({
      gameStartTime: startTime,
      commandCount,
      errorCount,
    });
  }, [saveGameData]);

  /**
   * Загружает статистику игры
   */
  const loadGameStats = useCallback((): { startTime: number; commandCount: number; errorCount: number } => {
    const data = loadGameData();
    return {
      startTime: data?.gameStartTime || Date.now(),
      commandCount: data?.commandCount || 0,
      errorCount: data?.errorCount || 0,
    };
  }, [loadGameData]);

  /**
   * Сохраняет состояние бонусных миссий
   */
  const saveBonusMissionsState = useCallback((
    missions: ProceduralMission[],
    currentMission: ProceduralMission | null,
    completedCount: number
  ) => {
    return saveGameData({
      processedMissions: missions,
      currentProceduralMission: currentMission,
      proceduralCompletedCount: completedCount,
    });
  }, [saveGameData]);

  /**
   * Загружает состояние бонусных миссий
   */
  const loadBonusMissionsState = useCallback(
    (): { missions: ProceduralMission[]; currentMission: ProceduralMission | null; completedCount: number } => {
      const data = loadGameData();
      return {
        missions: data?.processedMissions || [],
        currentMission: data?.currentProceduralMission || null,
        completedCount: data?.proceduralCompletedCount || 0,
      };
    },
    [loadGameData]
  );

  /**
   * Очищает все сохраненные данные игры
   */
  const clearGameData = useCallback(() => {
    try {
      const userKey = getStorageKey('data');
      if (userKey) {
        localStorage.removeItem(userKey);
        console.log('[useLocalStorageGame] Game data cleared');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useLocalStorageGame] Error clearing game data:', error);
      return false;
    }
  }, [getStorageKey]);

  return {
    loadGameData,
    saveGameData,
    saveTerminalHistory,
    loadTerminalHistory,
    saveCommandHistory,
    loadCommandHistory,
    saveCurrentPath,
    loadCurrentPath,
    saveMissionsState,
    loadMissionsState,
    saveGameStats,
    loadGameStats,
    saveBonusMissionsState,
    loadBonusMissionsState,
    clearGameData,
  };
};
