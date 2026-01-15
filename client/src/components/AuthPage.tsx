import { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

export function AuthPage({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        onAuthSuccess(user.username);
      }
    } catch (err) {
      // Not authenticated, show auth form
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Введите имя пользователя и пароль');
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (password.length < 6) {
        setError('Пароль должен быть минимум 6 символов');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.ok) {
        const user = await response.json();
        setSuccess(`${isLogin ? 'Вход' : 'Регистрация'} успешен!`);
        // Сразу переходим в аккаунт, без задержки
        onAuthSuccess(user.username);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка аутентификации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-green-400 font-mono flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Auth form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="border border-cyan-500/50 rounded-lg bg-black/80 backdrop-blur p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              {isLogin ? (
                <LogIn className="w-6 h-6 text-cyan-400" />
              ) : (
                <UserPlus className="w-6 h-6 text-green-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 glow-text mb-1">
              {isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
            </h1>
            <p className="text-xs text-white/60">CyberShield Security System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-green-400 mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="agent_007"
                className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-green-400 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                disabled={loading}
              />
            </div>

            {/* Confirm password (registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs text-green-400 mb-2">
                  Подтвердить пароль
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                  disabled={loading}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-red-500/20 border border-red-500/50">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded bg-green-500/20 border border-green-500/50">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-400">{success}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white font-bold rounded transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Загрузка...
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 pt-6 border-t border-cyan-500/30 text-center">
            <p className="text-xs text-white/60 mb-3">
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setPassword('');
                setConfirmPassword('');
              }}
              disabled={loading}
              className="text-cyan-400 hover:text-cyan-300 disabled:text-cyan-600 font-semibold text-sm transition"
            >
              {isLogin ? 'СОЗДАТЬ АККАУНТ' : 'ВХОД'}
            </button>
          </div>

          {/* System info */}
          <div className="mt-6 pt-4 border-t border-cyan-500/30 text-center">
            <p className="text-xs text-white/40 leading-relaxed">
              ⚔️ Защищённая система<br />
              🔒 Шифрованные пароли<br />
              🛡️ Сессионное управление
            </p>
          </div>
        </div>

        {/* CRT effects */}
        <div className="crt-overlay screen-flicker"></div>
        <div className="crt-vignette"></div>
      </div>
    </div>
  );
}
