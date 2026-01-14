# CyberShield: Interactive Cybersecurity Game

🎮 **Интерактивная игра по кибербезопасности** с реалистичным терминалом, системой миссий и элементами киберпанка.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active%20Development-orange)

---

## 📖 Содержание

- [О проекте](#о-проекте)
- [Быстрый старт](#быстрый-старт)
- [Развертывание на локальной сети](#развертывание-на-локальной-сети)
- [Архитектура](#архитектура)
- [Базы данных](#базы-данных)
- [API endpoints](#api-endpoints)
- [Требования к паролям](#требования-к-паролям)
- [Как играть](#как-играть)
- [Команды](#команды)

---

## О проекте

**CyberShield** - это образовательная игра для изучения основ кибербезопасности через практические задачи. Игроки берут роль агента CyberShield и должны нейтрализировать киберугрозы, используя команды Linux-подобной ОС.

### Особенности
- 🎯 10 прогрессивных миссий от простых к сложным
- 🔐 Система аутентификации с защитой пароля (bcryptjs)
- 📊 Таблица лидеров с сохранением статистики
- 📚 Встроенная Wiki база знаний с 3 категориями
- 💾 Сохранение прогресса в **SQLite** БД
- 🎨 Киберпанк интерфейс с CRT эффектами
- 🔊 Динамическая звуковая система
- 🏆 Система достижений и трофеев
- 🌐 Развертывание на локальной сети

---

## Быстрый старт

### Требования
- Node.js v16+
- npm или yarn
- Python 3.8+ (опционально, для FastAPI бэкенда)

### Установка

```bash
# Установка Node.js зависимостей
npm install

# (Опционально) Установка Python зависимостей
cd server-py
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
```

### Запуск проекта

**Terminal 1 - Node.js фронтенд + бэкенд:**
```bash
npm run dev
```
Доступно на:
- Локально: http://localhost:5000
- В сети: http://[IP]:5000 (например, http://10.180.121.46:5000)

**Terminal 2 - Python FastAPI (опционально):**
```bash
cd server-py
python main.py
```
Доступно на:
- Локально: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Развертывание на локальной сети

Проект автоматически настроен для работы на локальной сети:

### Node.js сервер (фронтенд + бэкенд)
- **Конфиг**: `vite.config.ts`
- **Слушает**: `0.0.0.0:5000` (все интерфейсы)
- **Доступно в сети**: http://[IP]:5000

### Python сервер (API, опционально)
- **Конфиг**: `server-py/main.py`
- **Слушает**: `0.0.0.0:8000` (все интерфейсы)
- **Доступно в сети**: http://[IP]:8000

Найди свой IP в выводе сервера или используй:
```bash
# Windows:
ipconfig
# Linux/Mac:
ifconfig
```

---

## Архитектура

### Структура проекта

```
client/                  # React фронтенд (TypeScript)
  src/
    components/          # UI компоненты
      Terminal.tsx       # Эмулятор терминала
      CyberDeck.tsx      # Панель управления
      Wiki.tsx           # База знаний
      AuthPage.tsx       # Вход/регистрация
      ...
    hooks/               # Custom hooks
      useGameEngine.ts   # Основная игровая логика
      useAchievements.ts # Система достижений
      ...
    lib/
      stores/            # Zustand хранилище
      utils.ts           # Утилиты
    
server/                  # Node.js + Express бэкенд (TypeScript)
  index.ts              # Main server file
  routes.ts             # API endpoints
  storage.ts            # Database abstraction
  db.ts                 # SQLite configuration
  static.ts             # Static files server
  
server-py/              # Python FastAPI бэкенд (опционально)
  main.py               # FastAPI app
  app/
    models/              # SQLAlchemy models
    routes/              # FastAPI routes
    schemas/             # Pydantic schemas
    
shared/                 # Shared types & schemas
  schema.ts             # Drizzle ORM schema
```

### Технологический стек

**Фронтенд:**
- React 18 + TypeScript
- Vite (сборка)
- Tailwind CSS
- Zustand (state management)
- React Query
- Framer Motion (анимации)

**Node.js Бэкенд:**
- Express.js
- SQLite (better-sqlite3)
- Drizzle ORM
- bcryptjs (пароли)
- express-session
- helmet (безопасность)
- express-rate-limit

**Python Бэкенд (опционально):**
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

---

## Базы данных

### SQLite (Node.js)

**Файл**: `newarch.db` (создается автоматически в корне проекта)

**Таблицы:**
- `users` - пользователи (id, username, password_hash, created_at)
- `leaderboard` - таблица рекордов
- `user_progress` - прогресс каждого игрока

**Инициализация**: Автоматическая при первом запуске сервера через `initializeDatabase()` в `server/db.ts`

### SQLite (Python, опционально)

**Файл**: `server-py/newarch.db`

**Таблицы**: 
- `users` - пользователи

Миграции запускаются **автоматически** при первом запуске.

### Структура таблицы `user_progress`

```sql
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  total_missions_completed INTEGER DEFAULT 0,
  total_commands_executed INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  unlocked_achievements TEXT DEFAULT '[]', -- JSON array
  last_played_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API endpoints

### Аутентификация

```
POST /api/auth/register - Регистрация
POST /api/auth/login     - Вход
POST /api/auth/logout    - Выход
GET  /api/auth/me        - Получить текущего пользователя
```

### Прогресс игрока

```
GET  /api/progress              - Получить прогресс текущего пользователя
PUT  /api/progress              - Обновить прогресс (score, level, etc.)
POST /api/progress/mission      - Записать завершение миссии
POST /api/progress/achievement  - Разблокировать достижение
```

**Пример GET /api/progress:**
```json
{
  "userId": 1,
  "level": 3,
  "totalScore": 2500,
  "totalMissionsCompleted": 2,
  "totalCommandsExecuted": 145,
  "totalErrors": 8,
  "unlockedAchievements": ["mission_1_complete", "no_errors"],
  "lastPlayedAt": "2025-12-16T14:30:00Z",
  "updatedAt": "2025-12-16T14:30:00Z"
}
```

### Таблица лидеров

```
GET  /api/leaderboard      - Получить таблицу лидеров
POST /api/leaderboard      - Добавить запись в лидерборд
```

### Мультиплеер

```
POST /api/multiplayer/rooms                    - Создать комнату
GET  /api/multiplayer/rooms/:roomCode          - Информация о комнате
POST /api/multiplayer/rooms/:roomCode/join     - Присоединиться
POST /api/multiplayer/rooms/:roomCode/teams/:team/score - Обновить очки
```

---

## Требования к паролям

Для регистрации пароль **ДОЛЖЕН** содержать:

✅ **Минимум 8 символов**
✅ **Как минимум одну заглавную букву** (A-Z)
✅ **Как минимум одну строчную букву** (a-z)
✅ **Как минимум одну цифру** (0-9)

### Примеры валидных паролей:
- ✅ `Admin123`
- ✅ `SecurePass456`
- ✅ `MyGame2024`
- ✅ `Test@Password1`

### Примеры невалидных паролей:
- ❌ `password` (нет заглавных букв и цифр)
- ❌ `PASSWORD123` (нет строчных букв)
- ❌ `Pass1` (меньше 8 символов)
- ❌ `12345678` (нет букв)

**Валидация**: Regex `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/` (в `server/routes.ts`)

---

## Как играть

### Начало игры

1. Перейди на http://[IP]:5000
2. Создай аккаунт с сильным паролем
3. Войди в систему
4. Начни первую миссию

### Основные команды

```bash
# Навигация
pwd                    # Текущая директория
ls /path               # Список файлов
cd /path               # Переход в папку
cd ..                  # На уровень выше

# Файлы
cat file.txt           # Просмотр содержимого
echo "text" > file     # Создание файла
cp source dest         # Копирование
rm file                # Удаление
chmod +w file          # Изменение прав
touch file.txt         # Создание пустого файла
mkdir folder           # Создание папки

# Поиск
grep "text" file       # Поиск текста в файле
find / -name "*.txt"   # Поиск файла

# Процессы
ps                     # Список процессов
kill [PID]             # Убить процесс
kill -9 [PID]          # Принудительное завершение

# Другое
whoami                 # Текущий пользователь
clear                  # Очистить терминал
reset                  # Перезапустить игру
submit_report [type]   # Отправить отчет о выполнении
```

### Система миссий

Каждая миссия имеет:
- 📋 **Описание** - контекст угрозы
- 🎯 **Цель** - пошаговые инструкции
- 📊 **Статус** - активна/выполнена/заблокирована

Миссии разблокируются последовательно. Выполнение каждой миссии дает доступ к следующей.

### Достижения

Получай бейджи за:
- ✅ Выполнение миссий
- ⚡ Быстрое прохождение
- 🎯 Мало ошибок
- 💯 Идеальное прохождение

---

## Команды

### Полный список команд в игре

| Команда | Описание | Пример |
|---------|---------|--------|
| `help` | Показать справку | `help` |
| `pwd` | Текущая директория | `pwd` |
| `ls` | Список файлов | `ls /home` |
| `cd` | Переход в папку | `cd /etc` |
| `cat` | Просмотр файла | `cat flag.txt` |
| `echo` | Вывод текста | `echo "text" > file` |
| `mkdir` | Создание папки | `mkdir folder` |
| `touch` | Создание файла | `touch file.txt` |
| `rm` | Удаление | `rm file.txt` |
| `cp` | Копирование | `cp src dest` |
| `mv` | Перемещение | `mv old new` |
| `chmod` | Изменение прав | `chmod +w file` |
| `grep` | Поиск текста | `grep "pattern" file` |
| `find` | Поиск файла | `find / -name "*.txt"` |
| `ps` | Список процессов | `ps` |
| `kill` | Завершить процесс | `kill 1234` |
| `whoami` | Текущий пользователь | `whoami` |
| `submit_report` | Отправить отчет | `submit_report sql_injection` |
| `clear` | Очистить терминал | `clear` |
| `reset` | Перезапустить игру | `reset` |

Подробное описание всех команд см. в [WIKI.md](WIKI.md)

---

## Разработка

### Структура стора (Zustand)

```typescript
interface GameState {
  fileSystem: Record<string, FileNode>;
  currentPath: string;
  processes: Process[];
  terminalHistory: TerminalLine[];
  currentMission: number;
  missions: Mission[];
  gameCompleted: boolean;
  
  // Methods
  executeCommand(command: string): void;
  addTerminalLine(type, content): void;
  checkMissionCompletion(): void;
  resetGame(): void;
}
```

Состояние автоматически сохраняется в `localStorage` под ключом `game-engine-storage`.

### Добавление новой миссии

1. Добавить в `INITIAL_MISSIONS` массив
2. Добавить проверку в `checkMissionCompletion()`
3. Добавить обработчик команды в `executeCommand()` если нужна специальная команда
4. Обновить структуру в `shared/schema.ts`

### Добавление новой команды

1. Добавить case в `executeCommand()` в `useGameEngine.ts`
2. Реализовать логику команды
3. Добавить в файл [WIKI.md](WIKI.md) для документации

---

## Безопасность

### Реализованные меры

| Мера | Описание | Статус |
|------|---------|--------|
| **Хеширование паролей** | bcryptjs с солью (10 rounds) | ✅ Активно |
| **Валидация пароля** | Min 8 chars, uppercase, lowercase, digit | ✅ Активно |
| **Rate Limiting** | Ограничение запросов | ✅ Активно |
| **CORS** | Контроль источников | ✅ Активно |
| **Helmet** | HTTP заголовки безопасности | ✅ Активно |
| **Input Validation** | express-validator + Zod | ✅ Активно |
| **Input Sanitization** | trim() + type checking | ✅ Активно |
| **SQL Injection Protection** | Parameterized queries (Drizzle ORM) | ✅ Активно |
| **Session Management** | express-session | ✅ Активно |
| **SQLite Security** | Foreign keys enabled | ✅ Активно |

Дополнительную информацию см. в [SECURITY.md](SECURITY.md)

---

## Лицензия

MIT License - свободно используй в своих проектах!

---

## Контакты и поддержка

- 🐛 Об ошибках пиши в Issues
- 💡 Предложения по улучшению приветствуются
- 📧 Вопросы? Создавай Discussion

---

## Что дальше?

### Планируемые функции
- [ ] Улучшения мультиплеера
- [ ] Сложные миссии с ветвлением
- [ ] 3D визуализация сетевой атаки
- [ ] Кастомные уровни
- [ ] Интеграция с реальными CTF платформами
- [ ] Мобильное приложение

---

**Создано с ❤️ для любителей кибербезопасности**

Last Updated: 16 декабря 2025 | Version 2.0
