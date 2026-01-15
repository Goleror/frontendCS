import { useState } from 'react';
import { Trophy, Clock, Terminal, XCircle, Send, X } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => void;
  completionTimeMs: number;
  commandCount: number;
  errorCount: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VictoryModal({ isOpen, onClose, onSubmit, completionTimeMs, commandCount, errorCount }: VictoryModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { achievements } = useAchievements();
  
  const achievementCount = achievements.filter(a => a.unlocked).length;

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    
    setSubmitting(true);
    try {
      // Get current user info
      const userResponse = await fetch('/api/auth/me');
      const user = userResponse.ok ? await userResponse.json() : null;
      
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          playerName: playerName.trim(),
          completionTimeMs,
          commandCount,
          errorCount,
          achievementCount
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        onSubmit(playerName);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="glass-panel rounded-lg p-6 w-full max-w-md border border-green-500/50 shadow-lg shadow-green-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-xl font-bold text-green-400 glow-text">ПОБЕДА!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-white/5 text-center">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{formatTime(completionTimeMs)}</div>
              <div className="text-xs text-white/50">Время</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 text-center">
              <Terminal className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{commandCount}</div>
              <div className="text-xs text-white/50">Команд</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{errorCount}</div>
              <div className="text-xs text-white/50">Ошибок</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-400">{achievementCount} / {achievements.length}</div>
            <div className="text-xs text-white/50">Достижений</div>
          </div>
        </div>

        {!submitted ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Ваше имя для таблицы лидеров:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите имя..."
                maxLength={20}
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!playerName.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Отправка...' : 'Отправить результат'}
            </button>
          </div>
        ) : (
          <div className="text-center p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Результат отправлен!</p>
            <p className="text-sm text-white/60 mt-1">Проверьте таблицу лидеров</p>
          </div>
        )}
      </div>
    </div>
  );
}
