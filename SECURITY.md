# 🔒 Документация по безопасности CyberShield

## Реализованные меры безопасности

### 1. **Хеширование паролей**
✅ Реализовано:
- **bcryptjs** с 10 rounds salt
- Пароли никогда не хранятся в открытом виде
- При входе происходит сравнение хешей, а не паролей

```typescript
// server/routes.ts
const hashedPassword = await bcrypt.hash(password, 10);
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
```

### 2. **Валидация пароля**
✅ Реализовано в `server/routes.ts`:
- **Минимум 8 символов**
- **Заглавная буква** (A-Z) обязательна
- **Строчная буква** (a-z) обязательна
- **Цифра** (0-9) обязательна
- Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

**Примеры валидных паролей:**
- ✅ `Admin123`
- ✅ `SecurePass456`
- ✅ `MyGame2024`
- ✅ `Test@Password1`

**Примеры невалидных паролей:**
- ❌ `password` (нет заглавных букв и цифр)
- ❌ `PASSWORD123` (нет строчных букв)
- ❌ `Pass1` (меньше 8 символов)
- ❌ `12345678` (нет букв)

### 3. **Валидация входных данных**
✅ Реализовано:
- **Username validation**:
  - 3-20 символов
  - Только буквы, цифры, `_`, `-`
  - Примеры: `agent_007`, `cyber-shield-1`
- **Password validation**: см. выше
- **Зod-схемы** для типизированной валидации
- **express-validator** для дополнительной проверки
- Защита от пустых/null значений
- Trim() для удаления пробелов

### 4. **SQL Injection Protection**
✅ Защита: Используем **Drizzle ORM** с parameterized queries
```typescript
// ✅ БЕЗОПАСНО - используется Drizzle ORM
const user = await db.select().from(users).where(eq(users.username, username));

// ❌ НЕБЕЗОПАСНО - raw SQL (не используется в проекте)
// const user = await db.raw(`SELECT * FROM users WHERE username = '${username}'`);
```

### 5. **Rate Limiting**
✅ Реализовано:
- **Общий лимит**: 100 запросов на 15 минут с одного IP
- **Auth лимит**: 5 попыток входа/регистрации на 15 минут с одного IP
- Использует **express-rate-limit**
- Предотвращает brute force атаки на пароли
- Логирование превышения лимитов

### 6. **CORS (Cross-Origin Resource Sharing)**
✅ Реализовано:
- Контроль источников запросов
- Разрешены только безопасные методы
- Credentials поддерживаются для сессий
- Рекомендация для продакшена: ограничить origin

### 7. **Helmet.js** - защита HTTP заголовков
✅ Включено:
- **Content Security Policy (CSP)** - защита от XSS
- **X-Frame-Options: deny** - защита от clickjacking
- **X-Content-Type-Options: nosniff** - защита от MIME sniffing
- **Strict-Transport-Security (HSTS)** - обязательный HTTPS
- **X-XSS-Protection** - встроенная XSS защита

### 8. **XSS (Cross-Site Scripting) Protection**
✅ Защита:
- **React автоматически escapes** значения в JSX
- **Input sanitization** на сервере
- **Content-Security-Policy header** предотвращает inline scripts
- **Zod validation** проверяет типы данных

### 9. **CSRF (Cross-Site Request Forgery) Protection**
✅ Защита:
- **Express-session** с SameSite policy
- Session cookies по умолчанию защищены
- Рекомендация: добавить CSRF tokens для kritical операций

### 10. **Session Management**
✅ Реализовано:
- **express-session** для управления сессиями
- Сессии хранятся в памяти (можно перенести на Redis)
- Автоматическое удаление истекших сессий
- Secure cookies (для HTTPS)
- HttpOnly флаг для защиты от XSS

### 11. **SQLite базе данных**
✅ Реализовано:
- **Foreign keys enabled** - целостность данных
- **Auto-initialization** при первом запуске
- **Parameterized queries** через Drizzle ORM
- Таблица `user_progress` с foreign key на `users`

**Таблицы:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT
);

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
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 12. **Защита от Common Attacks**

| Атака | Защита | Статус |
|-------|--------|--------|
| **SQL Injection** | Drizzle ORM parameterized queries | ✅ |
| **XSS** | React escaping + CSP header | ✅ |
| **CSRF** | Session с SameSite policy | ✅ |
| **Brute Force** | Rate limiting (5 попыток/15 мин) | ✅ |
| **Weak Password** | Валидация (8+ chars, upper, lower, digit) | ✅ |
| **Privilege Escalation** | Session-based auth | ✅ |
| **Data Exposure** | Bcrypt хеширование паролей | ✅ |
| **Clickjacking** | X-Frame-Options: deny | ✅ |

### 13. **API Endpoints Security**
✅ Реализовано:
- **Authentication required** для /api/progress endpoints
- **User ownership check** - каждый пользователь видит только свой прогресс
- **Request body validation** на все POST/PUT запросы
- **Rate limiting** на auth endpoints

```typescript
// Только авторизованные пользователи могут видеть свой прогресс
app.get('/api/progress', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Получить прогресс только текущего пользователя
});
```

## Тестирование безопасности

### 1. Проверить Rate Limiting:
```bash
# 6 requests за короткий время должны быть заблокированы
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"Test123"}'
done
# После 5 запросов - 429 Too Many Requests
```

### 2. Проверить валидацию пароля:
```bash
# Слабый пароль должен быть отклонен
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"weak"}'
# Error: Invalid password

# Сильный пароль должен быть принят
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"agent_007","password":"SecurePass123"}'
# Success: User created
```

### 3. Проверить XSS protection:
```bash
# XSS payload в username должен быть экранирован
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"<script>alert(1)</script>","password":"Safe123"}'
# Username validation fails - invalid characters
```

### 4. Проверить SQL Injection protection:
```bash
# SQL injection payload должен быть обработан как обычный текст
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin\" OR \"1\"=\"1","password":"Test123"}'
# No user found (безопасно)
```

### 5. Проверить Helmet headers:
```bash
curl -i http://localhost:5000
# Проверить наличие:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

## Рекомендации для продакшена

### 1. **Включить HTTPS**
```typescript
// Получить SSL сертификат (Let's Encrypt бесплатный)
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### 2. **Переменные окружения**
```bash
# .env file
NODE_ENV=production
SESSION_SECRET=<очень-сложный-случайный-ключ-32-символа>
DATABASE_URL=file:./newarch.db
CORS_ORIGIN=https://yourdomain.com
```

### 3. **Логирование и мониторинг**
```typescript
// Добавить логирование попыток входа
app.post('/api/auth/login', (req, res) => {
  console.log(`[${new Date().toISOString()}] Login attempt: ${req.body.username} from ${req.ip}`);
  // ...
});
```

### 4. **Двухфакторная аутентификация (2FA)**
Рекомендуется добавить:
- Google Authenticator (TOTP)
- SMS OTP
- Email verification

### 5. **Database Backups**
```bash
# Регулярное резервное копирование
0 2 * * * cp /path/to/newarch.db /backups/newarch-$(date +\%Y\%m\%d).db
```

### 6. **Web Application Firewall (WAF)**
Рекомендуется:
- Cloudflare WAF
- AWS WAF
- Nginx ModSecurity

### 7. **Регулярные обновления**
```bash
# Проверить уязвимости в зависимостях
npm audit

# Обновить уязвимые зависимости
npm audit fix

# Обновить все зависимости
npm update
```

### 8. **Account Lockout Policy**
Рекомендуется добавить:
- Блокировка аккаунта после 5 неудачных попыток входа
- Временная блокировка (15 минут)
- Уведомление по email

## Полезные команды

```bash
# Проверить уязвимости в зависимостях
npm audit

# Обновить уязвимые зависимости
npm audit fix --force

# Проверить типы TypeScript на уязвимости
npm run check

# Запустить production build
npm run build

# Запустить production сервер
npm start

# Сканирование портов (требуется nmap)
nmap -p 5000 localhost
```

## Ссылки на безопасность

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js документация](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [SQLite Security](https://www.sqlite.org/security.html)
- [Bcryptjs документация](https://www.npmjs.com/package/bcryptjs)

---

**Статус**: ✅ Полная базовая безопасность реализована
**Версия**: 2.0 with SQLite
**Дата обновления**: 16 декабря 2025
**Ответственность**: Приложение готово к базовому использованию, для критичного продакшена требуются дополнительные меры
