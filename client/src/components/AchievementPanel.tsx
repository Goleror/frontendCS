import { Trophy, Lock, Check } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

export function AchievementPanel() {
  const { achievements } = useAchievements();
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-white">Достижения</span>
          <span className="ml-auto text-sm text-yellow-400">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-cyber">
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all ${
                achievement.unlocked
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    achievement.unlocked ? 'bg-yellow-500/20' : 'bg-white/10'
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4 text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium truncate ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-white/40'
                      }`}
                    >
                      {achievement.title}
                    </span>
                    {achievement.unlocked && <Check className="w-3 h-3 text-green-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
