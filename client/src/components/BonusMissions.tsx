import { Zap, Trophy, RefreshCw, Star } from 'lucide-react';
import { useProceduralMissions, ProceduralMission } from '@/hooks/useProceduralMissions';
import { useGameEngine } from '@/hooks/useGameEngine';

function getDifficultyStars(difficulty: 1 | 2 | 3) {
  return Array.from({ length: difficulty }, (_, i) => (
    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
  ));
}

function getDifficultyLabel(difficulty: 1 | 2 | 3) {
  switch (difficulty) {
    case 1: return 'ЛЁГКИЙ';
    case 2: return 'СРЕДНИЙ';
    case 3: return 'СЛОЖНЫЙ';
  }
}

export function BonusMissions() {
  const { missions, currentMission, completedCount, generateMission, resetMissions } = useProceduralMissions();
  const { gameCompleted } = useGameEngine();
  
  const completedMissions = missions.filter(m => m.completed);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">Бонусные миссии</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white/60">Выполнено: <span className="text-yellow-400">{completedCount}</span></span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-cyber">
        {!gameCompleted ? (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-400 font-medium mb-1">Бонусные миссии заблокированы</p>
            <p className="text-sm text-white/60">Завершите основную кампанию, чтобы разблокировать</p>
          </div>
        ) : (
          <>
            {!currentMission && (
              <button
                onClick={generateMission}
                className="w-full p-4 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 transition-all mb-4 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-purple-400 font-medium">Сгенерировать миссию</span>
                </div>
              </button>
            )}
            
            {currentMission && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/30 text-purple-400">
                    АКТИВНО
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {getDifficultyStars(currentMission.difficulty)}
                  </div>
                  <span className="text-xs text-white/40">{getDifficultyLabel(currentMission.difficulty)}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{currentMission.title}</h3>
                <p className="text-sm text-white/60 mb-3">{currentMission.description}</p>
                <div className="p-3 rounded bg-black/40 border border-purple-500/30">
                  <div className="text-xs text-purple-400 mb-1 font-semibold">ЦЕЛЬ:</div>
                  <div className="text-sm text-white/80 whitespace-pre-wrap">{currentMission.objective}</div>
                </div>
              </div>
            )}
            
            {completedMissions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-white/40 mb-2">Завершённые миссии:</div>
                {completedMissions.slice(-5).reverse().map((mission) => (
                  <div
                    key={mission.id}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{mission.title}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {getDifficultyStars(mission.difficulty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {completedCount > 0 && !currentMission && (
              <button
                onClick={resetMissions}
                className="w-full mt-4 p-2 text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Сбросить прогресс бонусных миссий
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
