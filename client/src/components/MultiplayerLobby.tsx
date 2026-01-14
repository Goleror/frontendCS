import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Copy, Play, Users } from 'lucide-react';

interface Player {
  playerId: number;
  team: 'red' | 'blue';
  score: number;
  isReady: boolean;
}

interface TeamInfo {
  players: Player[];
  score: number;
}

interface MultiplayerLobbyProps {
  username: string;
  onGameStart: (roomCode: string, team: 'red' | 'blue') => void;
  onBackToMenu: () => void;
}

export function MultiplayerLobby({ username, onGameStart, onBackToMenu }: MultiplayerLobbyProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join' | 'waiting'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [playerTeam, setPlayerTeam] = useState<'red' | 'blue' | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create room
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPlayers: 4 }),
      });
      const data = await response.json();
      setRoomCode(data.roomCode);
      setMode('waiting');
      // Fetch room info
      const roomResponse = await fetch(`/api/multiplayer/rooms/${data.roomCode}`);
      const roomData = await roomResponse.json();
      setCurrentRoom(roomData);
      setPlayerTeam('red'); // Creator gets red by default
    } catch (error) {
      console.error('Failed to create room:', error);
    }
    setLoading(false);
  };

  // Join room
  const handleJoinRoom = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/multiplayer/rooms/${code}/join`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setRoomCode(data.roomCode);
        setPlayerTeam(data.team);
        setMode('waiting');
        // Fetch room info
        const roomResponse = await fetch(`/api/multiplayer/rooms/${code}`);
        const roomData = await roomResponse.json();
        setCurrentRoom(roomData);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
    setLoading(false);
  };

  // Poll for room updates
  useEffect(() => {
    if (mode !== 'waiting' || !roomCode) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/multiplayer/rooms/${roomCode}`);
        const data = await response.json();
        setCurrentRoom(data);
      } catch (error) {
        console.error('Failed to fetch room:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, roomCode]);

  // Copy room code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start game
  const handleStartGame = () => {
    if (playerTeam) {
      onGameStart(roomCode, playerTeam);
    }
  };

  if (mode === 'select') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-cyan-500 p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">CyberShield Multiplayer</h1>
          
          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
            >
              <Users className="mr-2" />
              Создать комнату
            </Button>

            <Button
              onClick={() => setMode('join')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold"
            >
              <Users className="mr-2" />
              Присоединиться
            </Button>

            <Button
              onClick={onBackToMenu}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-6 text-lg font-bold"
            >
              Назад в меню
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-cyan-500 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Создать комнату</h1>
          
          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold mb-4"
          >
            {loading ? 'Загрузка...' : 'Создать'}
          </Button>

          <Button
            onClick={() => setMode('select')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2"
          >
            Назад
          </Button>
        </Card>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-cyan-500 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Присоединиться к комнате</h1>
          
          <Input
            placeholder="Введите код комнаты"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="mb-4 bg-slate-700 border-cyan-500 text-white placeholder-gray-400"
            maxLength={6}
          />

          <Button
            onClick={() => handleJoinRoom(roomCode)}
            disabled={loading || !roomCode}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold mb-4"
          >
            {loading ? 'Загрузка...' : 'Присоединиться'}
          </Button>

          <Button
            onClick={() => {
              setMode('select');
              setRoomCode('');
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2"
          >
            Назад
          </Button>
        </Card>
      </div>
    );
  }

  if (mode === 'waiting' && currentRoom) {
    const redTeam = currentRoom.redTeam?.players || [];
    const blueTeam = currentRoom.blueTeam?.players || [];
    const redScore = currentRoom.redTeam?.score || 0;
    const blueScore = currentRoom.blueTeam?.score || 0;

    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          {/* Header */}
          <Card className="bg-slate-800 border-cyan-500 p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-cyan-400">Готовы к бою?</h1>
              <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded border border-cyan-500">
                <span className="text-cyan-400 text-sm">Код:</span>
                <span className="text-white font-mono text-lg font-bold">{roomCode}</span>
                <button onClick={handleCopyCode} className="text-cyan-400 hover:text-cyan-300">
                  <Copy size={20} />
                </button>
                {copied && <span className="text-green-400 text-xs">Скопировано!</span>}
              </div>
            </div>

            {/* Team Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-900/30 border border-red-600 rounded p-4">
                <h3 className="text-red-400 text-lg font-bold mb-2">Красная команда</h3>
                <div className="text-4xl font-bold text-red-500">{redScore}</div>
              </div>
              <div className="bg-blue-900/30 border border-blue-600 rounded p-4">
                <h3 className="text-blue-400 text-lg font-bold mb-2">Синяя команда</h3>
                <div className="text-4xl font-bold text-blue-500">{blueScore}</div>
              </div>
            </div>
          </Card>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            {/* Red Team */}
            <Card className="bg-red-900/20 border-red-600 p-4">
              <h3 className="text-red-400 text-lg font-bold mb-4">Красная команда</h3>
              <div className="space-y-2">
                {redTeam.length > 0 ? (
                  redTeam.map((player: any, idx: number) => (
                    <div key={idx} className="bg-red-800/40 px-3 py-2 rounded border border-red-700 text-red-200 flex justify-between">
                      <span>Игрок {idx + 1}</span>
                      <span className="text-red-400">{player.isReady ? '✓' : '○'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">Ожидание игроков...</div>
                )}
              </div>
            </Card>

            {/* Blue Team */}
            <Card className="bg-blue-900/20 border-blue-600 p-4">
              <h3 className="text-blue-400 text-lg font-bold mb-4">Синяя команда</h3>
              <div className="space-y-2">
                {blueTeam.length > 0 ? (
                  blueTeam.map((player: any, idx: number) => (
                    <div key={idx} className="bg-blue-800/40 px-3 py-2 rounded border border-blue-700 text-blue-200 flex justify-between">
                      <span>Игрок {idx + 1}</span>
                      <span className="text-blue-400">{player.isReady ? '✓' : '○'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">Ожидание игроков...</div>
                )}
              </div>
            </Card>
          </div>

          {/* Current player info */}
          <Card className={`p-4 border-2 ${playerTeam === 'red' ? 'bg-red-900/30 border-red-500' : 'bg-blue-900/30 border-blue-500'}`}>
            <p className={`text-center font-bold text-lg ${playerTeam === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              Вы в {playerTeam === 'red' ? '🔴 Красной' : '🔵 Синей'} команде
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleStartGame}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
            >
              <Play className="mr-2" />
              Начать игру
            </Button>
            <Button
              onClick={onBackToMenu}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
            >
              Выход
            </Button>
          </div>

          {/* Player count */}
          <div className="text-center text-cyan-400 text-sm">
            Игроков: {redTeam.length + blueTeam.length} / {currentRoom.maxPlayers}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
