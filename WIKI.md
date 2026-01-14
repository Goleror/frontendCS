# CyberDeck Wiki - Database & API Documentation

## 📡 Команды

### Основные операции

| Команда | Описание | Пример |
|---------|---------|--------|
| `ls` | Список файлов в директории | `ls /home/user` |
| `cd` | Переход в директорию | `cd /etc/config` |
| `cat` | Показать содержимое файла | `cat /etc/passwd` |
| `pwd` | Текущая директория | `pwd` |
| `mkdir` | Создать папку | `mkdir /home/newdir` |
| `rm` | Удалить файл | `rm /tmp/file.txt` |
| `cp` | Копировать файл | `cp source.txt dest.txt` |
| `mv` | Переместить/переименовать | `mv old.txt new.txt` |
| `chmod` | Изменить права доступа | `chmod 755 script.sh` |
| `grep` | Поиск текста | `grep "password" /etc/shadow` |
| `find` | Поиск файлов | `find / -name "*.conf"` |
| `tar` | Архивирование | `tar -xzf backup.tar.gz` |
| `ssh` | Удалённое подключение | `ssh user@192.168.1.1` |
| `ping` | Проверка доступности | `ping 8.8.8.8` |
| `traceroute` | Трассировка маршрута | `traceroute example.com` |
| `netstat` | Состояние сети | `netstat -an` |
| `curl` | Загрузка с веб-сервера | `curl http://api.com/data` |
| `wget` | Скачивание файлов | `wget http://example.com/file.zip` |
| `clear` | Очистить терминал | `clear` |
| `reset` | Перезапустить игру | `reset` |
| `submit_report` | Отправить отчет о выполнении | `submit_report sql_injection` |

### Системные команды

| Команда | Описание |
|---------|---------|
| `whoami` | Текущий пользователь |
| `id` | ID пользователя и группы |
| `sudo` | Выполнение с правами администратора |
| `ps` | Список процессов |
| `kill` | Завершить процесс |
| `kill -9` | Принудительное завершение процесса |
| `top` | Мониторинг ресурсов |
| `df` | Свободное место на диске |
| `du` | Размер директорий |
| `systemctl` | Управление сервисами |
| `journalctl` | Логи системы |

---

## 🛠️ Инструменты

### Разведка и Сканирование

| Инструмент | Назначение | Сложность |
|------------|-----------|----------|
| **nmap** | Сканирование портов и сервисов | ⭐⭐⭐ |
| **whois** | Информация о доменах | ⭐ |
| **dig/nslookup** | DNS запросы | ⭐⭐ |
| **shodan** | Поиск уязвимых устройств в сети | ⭐⭐⭐ |
| **theHarvester** | Сбор информации о целях | ⭐⭐ |
| **metasploit** | Фреймворк для тестирования | ⭐⭐⭐⭐ |

### Взлом и Доступ

| Инструмент | Назначение | Риск |
|------------|-----------|------|
| **hashcat** | Перебор хешей паролей | 🔴 Высокий |
| **john the ripper** | Крак паролей | 🔴 Высокий |
| **hydra** | Брутфорс учётных данных | 🔴 Высокий |
| **sqlmap** | Эксплуатация SQL инъекций | 🔴 Высокий |
| **burp suite** | Тестирование веб-приложений | 🟠 Средний |

### Криптография и Защита

| Инструмент | Назначение |
|------------|-----------|
| **openssl** | Работа с сертификатами и шифрованием |
| **gpg** | Шифрование сообщений и файлов |
| **ssh-keygen** | Генерация SSH ключей |
| **certbot** | Получение SSL сертификатов |

### Анализ и Мониторинг

| Инструмент | Назначение |
|------------|-----------|
| **wireshark** | Анализ сетевого трафика |
| **tcpdump** | Захват пакетов |
| **snort** | Обнаружение вторжений |
| **osint** | Сбор открытой информации |

---

## ⚠️ Угрозы и Уязвимости

### Сетевые атаки

| Угроза | Описание | Защита |
|--------|---------|--------|
| **DDoS** | Распределённый отказ в обслуживании - перегрузка сервера трафиком | WAF, Rate limiting, CDN |
| **Man-in-the-Middle (MitM)** | Перехват трафика между клиентом и сервером | HTTPS, VPN, Криптография |
| **Packet Sniffing** | Перехват и анализ сетевых пакетов | Шифрование, VPN |
| **DNS Spoofing** | Подделка DNS ответов | DNSSEC, Проверка IP |
| **SYN Flood** | Заполнение таблицы соединений | SYN cookies, Firewall |

### Веб-приложения

| Уязвимость | Описание | Пример | Защита |
|-----------|---------|--------|--------|
| **SQL Injection (SQLi)** | Внедрение SQL команд через пользовательский ввод | `' OR '1'='1` | Parameterized queries, ORM |
| **Cross-Site Scripting (XSS)** | Внедрение JavaScript кода на странице | `<script>alert('xss')</script>` | Input sanitization, CSP |
| **CSRF** | Выполнение действий от имени пользователя | Подделанный запрос | CSRF tokens, SameSite |
| **Path Traversal** | Доступ к файлам вне директории | `../../etc/passwd` | Input validation |
| **Command Injection** | Выполнение системных команд | `; rm -rf /` | Избегать exec(), Use API |

### Аутентификация и Доступ

| Угроза | Описание | Защита |
|--------|---------|--------|
| **Brute Force** | Перебор паролей | Rate limiting, Account lockout |
| **Weak Passwords** | Слабые пароли | Password policy, 2FA |
| **Session Hijacking** | Перехват сессии | Secure cookies, HTTPS |
| **Privilege Escalation** | Повышение привилегий | Principle of least privilege |
| **Default Credentials** | Стандартные пароли не изменены | Обязательное изменение при установке |

### Защита (Security Measures)

| Метод | Назначение | Уровень |
|-------|-----------|---------|
| **2FA/MFA** | Двухфакторная/многофакторная аутентификация | ⭐⭐⭐⭐ |
| **Firewall** | Контроль входящего/исходящего трафика | ⭐⭐⭐ |
| **IDS/IPS** | Обнаружение/предотвращение вторжений | ⭐⭐⭐⭐ |
| **WAF** | Web Application Firewall | ⭐⭐⭐ |
| **Encryption** | Шифрование данных в пути и в покое | ⭐⭐⭐⭐ |
| **Backup** | Резервные копии данных | ⭐⭐⭐⭐ |
| **Penetration Testing** | Тестирование на уязвимости | ⭐⭐⭐⭐ |
| **Security Audit** | Аудит безопасности | ⭐⭐⭐ |

---

## 📚 CVSS Шкала критичности

| Оценка | Уровень | Описание |
|--------|---------|---------|
| 0.0 | None | Нет уязвимости |
| 0.1 - 3.9 | Low | Низкая критичность |
| 4.0 - 6.9 | Medium | Средняя критичность |
| 7.0 - 8.9 | High | Высокая критичность |
| 9.0 - 10.0 | Critical | Критическая уязвимость |

---

## 🔌 API Endpoints (для разработчиков)

### Аутентификация
```
POST /api/auth/register
Body: { "username": "agent_007", "password": "SecurePass123" }
Response: { "id": 1, "username": "agent_007" }

POST /api/auth/login
Body: { "username": "agent_007", "password": "SecurePass123" }
Response: { "id": 1, "username": "agent_007" }

POST /api/auth/logout
Response: { "message": "Logged out successfully" }

GET /api/auth/me
Response: { "id": 1, "username": "agent_007" }
```

### Прогресс игрока
```
GET /api/progress
Response: {
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

PUT /api/progress
Body: { "level": 4, "totalScore": 3000 }
Response: { "success": true }

POST /api/progress/mission
Body: { "missionId": 1, "pointsEarned": 500 }
Response: { "success": true, "newLevel": 2 }

POST /api/progress/achievement
Body: { "achievementId": "mission_1_complete" }
Response: { "success": true }
```

### Таблица лидеров
```
GET /api/leaderboard
Response: [
  {
    "id": 1,
    "playerName": "agent_007",
    "completionTimeMs": 3600000,
    "commandCount": 45,
    "errorCount": 2,
    "achievementCount": 8,
    "createdAt": "2025-12-16T10:30:00Z"
  },
  ...
]

POST /api/leaderboard
Body: {
  "playerName": "agent_007",
  "completionTimeMs": 3600000,
  "commandCount": 45,
  "errorCount": 2,
  "achievementCount": 8
}
Response: { "id": 1, "success": true }
```

---

## 💾 База данных (SQLite)

### Таблица users
```
id                  INTEGER PRIMARY KEY
username            TEXT UNIQUE NOT NULL
password_hash       TEXT NOT NULL
created_at          TEXT (ISO 8601 format)
```

### Таблица user_progress
```
id                              INTEGER PRIMARY KEY
user_id                         INTEGER NOT NULL UNIQUE (FK → users.id)
level                           INTEGER DEFAULT 1
total_score                     INTEGER DEFAULT 0
total_missions_completed        INTEGER DEFAULT 0
total_commands_executed         INTEGER DEFAULT 0
total_errors                    INTEGER DEFAULT 0
unlocked_achievements           TEXT (JSON array) DEFAULT '[]'
last_played_at                  TEXT (ISO 8601)
updated_at                      TEXT (ISO 8601)
```

### Таблица leaderboard
```
id                  INTEGER PRIMARY KEY
player_name         TEXT NOT NULL
completion_time_ms  INTEGER
command_count       INTEGER
error_count         INTEGER
achievement_count   INTEGER
created_at          TEXT (ISO 8601 format)
```

---

## 🎮 Система прогресса

### Требования пароля
- Минимум **8 символов**
- **Заглавная буква** (A-Z) обязательна
- **Строчная буква** (a-z) обязательна
- **Цифра** (0-9) обязательна
- Примеры: `Admin123`, `SecurePass456`, `MyGame2024`

### Уровни и очки
| Уровень | Требуемые очки | Миссии | Достижения |
|---------|----------------|--------|-----------|
| 1 | 0 | 0 | 0 |
| 2 | 500 | 1 | 1 |
| 3 | 1500 | 2 | 2 |
| 4 | 3000 | 3 | 3 |
| 5 | 5000 | 5 | 5 |
| 6 | 7500 | 7 | 7 |
| 7 | 10000 | 8 | 8 |
| 8 | 12500 | 9 | 9 |
| 9 | 15000 | 10 | 10 |
| 10 | 20000 | 10+ | 10+ |

### Достижения (Achievements)
| ID | Название | Описание | Очки |
|----|----------|---------|------|
| `mission_1_complete` | Первый шаг | Завершить миссию 1 | 100 |
| `mission_5_complete` | На полпути | Завершить миссию 5 | 500 |
| `mission_10_complete` | Мастер | Завершить миссию 10 | 2000 |
| `no_errors_mission` | Идеально | Завершить миссию без ошибок | 300 |
| `speed_runner` | Быстрец | Завершить миссию за 5 минут | 250 |
| `command_master` | Мастер команд | Выполнить 500 команд | 1000 |
| `leaderboard_top_10` | Топ 10 | Попасть в топ 10 лидербордов | 500 |
| `all_missions` | Легенда | Завершить все 10 миссий | 5000 |

---

**Последнее обновление:** 16 декабря 2025
**Статус:** В разработке
**Версия API**: 2.0 with SQLite
