import { useEffect, useRef } from 'react';
import { useGameEngine } from './useGameEngine';
import { useAudio } from '@/lib/stores/useAudio';

export function useMissionSound() {
  const { missions } = useGameEngine();
  const { playSuccess, isInitialized } = useAudio();
  const prevCompletedCount = useRef(0);
  
  useEffect(() => {
    const completedCount = missions.filter(m => m.completed).length;
    
    if (completedCount > prevCompletedCount.current && isInitialized) {
      playSuccess();
    }
    
    prevCompletedCount.current = completedCount;
  }, [missions, playSuccess, isInitialized]);
}
