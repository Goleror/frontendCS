# CyberShield: Architecture Documentation

## Overview

**CyberShield** - это образовательная игра по кибербезопасности с реалистичным терминалом и киберпанк интерфейсом. Приложение представляет собой эмулятор SOC (Security Operations Center) где игроки используют команды терминала для выполнения миссий по безопасности: поиск вредоноса процессов, удаление вредоносных файлов, анализ логов атак.

Игра имеет сплит-панель layout: терминал (65%) слева и "CyberDeck" панель (35%) справа с миссиями, Wiki и достижениями. Включает CRT эффекты (скан-линии, виньетка) и glassmorphism стилизацию для аутентичного внешнего вида хакера.

---

## Системная архитектура

### Frontend архитектура
- **Фреймворк**: React 18 с TypeScript
- **Сборщик**: Vite с поддержкой GLSL shaders и 3D assets
- **Стилизация**: Tailwind CSS с кастомной киберпанк темой (void black, neon green, alert red)
- **UI Компоненты**: Radix UI primitives + shadcn/ui component library
- **Управление состоянием**: Zustand для игрового состояния
- **Макет**: Full-screen fixed viewport (h-screen w-screen overflow-hidden)

### Game Engine

**Core Hook**: `useGameEngine.ts` (Zustand store) управляет:
- **Виртуальная файловая система** (вложенный JSON с правами: 'r' или 'rw')
- **Список процессов** с флагом protected для rootkit-подобных процессов
- **Парсер команд терминала** поддерживает: ls, cd, pwd, cat, rm, touch, echo, ps, kill, grep, chmod, find, submit_report
- **Отслеживание состояния миссии** и логика проверки завершения
- **История команд** с временными метками
- **Система достижений** с прогрессом

### Backend архитектура
- **Runtime**: Node.js v16+ с Express.js
- **API Pattern**: RESTful endpoints с префиксом /api
- **Сборка**: Vite для frontend + Express для backend
- **Разработка**: tsx для TypeScript выполнения с HMR через Vite middleware

### Data Storage

#### SQLite (основная база)
- **Файл**: `newarch.db` (создается автоматически)
- **ORM**: Drizzle ORM для типобезопасных запросов
- **Schema Location**: `shared/schema.ts`
- **Инициализация**: Автоматическая через `server/db.ts`

#### Таблицы:
```sql
-- Пользователи
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT
);

-- Таблица рекордов
CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY,
  player_name TEXT NOT NULL,
  completion_time_ms INTEGER,
  command_count INTEGER,
  error_count INTEGER,
  achievement_count INTEGER,
  created_at TEXT
);

-- Прогресс игрока
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  total_missions_completed INTEGER DEFAULT 0,
  total_commands_executed INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  unlocked_achievements TEXT DEFAULT '[]',
  last_played_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Для Python (опционально)
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  token TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Foreign Keys**: Включены для обеспечения целостности данных

#### Storage Abstraction

В `server/storage.ts` реализована абстракция IStorage:
```typescript
interface IStorage {
  // Auth
  getUser(username: string): Promise<User | null>;
  createUser(username: string, passwordHash: string): Promise<User>;
  
  // Progress
  getUserProgress(userId: number): Promise<UserProgress>;
  updateUserProgress(userId: number, data: Partial<UserProgress>): Promise<void>;
  initializeUserProgress(userId: number): Promise<void>;
  
  // Leaderboard
  getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
  addLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;
}
```

**Реализации**:
1. **DatabaseStorage** (default) - использует SQLite через Drizzle
2. **FileStorage** - JSON файл (для development fallback)
3. **MemoryStorage** - память (для тестирования)

---

## Project Structure

```
newarch-main/
├── client/                      # React Frontend (TypeScript)
│   ├── index.html              # HTML entry point
│   ├── public/                 # Static assets
│   │   ├── fonts/              # Custom fonts
│   │   ├── geometries/         # 3D model assets
│   │   └── sounds/             # Audio files
│   └── src/
│       ├── App.tsx             # Main component
│       ├── main.tsx            # Entry point
│       ├── index.css           # Global styles
│       ├── components/         # UI Components
│       │   ├── Terminal.tsx    # Terminal emulator
│       │   ├── CyberDeck.tsx   # Side panel (missions/wiki)
│       │   ├── AuthPage.tsx    # Login/register
│       │   ├── Wiki.tsx        # Knowledge base
│       │   ├── Leaderboard.tsx # High scores
│       │   ├── ui/             # shadcn/ui components
│       │   └── ...
│       ├── hooks/              # Custom React hooks
│       │   ├── useGameEngine.ts    # Main game state (Zustand)
│       │   ├── useAchievements.ts  # Achievement logic
│       │   ├── useProceduralMissions.ts
│       │   └── ...
│       ├── lib/                # Utilities
│       │   ├── stores/         # Zustand stores
│       │   ├── utils.ts        # Helper functions
│       │   └── queryClient.ts  # React Query config
│       └── pages/              # Page components
│
├── server/                     # Node.js + Express Backend (TypeScript)
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database abstraction (IStorage)
│   ├── db.ts                  # SQLite initialization
│   ├── static.ts              # Static file serving
│   ├── multiplayer.ts         # Multiplayer logic
│   └── vite.ts                # Vite dev middleware
│
├── server-py/                 # Python FastAPI Backend (Optional)
│   ├── main.py               # FastAPI entry point
│   ├── requirements.txt       # Python dependencies
│   └── app/
│       ├── config.py         # Configuration
│       ├── database.py       # SQLAlchemy setup
│       ├── models/           # SQLAlchemy models
│       ├── routes/           # FastAPI routes
│       └── schemas/          # Pydantic schemas
│
├── shared/                   # Shared types & schema
│   └── schema.ts            # Drizzle ORM schema definitions
│
├── script/                  # Build utilities
│   └── build.ts            # Build script
│
├── Configuration Files:
├── vite.config.ts           # Vite bundler config
├── tsconfig.json            # TypeScript config
├── package.json             # Node dependencies
├── drizzle.config.ts        # Drizzle ORM config
├── tailwind.config.ts       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── ARCHITECTURE.md          # This file
├── README.md                # Project overview
├── SECURITY.md              # Security documentation
└── WIKI.md                  # In-game knowledge base
```

---

## Data Flow

### Frontend Game Loop
```
User Input (Terminal) 
  → React Terminal Component
  → useGameEngine Hook (Zustand)
  → Check against FileSystem State
  → Update Game State
  → localStorage (persistence)
  → React re-render
```

### API Communication
```
Client Frontend
  → HTTP Request to /api/...
  → Express Routes (server/routes.ts)
  → Storage Layer (server/storage.ts)
  → SQLite Database (newarch.db)
  → Response JSON
  → React Query + Zustand update
```

### User Progress Tracking
```
Game Action (mission complete, command executed, etc.)
  → useGameEngine updates local state
  → Zustand store triggers
  → HTTP POST to /api/progress/mission or /api/progress/achievement
  → Server updates SQLite user_progress table
  → Leaderboard updated
```

---

## Technologies Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool |
| Tailwind CSS | 3+ | Styling |
| Zustand | - | State management |
| Radix UI | - | UI primitives |
| React Query | - | Server state |
| Framer Motion | - | Animations |
| React Three Fiber | - | 3D graphics (optional) |

### Backend (Node.js)
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.18+ | Web server |
| TypeScript | 5+ | Type safety |
| Drizzle ORM | - | Database queries |
| better-sqlite3 | - | SQLite driver |
| bcryptjs | - | Password hashing |
| express-session | - | Session management |
| helmet | - | HTTP security headers |
| express-rate-limit | - | Rate limiting |

### Backend (Python - Optional)
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115+ | Web framework |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.0+ | Data validation |
| Uvicorn | - | ASGI server |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| SQLite | 3.40+ | Local database |
| Drizzle ORM | - | Query builder |

---

## API Routes

### Authentication
```
POST   /api/auth/register       - Create new user account
POST   /api/auth/login          - Authenticate user
POST   /api/auth/logout         - End session
GET    /api/auth/me             - Get current user
```

### User Progress
```
GET    /api/progress            - Get user progress (requires auth)
PUT    /api/progress            - Update user progress
POST   /api/progress/mission    - Record mission completion
POST   /api/progress/achievement - Unlock achievement
```

### Leaderboard
```
GET    /api/leaderboard         - Get top players
POST   /api/leaderboard         - Add leaderboard entry
```

### Multiplayer (Optional)
```
POST   /api/multiplayer/rooms           - Create game room
GET    /api/multiplayer/rooms/:roomCode - Get room info
POST   /api/multiplayer/rooms/:roomCode/join - Join room
POST   /api/multiplayer/rooms/:roomCode/teams/:team/score - Update score
```

---

## Development Workflow

### Local Network Development
1. **Start Node.js server** (includes Vite dev server):
   ```bash
   npm run dev
   ```
   Accessible locally: http://localhost:5000
   Accessible in network: http://[IP]:5000

2. **Start Python server** (optional):
   ```bash
   cd server-py && python main.py
   ```
   Accessible at: http://[IP]:8000

### Database Initialization
- Automatically creates `newarch.db` on first run
- Tables created with proper schema and constraints
- No manual migrations needed

### Type Safety
- TypeScript everywhere (client + server)
- Drizzle ORM generates types from schema
- Zod validation for API inputs

---

## Deployment Considerations

### Local Network
✅ Currently configured for local network deployment:
- Vite server binds to `0.0.0.0:5000`
- Python server binds to `0.0.0.0:8000`
- Both accessible from any machine on the network

### Production Deployment
For production, consider:
1. **HTTPS** - SSL/TLS certificates
2. **Reverse Proxy** - Nginx or Cloudflare
3. **Environment Variables** - Use .env for configuration
4. **Database** - SQLite sufficient for small deployments, consider PostgreSQL for scale
5. **Session Storage** - Redis for distributed sessions
6. **Rate Limiting** - Increase limits and configure by endpoint
7. **Monitoring** - Add logging and error tracking
8. **Backups** - Regular database backups

---

## Security Architecture

### Password Security
- **Hashing**: bcryptjs with 10 salt rounds
- **Validation**: Minimum 8 characters, uppercase, lowercase, digit required
- **Storage**: Only password hashes stored in database

### API Security
- **Rate Limiting**: 5 attempts per 15 minutes on auth endpoints
- **CORS**: Configured for local network
- **Helmet**: HTTP security headers enabled
- **Session**: express-session with HttpOnly cookies
- **Input Validation**: Zod schemas + express-validator

### Database Security
- **Foreign Keys**: Enabled for referential integrity
- **Parameterized Queries**: Drizzle ORM prevents SQL injection
- **User Isolation**: Each user can only access their own progress

---

## Future Enhancements

- [ ] Multi-player live sessions
- [ ] Custom mission creation
- [ ] Advanced 3D visualization
- [ ] Mobile companion app
- [ ] Real CTF integration
- [ ] AI-powered opponent
- [ ] Procedurally generated missions

---

**Architecture Version**: 2.0 with SQLite
**Last Updated**: 16 декабря 2025
**Status**: Production-ready for local deployment
