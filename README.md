# CyberShield: Interactive Cybersecurity Game

🎮 **Интерактивная игра по кибербезопасности** с реалистичным терминалом, системой миссий и элементами киберпанка.

![Version](https://img.shields.io/badge/version-2.0--frontend-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Frontend%20Only-orange)

---

## 📖 Содержание

- [О проекте](#о-проекте)
- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Как играть](#как-играть)
- [Команды](#команды)

---

## О проекте

**CyberShield** - это образовательная игра для изучения основ кибербезопасности через практические задачи. Игроки берут роль агента CyberShield и должны нейтрализировать киберугрозы, используя команды Linux-подобной ОС.

### Особенности
- 🎯 10 прогрессивных миссий от простых к сложным
- 📊 Система прогресса с сохранением в localStorage
- 📚 Встроенная Wiki база знаний с 3 категориями
- 🎨 Киберпанк интерфейс с CRT эффектами
- 🔊 Динамическая звуковая система
- 🏆 Система достижений и трофеев
- 🎮 Процедурные миссии с динамической генерацией

---

## Быстрый старт

### Требования
- Node.js v16+
- npm или yarn

### 🚀 Запуск проекта

**Рекомендуемый способ:**

```bash
npm run dev
```

Проект запустится на **http://localhost:5173** (или следующем доступном порту)

**Сборка для production:**

```bash
npm run build
npm run preview
```

### ⚙️ Доступные команды

```bash
# Запуск development сервера с live reload
npm run dev

# Сборка для production
npm run build

# Просмотр production сборки локально
npm run preview

# Проверка TypeScript типов
npm run check
```

### 📊 Хранение данных

Логи сохраняются в директорию `logs/`:
- `logs/backend.log` - Логи Express сервера
- `logs/frontend.log` - Логи Vite (React)

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

## Архитектура

### Структура проекта

```
client/                   # React фронтенд (TypeScript)
  src/
    components/           # UI компоненты
      Terminal.tsx        # Эмулятор терминала
      CyberDeck.tsx       # Панель управления
      Wiki.tsx            # База знаний
      AdminPanel.tsx      # Панель администратора
      Leaderboard.tsx     # Таблица рекордов
      ...
    hooks/                # Custom hooks
      useGameEngine.ts    # Основная игровая логика
      useAchievements.ts  # Система достижений
      useProceduralMissions.ts  # Генератор заданий
      ...
    lib/
      stores/             # Zustand хранилище
      utils.ts            # Утилиты
    pages/                # Страницы
    
shared/                   # Общие типы и схемы
  schema.ts              # Типы данных
```

### Технологический стек

**Фронтенд:**
- React 18 + TypeScript
- Vite (быстрая сборка)
- Tailwind CSS (стили)
- Zustand (state management)
- React Query (кеширование)
- Framer Motion (анимации)
- Three.js (3D графика в играх)
- React Three Fiber (React + Three.js)

### Хранение данных

Все данные сохраняются локально в браузере:
- **localStorage** - счет, уровень, достижения
- **sessionStorage** - временные данные сеанса

---
- ✅ `Admin123`
- ✅ `SecurePass456`
- ✅ `MyGame2024`
---

## Как играть

### Начало игры

1. Открой приложение в браузере (http://localhost:5173)
2. Начни первую миссию
3. Выполняй задачи с помощью команд терминала

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

### Структура проекта

Состояние игры управляется через Zustand и автоматически сохраняется в `localStorage`.

### Добавление новой миссии

1. Добавить в `INITIAL_MISSIONS` массив в `useGameEngine.ts`
2. Добавить проверку выполнения в `checkMissionCompletion()`
3. Обновить типы в `shared/schema.ts`

### Добавление новой команды

1. Добавить case в `executeCommand()` в `useGameEngine.ts`
2. Реализовать логику команды
3. Добавить описание в [WIKI.md](WIKI.md)

---

## Лицензия

MIT License - свободно используй в своих проектах!

---

## Что дальше?

### Планируемые функции
- [ ] Усложненные миссии
- [ ] Расширенная система достижений
- [ ] Улучшенная 3D графика
- [ ] Локализация на другие языки
- [ ] Кастомные уровни

---

**Создано с ❤️ для любителей кибербезопасности**

Last Updated: 19 апреля 2026 | Version 2.0 (Frontend)
