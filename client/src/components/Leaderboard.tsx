import { useState, useEffect } from 'react';
import { Crown, Clock, Terminal, XCircle, Trophy, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  playerName: string;
  completionTimeMs: number;
  commandCount: number;
  errorCount: number;
  achievementCount: number;
  createdAt: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getRankColor(index: number): string {
  switch (index) {
    case 0: return 'text-yellow-400';
    case 1: return 'text-gray-300';
    case 2: return 'text-amber-600';
    default: return 'text-white/60';
  }
}

function getRankIcon(index: number) {
  if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (index === 1) return <Crown className="w-4 h-4 text-gray-300" />;
  if (index === 2) return <Crown className="w-4 h-4 text-amber-600" />;
  return <span className="w-4 h-4 text-center text-xs text-white/40">{index + 1}</span>;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leaderboard?limit=20');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError('Не удалось загрузить таблицу лидеров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-white">Таблица лидеров</span>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-cyber">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 text-green-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-white/60 p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-white/40" />
            <p>Таблица лидеров пуста</p>
            <p className="text-sm mt-1">Завершите кампанию, чтобы занять первое место!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border transition-all ${
                  index < 3
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${getRankColor(index)}`}>
                      {entry.playerName}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.completionTimeMs)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        {entry.commandCount} команд
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {entry.errorCount} ошибок
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {entry.achievementCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
