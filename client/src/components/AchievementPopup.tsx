import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/hooks/useAchievements';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);
  
  if (!achievement) return null;
  
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="glass-panel rounded-lg p-4 border border-yellow-500/50 bg-black/80 shadow-lg shadow-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-2xl">
            {achievement.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-1">
              <Trophy className="w-4 h-4" />
              ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО
            </div>
            <div className="text-white font-bold">{achievement.title}</div>
            <div className="text-white/60 text-sm">{achievement.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
