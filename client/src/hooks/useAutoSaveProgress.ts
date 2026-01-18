import { useEffect, useRef } from 'react';
import { useGameEngine } from './useGameEngine';
import { useAchievements } from './useAchievements';

const API_BASE = '/api';

export function useAutoSaveProgress() {
  const gameEngine = useGameEngine();
  const achievements = useAchievements();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  const saveProgressToServer = async () => {
    try {
      const currentTime = Date.now();
      
      // Get current state from stores
      const missionsCompleted = gameEngine.missions.filter(m => m.completed).length;
      const commands = gameEngine.commandCount;
      const errors = gameEngine.errorCount;
      const unlockedAchievementIds = achievements.achievements
        .filter(a => a.unlocked)
        .map(a => a.id);

      // Only save if something changed or if it's been more than 30 seconds
      if (currentTime - lastSaveRef.current < 5000) {
        return; // Prevent duplicate saves within 5 seconds
      }

      lastSaveRef.current = currentTime;

      const response = await fetch(`${API_BASE}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          total_score: missionsCompleted * 100,
          total_missions_completed: missionsCompleted,
          total_commands_executed: commands,
          total_errors: errors,
          unlocked_achievements: JSON.stringify(unlockedAchievementIds),
        }),
      });

      if (!response.ok && response.status !== 404) {
        console.error('Failed to save progress:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  useEffect(() => {
    // Auto-save every 30 seconds
    saveIntervalRef.current = setInterval(() => {
      saveProgressToServer();
    }, 30000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [gameEngine.missions, gameEngine.commandCount, gameEngine.errorCount, achievements.achievements]);

  // Save on mission completion (with debounce)
  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save: wait 2 seconds after mission completion before saving
    saveTimeoutRef.current = setTimeout(() => {
      saveProgressToServer();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [gameEngine.missions, achievements.achievements]);

  return { saveProgressToServer };
}
