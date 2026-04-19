# LocalStorage Сохранение Данных Игры

## Обзор

Система полностью автоматически сохраняет все данные игры в `localStorage` браузера. При перезагрузке страницы или возврате в игру, все состояние восстанавливается автоматически.

## Что Сохраняется

### 1. История Терминала
- **Ключ хранилища:** `cybershield_game_{username}_data`
- **Содержит:** Все введённые команды и их вывод
- **Восстановление:** Автоматически при загрузке Terminal компонента
- **Файл:** `src/components/Terminal.tsx`, `src/hooks/useLocalStorageGame.ts`

### 2. История Команд (для навигации)
- **Ключ хранилища:** `cybershield_game_{username}_data`
- **Содержит:** Список команд для навигации стрелками вверх/вниз
- **Восстановление:** Автоматически при монтировании Terminal
- **Файл:** `src/components/Terminal.tsx`

```typescript
// Пример сохранения
const { saveCommandHistory } = useLocalStorageGame();
saveCommandHistory(['ls', 'cd /home', 'cat flag.txt']);
```

### 3. Основные Миссии
- **Ключ хранилища:** `cybershield_gamestate_{username}`
- **Содержит:**
  - Текущая миссия и её статус
  - Все 10 основных миссий (completed/active флаги)
  - Завершена ли игра
- **Файл:** `src/hooks/useGameEngine.ts`

### 4. Бонусные Миссии (Процедурные)
- **Ключ хранилища:** `cybershield_procedurals_{username}`
- **Содержит:**
  - Список сгенерированных процедурных миссий
  - Активная миссия
  - Количество завершённых
- **Восстановление:** Автоматически при загрузке BonusMissions компонента
- **Файл:** `src/hooks/useProceduralMissions.ts`

```typescript
// Пример восстановления
const { missions, currentMission, completedCount } = useProceduralMissions();
```

### 5. Файловая Система
- **Ключ хранилища:** `cybershield_gamestate_{username}`
- **Содержит:** Полное дерево файлов и директорий системы
- **Восстановление:** При каждом действии с файлами (создание, удаление, etc)
- **Файл:** `src/hooks/useGameEngine.ts`

### 6. Процессы
- **Ключ хранилища:** `cybershield_gamestate_{username}`
- **Содержит:** Список всех процессов в системе
- **Восстановление:** При каждом изменении (kill команда)
- **Файл:** `src/hooks/useGameEngine.ts`

### 7. Текущий Путь в Системе
- **Ключ хранилища:** `cybershield_gamestate_{username}`
- **Содержит:** Текущая директория пользователя
- **Восстановление:** Автоматически при загрузке
- **Файл:** `src/hooks/useGameEngine.ts`

### 8. Статистика Игры
- **Ключ хранилища:** `cybershield_gamestate_{username}` и `cybershield_progress_{username}`
- **Содержит:**
  - Количество выполненных команд (commandCount)
  - Количество ошибок (errorCount)
  - Время начала игры (gameStartTime)
- **Файл:** `src/hooks/useGameEngine.ts`

### 9. Достижения
- **Ключ хранилища:** `cybershield_progress_{username}`
- **Содержит:** ID открытых достижений
- **Восстановление:** Автоматически при загрузке AchievementPanel
- **Файл:** `src/hooks/useProgressSync.ts`

### 10. Настройки Звука
- **Ключ хранилища:** `cybershield_audio_{username}`
- **Содержит:** Статус отключения звука (isMuted)
- **Восстановление:** Автоматически при инициализации аудио
- **Файл:** `src/lib/stores/useAudio.tsx`

## Архитектура Сохранения

### Основные Хуки

1. **useLocalStorageGame.ts** (новый)
   - Центральный интерфейс для всех localStorage операций
   - Предоставляет методы для сохранения/загрузки конкретных данных
   - Обрабатывает ошибки и валидацию

2. **useGameEngine.ts** (обновлён)
   - Автоматически сохраняет состояние при каждом изменении
   - Загружает сохранённое состояние при инициализации
   - Использует встроенный localStorage (не использует новый хук)

3. **useProceduralMissions.ts** (обновлён)
   - Загружает процедурные миссии при инициализации
   - Сохраняет при создании/завершении миссии

4. **useAudio.tsx** (обновлена)
   - Загружает состояние мута при инициализации
   - Сохраняет при переключении

5. **useProgressSync.ts** (обновлён)
   - Управляет статистикой и достижениями
   - Методы для полного сохранения/загрузки состояния

## Как Использовать

### Загрузка Данных
```typescript
import { useLocalStorageGame } from '@/hooks/useLocalStorageGame';

function MyComponent() {
  const { loadCommandHistory, loadCurrentPath, loadGameData } = useLocalStorageGame();
  
  // Загрузить историю команд
  const history = loadCommandHistory();
  
  // Загрузить текущий путь
  const path = loadCurrentPath();
  
  // Загрузить все данные
  const allData = loadGameData();
}
```

### Сохранение Данных
```typescript
const { saveCommandHistory, saveCurrentPath, saveGameData } = useLocalStorageGame();

// Сохранить команды
saveCommandHistory(['ls', 'cd /tmp']);

// Сохранить путь
saveCurrentPath('/home/user/documents');

// Сохранить всё
saveGameData({
  terminalHistory: [...],
  missions: [...],
  commandCount: 42
});
```

### Очистка Данных
```typescript
const { clearGameData } = useLocalStorageGame();
clearGameData(); // Удалить все данные текущего пользователя
```

## Поток Данных

```
┌─────────────────────┐
│ User Action         │
│ (команда, файл...)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│ Game Store (Zustand)    │
│ (useGameEngine, etc)    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ localStorage Hook               │
│ (useLocalStorageGame,           │
│  useProgressSync, useAudio)     │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Browser localStorage             │
│ (cybershield_game_{username}_...)│
└──────────────────────────────────┘
```

## Производительность

- **Сохранение:** Синхронное (JSON.stringify + localStorage.setItem)
- **Загрузка:** Синхронное (localStorage.getItem + JSON.parse)
- **Лимит данных:** ~5-10MB на источник (обычно достаточно)
- **Оптимизация:** 
  - Дебаунсирование сохранений не требуется (данные маленькие)
  - Все операции происходят отдельно для каждого пользователя

## Отладка

### Просмотр Данных в DevTools
```javascript
// Открыть DevTools (F12) → Application → Local Storage
// Или в Console:
Object.keys(localStorage).filter(k => k.includes('cybershield'))
localStorage.getItem('cybershield_progress_username')
JSON.parse(localStorage.getItem('cybershield_gamestate_username'))
```

### Очистка LocalStorage
```javascript
// В Console:
Object.keys(localStorage)
  .filter(k => k.includes('cybershield'))
  .forEach(k => localStorage.removeItem(k));
```

### Логирование
Все операции логируются в Console с префиксом `[useLocalStorageGame]`, `[useGameEngine]`, и т.д.

## Безопасность

⚠️ **Важно:** localStorage НЕ защищён от XSS атак!
- Не сохраняйте конфиденциальные данные (пароли, токены)
- Используйте для игровых данных только
- Для аутентификации используйте `httpOnly cookies`

## Совместимость

- ✅ Chrome, Firefox, Safari, Edge
- ✅ IE 8+
- ❌ Работает только по HTTPS (в продакшене)
- ✅ Работает на localhost для разработки

## Миграция / Обновления

Если структура данных изменится в будущем:
1. Добавить версию в `GAME_STATE_VERSION`
2. Добавить миграционную функцию
3. Проверить версию при загрузке
4. Преобразовать старые данные в новый формат

Пример:
```typescript
if (savedState.version < 2) {
  // Мигрировать данные
  savedState = migrateV1toV2(savedState);
}
```
