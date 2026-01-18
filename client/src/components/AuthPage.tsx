import { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

export function AuthPage({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [classCode, setClassCode] = useState('');
  const [generatedClassCode, setGeneratedClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

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
      if (password.length < 8) {
        setError('Пароль должен быть минимум 8 символов');
        return;
      }
      if (role === 'student' && !classCode.trim()) {
        setError('Введите код класса');
        return;
      }
      if (role === 'student' && classCode.length !== 5) {
        setError('Код класса должен быть из 5 символов');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body: any = { username: username.trim(), password };
      
      if (!isLogin) {
        body.role = role;
        if (role === 'student') {
          body.classCode = classCode.trim();
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const user = await response.json();
        if (!isLogin && user.role === 'teacher' && user.class_code) {
          // Учитель зарегистрирован, показываем код и кнопку "Далее"
          setGeneratedClassCode(user.class_code);
          setRegisteredUsername(user.username);
          setSuccess(`Регистрация успешна! Ваш код класса: ${user.class_code}`);
          setIsRegistrationComplete(true);
        } else if (!isLogin && user.role === 'student') {
          // Студент зарегистрирован, переходим в игру
          setSuccess(`Регистрация успешна!`);
          setRegisteredUsername(user.username);
          setIsRegistrationComplete(true);
          setTimeout(() => onAuthSuccess(user.username), 1000);
        } else if (isLogin) {
          // Обычный вход
          setSuccess(`${isLogin ? 'Вход' : 'Регистрация'} успешен!`);
          setTimeout(() => onAuthSuccess(user.username), 1000);
        }
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

  const handleCopyCode = () => {
    if (generatedClassCode) {
      navigator.clipboard.writeText(generatedClassCode);
      setSuccess('Код скопирован в буфер обмена!');
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
            {/* Role selection (registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs text-green-400 mb-2">
                  Выберите роль
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-2 px-3 rounded border text-xs font-semibold transition ${
                      role === 'student'
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-black border-cyan-500/50 text-cyan-400 hover:border-cyan-400'
                    }`}
                    disabled={loading}
                  >
                    👨‍🎓 Ученик
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex-1 py-2 px-3 rounded border text-xs font-semibold transition ${
                      role === 'teacher'
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-black border-cyan-500/50 text-cyan-400 hover:border-cyan-400'
                    }`}
                    disabled={loading}
                  >
                    👨‍🏫 Учитель
                  </button>
                </div>
              </div>
            )}

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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 pr-10 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-cyan-400 hover:text-cyan-300 disabled:text-cyan-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs text-green-400 mb-2">
                  Подтвердить пароль
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 pr-10 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-2.5 text-cyan-400 hover:text-cyan-300 disabled:text-cyan-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Class code for students (registration only) */}
            {!isLogin && role === 'student' && (
              <div>
                <label className="block text-xs text-green-400 mb-2">
                  Код класса (5 символов)
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  placeholder="XXXXX"
                  className="w-full bg-black border border-cyan-500/50 rounded px-3 py-2 text-green-400 placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition"
                  disabled={loading}
                />
                <p className="text-xs text-white/40 mt-1">
                  Попросите код у вашего учителя
                </p>
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
            {success && !generatedClassCode && (
              <div className="flex items-start gap-2 p-3 rounded bg-green-500/20 border border-green-500/50">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-green-400 leading-relaxed">
                  {success}
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || (isRegistrationComplete && !isLogin)}
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

          {/* Generated class code display for teacher */}
          {generatedClassCode && !isLogin && isRegistrationComplete && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded bg-cyan-500/20 border border-cyan-500/50">
                <p className="text-xs text-cyan-400 mb-2 font-semibold">
                  ✓ Ваш код класса:
                </p>
                <p className="text-2xl font-bold text-green-400 tracking-widest text-center">
                  {generatedClassCode}
                </p>
                <p className="text-xs text-white/60 mt-2 text-center">
                  Поделитесь этим кодом со своими учениками
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full mt-3 px-3 py-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition border border-cyan-400/50 rounded hover:bg-cyan-400/10"
                >
                  📋 Скопировать код
                </button>
              </div>
              
              {/* Proceed button for teacher */}
              <button
                type="button"
                onClick={() => onAuthSuccess(registeredUsername)}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition duration-200 flex items-center justify-center gap-2"
              >
                ▶ ДАЛЕЕ В ИГРУ
              </button>
            </div>
          )}

          {/* Success message for copy */}
          {success && generatedClassCode && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded bg-green-500/20 border border-green-500/50">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-green-400">{success}</span>
            </div>
          )}

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
                setClassCode('');
                setGeneratedClassCode('');
                setRegisteredUsername('');
                setIsRegistrationComplete(false);
              }}
              disabled={loading || isRegistrationComplete}
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
              🛡️ Управление классами
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
