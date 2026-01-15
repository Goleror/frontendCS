import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameEngine } from './useGameEngine';
import { useAchievements, Achievement } from './useAchievements';

export function useAchievementTracker() {
  const { missions, gameCompleted, terminalHistory } = useGameEngine();
  const { startGame, incrementCommand, incrementError, checkAchievements, gameStartTime } = useAchievements();
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const prevHistoryLength = useRef(terminalHistory.length);
  const prevMissionCount = useRef(0);
  
  useEffect(() => {
    if (!gameStartTime) {
      startGame();
    }
  }, [gameStartTime, startGame]);
  
  useEffect(() => {
    const newLines = terminalHistory.slice(prevHistoryLength.current);
    prevHistoryLength.current = terminalHistory.length;
    
    for (const line of newLines) {
      if (line.type === 'input') {
        incrementCommand();
      } else if (line.type === 'error') {
        incrementError();
      }
    }
  }, [terminalHistory, incrementCommand, incrementError]);
  
  useEffect(() => {
    const completedCount = missions.filter(m => m.completed).length;
    
    if (completedCount > prevMissionCount.current) {
      const newlyUnlocked = checkAchievements(completedCount, gameCompleted);
      
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((achievement, index) => {
          setTimeout(() => {
            setNewAchievement(achievement);
          }, index * 5000);
        });
      }
    }
    
    prevMissionCount.current = completedCount;
  }, [missions, gameCompleted, checkAchievements]);
  
  const clearNewAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);
  
  return { newAchievement, clearNewAchievement };
}
