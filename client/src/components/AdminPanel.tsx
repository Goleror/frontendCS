import { useState, useEffect } from 'react';
import { Trash2, Edit2, RefreshCw, Users, BookOpen } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

interface User {
  id: number;
  username: string;
  role: 'student' | 'teacher';
  class_code: string | null;
  created_at: string;
}

interface ClassInfo {
  id: number;
  teacher_id: number;
  class_code: string;
  class_name: string;
  created_at: string;
  studentCount: number;
  students: User[];
}

interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  users: User[];
  classes: ClassInfo[];
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'classes'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === 1) {
      alert('Нельзя удалить админа!');
      return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Пользователь удален');
          loadDashboard();
        }
      } catch (err) {
        alert('Ошибка при удалении пользователя');
      }
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот класс?')) {
      try {
        const response = await fetch(`/api/admin/classes/${classId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Класс удален');
          loadDashboard();
        }
      } catch (err) {
        alert('Ошибка при удалении класса');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-cyan-400">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black/50 border-b border-cyan-500/30 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">АДМИН ПАНЕЛЬ</h1>
          <p className="text-xs text-white/60">Управление системой</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded hover:bg-red-600/30 transition text-red-400 text-sm font-mono"
        >
          [ВЫХОД]
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-black/30 border-b border-cyan-500/30 flex">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-4 py-3 border-r border-cyan-500/30 transition flex items-center gap-2 justify-center ${
            activeTab === 'dashboard'
              ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          ПАНЕЛЬ
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-3 border-r border-cyan-500/30 transition flex items-center gap-2 justify-center ${
            activeTab === 'users'
              ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <Users className="w-4 h-4" />
          ПОЛЬЗОВАТЕЛИ ({stats?.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 px-4 py-3 transition flex items-center gap-2 justify-center ${
            activeTab === 'classes'
              ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          КЛАССЫ ({stats?.totalClasses || 0})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                <p className="text-xs text-white/60 mb-2">Всего пользователей</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.totalUsers}</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-xs text-white/60 mb-2">Учителей</p>
                <p className="text-3xl font-bold text-green-400">{stats.totalTeachers}</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-xs text-white/60 mb-2">Учеников</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.totalStudents}</p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-xs text-white/60 mb-2">Классов</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalClasses}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-black/30 border border-cyan-500/30 rounded">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Последние пользователи</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-black/50 rounded text-xs">
                    <div>
                      <p className="text-green-400 font-bold">{user.username}</p>
                      <p className="text-white/60">
                        {user.role === 'teacher' ? '👨‍🏫 Учитель' : '👨‍🎓 Ученик'} • {user.class_code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && stats && (
          <div>
            <div className="mb-4 flex gap-2">
              <button
                onClick={loadDashboard}
                className="px-3 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded hover:bg-cyan-600/30 transition text-cyan-400 text-xs font-mono flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                ОБНОВИТЬ
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {stats.users.map((user) => (
                <div key={user.id} className="p-3 bg-black/30 border border-cyan-500/30 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-green-400 font-bold text-sm">{user.username}</p>
                      <p className="text-xs text-white/60 mt-1">
                        ID: {user.id} • {user.role === 'teacher' ? '👨‍🏫 Учитель' : '👨‍🎓 Ученик'} • Код: {user.class_code || '-'}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{new Date(user.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === 1}
                      className={`px-3 py-2 rounded text-xs font-mono flex items-center gap-1 transition ${
                        user.id === 1
                          ? 'bg-gray-600/20 border border-gray-500/30 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && stats && (
          <div>
            <div className="mb-4 flex gap-2">
              <button
                onClick={loadDashboard}
                className="px-3 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded hover:bg-cyan-600/30 transition text-cyan-400 text-xs font-mono flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                ОБНОВИТЬ
              </button>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {stats.classes.map((cls) => (
                <div key={cls.id} className="p-4 bg-black/30 border border-cyan-500/30 rounded">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-cyan-400 font-bold text-sm">{cls.class_name}</p>
                      <p className="text-xs text-green-400 font-mono mt-1">Код: {cls.class_code}</p>
                      <p className="text-xs text-white/60 mt-1">
                        Учитель ID: {cls.teacher_id} • Учеников: {cls.studentCount}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="px-3 py-2 bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 transition text-red-400 text-xs font-mono flex items-center gap-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      Удалить
                    </button>
                  </div>

                  {cls.students.length > 0 && (
                    <div className="mt-3 pl-4 border-l border-cyan-500/30 space-y-1">
                      <p className="text-xs text-white/60 font-semibold mb-2">Ученики:</p>
                      {cls.students.map((student) => (
                        <p key={student.id} className="text-xs text-white/60">
                          • {student.username}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
