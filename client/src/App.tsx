import { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { CyberDeck } from './components/CyberDeck';
import { SoundToggle } from './components/SoundToggle';
import { AchievementPopup } from './components/AchievementPopup';
import { VictoryModal } from './components/VictoryModal';
import { AuthPage } from './components/AuthPage';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { AdminPanel } from './components/AdminPanel';
import { useMissionSound } from './hooks/useMissionSound';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import { useGameEngine } from './hooks/useGameEngine';
import { useProgressSync } from './hooks/useProgressSync';
import { useAutoSaveProgress } from './hooks/useAutoSaveProgress';
import { useInitializeGameProgress } from './hooks/useInitializeGameProgress';

// Constants for localStorage - ТОЛЬКО для gameMode, НЕ для прогресса
const GAME_STATE_KEY = 'gameState_ui';
const GAME_STATE_VERSION = 1;

interface GameState {
  version: number;
  gameMode: 'menu' | 'admin' | 'game-singleplayer' | 'multiplayer-lobby' | 'game-multiplayer';
  multiplayerRoom: string | null;
  playerTeam: 'red' | 'blue' | null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[APP] Component mounted, checking auth...");
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("[APP] Fetching /api/auth/me...");
      const response = await fetch('/api/auth/me');
      console.log("[APP] Auth check response status:", response.status);
      if (response.ok) {
        const user = await response.json();
        console.log("[APP] User authenticated:", user);
        setUsername(user.username);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("[APP] Auth check error:", err);
      // Not authenticated
    } finally {
      console.log("[APP] Setting loading to false");
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUsername: string) => {
    setUsername(authUsername);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUsername('');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-cyan-400">Инициализация системы...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <GameApp username={username} onLogout={handleLogout} />;
}

interface GameAppProps {
  username: string;
  onLogout: () => void;
}

function GameApp({ username, onLogout }: GameAppProps) {
  // Функция для загрузки состояния из localStorage
  const loadGameState = (): GameState => {
    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as GameState;
        if (state.version === GAME_STATE_VERSION) {
          console.log('[GameApp] Loaded game state from localStorage:', state);
          return state;
        }
      }
    } catch (e) {
      console.error('[GameApp] Error loading game state:', e);
    }
    return {
      version: GAME_STATE_VERSION,
      gameMode: 'menu',
      multiplayerRoom: null,
      playerTeam: null,
    };
  };

  // Функция для сохранения состояния в localStorage
  const saveGameState = (state: Partial<GameState>) => {
    try {
      const current = loadGameState();
      const updated = { ...current, ...state };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(updated));
      console.log('[GameApp] Saved game state to localStorage:', updated);
    } catch (e) {
      console.error('[GameApp] Error saving game state:', e);
    }
  };

  const initialState = loadGameState();
  const [gameMode, setGameMode] = useState<'menu' | 'admin' | 'game-singleplayer' | 'multiplayer-lobby' | 'game-multiplayer'>(initialState.gameMode as any);
  const [multiplayerRoom, setMultiplayerRoom] = useState<string | null>(initialState.multiplayerRoom);
  const [playerTeam, setPlayerTeam] = useState<'red' | 'blue' | null>(initialState.playerTeam);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useMissionSound();
  const { newAchievement, clearNewAchievement } = useAchievementTracker();
  const { gameCompleted, getGameStats } = useGameEngine();
  const { loadProgress } = useProgressSync();
  const { loadProgressFromServer } = useInitializeGameProgress();
  useAutoSaveProgress(); // Автоматическое сохранение прогресса
  const [showVictory, setShowVictory] = useState(false);
  const [gameStats, setGameStats] = useState({ completionTimeMs: 0, commandCount: 0, errorCount: 0 });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Проверяем, является ли пользователь админом
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    checkAdmin();
  }, []);

  // Загружаем прогресс с сервера при входе в одиночную игру
  useEffect(() => {
    if (gameMode === 'game-singleplayer') {
      console.log('[App] Входим в одиночную игру - загружаем прогресс');
      setIsLoadingProgress(true);
      loadProgressFromServer().then(() => {
        setIsLoadingProgress(false);
      });
    }
  }, [gameMode, loadProgressFromServer]);

  useEffect(() => {
    if (gameCompleted && !showVictory) {
      const stats = getGameStats();
      setGameStats(stats);
      setShowVictory(true);
    }
  }, [gameCompleted]);

  const handleMultiplayerStart = (roomCode: string, team: 'red' | 'blue') => {
    setMultiplayerRoom(roomCode);
    setPlayerTeam(team);
    setGameMode('game-multiplayer');
    saveGameState({
      gameMode: 'game-multiplayer',
      multiplayerRoom: roomCode,
      playerTeam: team,
    });
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    setMultiplayerRoom(null);
    setPlayerTeam(null);
    saveGameState({
      gameMode: 'menu',
      multiplayerRoom: null,
      playerTeam: null,
    });
  };

  // Сохраняем состояние когда меняется gameMode
  useEffect(() => {
    if (gameMode !== 'menu') {
      saveGameState({
        gameMode,
        multiplayerRoom,
        playerTeam,
      });
    } else {
      saveGameState({ gameMode: 'menu' });
    }
  }, [gameMode]);

  // Show admin panel
  if (gameMode === 'admin') {
    return (
      <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono overflow-hidden">
        <div className="absolute top-4 right-4 z-50 text-xs text-cyan-400 flex items-center gap-4">
          <span>Админ: <span className="text-yellow-400 font-bold">{username}</span></span>
          <button
            onClick={() => setGameMode('menu')}
            className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded hover:bg-yellow-600/30 transition text-yellow-400 text-xs font-mono"
          >
            [В МЕНЮ]
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded hover:bg-red-600/30 transition text-red-400 text-xs font-mono"
          >
            [ВЫХОД]
          </button>
        </div>
        <div className="pt-12">
          <AdminPanel onBack={() => setGameMode('menu')} />
        </div>
      </div>
    );
  }

  // Show main menu
  if (gameMode === 'menu') {
    return (
      <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono flex flex-col items-center justify-center gap-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">NEWARCH</h1>
          <p className="text-sm text-green-400/80">Выберите режим игры</p>
        </div>
        
        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => setGameMode('game-singleplayer')}
            className="px-8 py-4 bg-cyan-600/20 border border-cyan-500 rounded hover:bg-cyan-600/30 transition text-cyan-400 text-lg font-mono hover:shadow-lg hover:shadow-cyan-500/30"
          >
            [ОДИНОЧНАЯ ИГРА]
          </button>
          
          <button
            onClick={() => setGameMode('multiplayer-lobby')}
            className="px-8 py-4 bg-green-600/20 border border-green-500 rounded hover:bg-green-600/30 transition text-green-400 text-lg font-mono hover:shadow-lg hover:shadow-green-500/30"
          >
            [МУЛЬТИПЛЕЕР]
          </button>

          {isAdmin && (
            <button
              onClick={() => setGameMode('admin')}
              className="px-8 py-4 bg-yellow-600/20 border border-yellow-500 rounded hover:bg-yellow-600/30 transition text-yellow-400 text-lg font-mono hover:shadow-lg hover:shadow-yellow-500/30"
            >
              [АДМИНИСТРИРОВАНИЕ]
            </button>
          )}
        </div>
        
        <div className="absolute top-4 right-4 text-xs text-cyan-400 flex items-center gap-4">
          <span>Агент: <span className="text-green-400 font-bold">{username}</span></span>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded hover:bg-red-600/30 transition text-red-400 text-xs font-mono"
          >
            [ВЫХОД]
          </button>
        </div>
      </div>
    );
  }

  // Show multiplayer lobby
  if (gameMode === 'multiplayer-lobby') {
    return (
      <MultiplayerLobby
        username={username}
        onGameStart={handleMultiplayerStart}
        onBackToMenu={handleBackToMenu}
      />
    );
  }
  
  // Show loading screen while progress is being loaded for singleplayer
  if (gameMode === 'game-singleplayer' && isLoadingProgress) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-cyan-400">Загружаю ваш прогресс с сервера...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0f] text-green-400 font-mono">
      {/* User info header */}
      <div className="absolute top-2 right-4 z-50 text-xs text-cyan-400 flex items-center gap-4">
        <span>Агент: <span className="text-green-400 font-bold">{username}</span></span>
        <button
          onClick={handleBackToMenu}
          className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded hover:bg-yellow-600/30 transition text-yellow-400 text-xs font-mono"
        >
          [В МЕНЮ]
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded hover:bg-red-600/30 transition text-red-400 text-xs font-mono"
        >
          [ВЫХОД]
        </button>
      </div>

      <div className="h-full w-full p-4 flex gap-4">
        <div className="w-[65%] h-full">
          <Terminal />
        </div>
        
        <div className="w-[35%] h-full">
          <CyberDeck />
        </div>
      </div>
      
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
      <VictoryModal
        isOpen={showVictory}
        onClose={() => setShowVictory(false)}
        onSubmit={() => {
          // Сохраняем прогресс на сервер при завершении игры
          loadProgress();
          setShowVictory(false);
        }}
        completionTimeMs={gameStats.completionTimeMs}
        commandCount={gameStats.commandCount}
        errorCount={gameStats.errorCount}
      />
      <SoundToggle />
      <div className="crt-overlay screen-flicker"></div>
      <div className="crt-vignette"></div>
    </div>
  );
}

export default App;
